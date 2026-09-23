#!/usr/bin/env bash
set -euo pipefail

APP_NAME="kodentra-commander"
APP_DIR="${APP_DIR:-/home/juanma/projects/${APP_NAME}}"
CONFIG_DIR="${CONFIG_DIR:-/home/juanma/.config/${APP_NAME}}"
RELAY_SERVICE="${RELAY_SERVICE:-kodentra-commander-relay.service}"
AGENT_SERVICE="${AGENT_SERVICE:-kodentra-commander-agent-vps.service}"
PORT="${PORT:-8787}"
PUBLIC_HOST="${PUBLIC_HOST:-kodentra-commander.159.195.114.212.nip.io}"
SHARED_INFRA_DIR="${SHARED_INFRA_DIR:-/home/juanma/projects/vps-shared-infra}"
CADDYFILE="${CADDYFILE:-${SHARED_INFRA_DIR}/Caddyfile}"

say(){ printf '[kodentra-bootstrap] %s\n' "$*"; }
die(){ printf '[kodentra-bootstrap] ERROR: %s\n' "$*" >&2; exit 1; }
need(){ command -v "$1" >/dev/null 2>&1 || die "missing required command: $1"; }

need node
need npm
need openssl
need systemctl
need tailscale
need curl
need ss
[[ "$(id -un)" == "juanma" ]] || die "run this bootstrap as user juanma"
node_major="$(node -p 'Number(process.versions.node.split(".")[0])')"
(( node_major >= 20 )) || die "Node.js 20+ required; found $(node --version)"

TAILSCALE_IP="$(tailscale ip -4 | head -n1)"
[[ -n "$TAILSCALE_IP" ]] || die "could not determine VPS Tailscale IPv4"
[[ -f "${APP_DIR}/src/relay.mjs" ]] || die "expected source at ${APP_DIR}; install/copy the package there first"
install -d -m 0700 "$CONFIG_DIR"

relay_env="${CONFIG_DIR}/relay.env"
if [[ ! -f "$relay_env" ]]; then
  mcp_token="$(openssl rand -hex 48)"
  pc1_token="$(openssl rand -hex 48)"
  pc2_token="$(openssl rand -hex 48)"
  vps_token="$(openssl rand -hex 48)"
  umask 077
  cat > "$relay_env" <<ENV
HOST=${TAILSCALE_IP}
PORT=${PORT}
MCP_ACCESS_TOKEN=${mcp_token}
DEVICE_TOKENS_JSON='{"pc1":"${pc1_token}","pc2":"${pc2_token}","vps":"${vps_token}"}'
REQUEST_TIMEOUT_MS=120000
POLL_TIMEOUT_MS=25000
SESSION_TTL_MS=1800000
ENV
  say "generated ${relay_env}"
else
  say "preserving existing ${relay_env}"
fi
chmod 0600 "$relay_env"

# Preserve an existing configured port, but never steal a port owned by another service.
configured_port="$(sed -n 's/^PORT=//p' "$relay_env" | tail -n1)"
[[ -n "$configured_port" ]] && PORT="$configured_port"

port_in_use() {
  ss -H -ltn | awk -v p="$1" '$4 ~ (":" p "$") { found=1 } END { exit !found }'
}

if port_in_use "$PORT" && ! systemctl is-active --quiet "$RELAY_SERVICE" 2>/dev/null; then
  old_port="$PORT"
  selected=""
  for candidate in 18787 28787 38787; do
    if ! port_in_use "$candidate"; then
      selected="$candidate"
      break
    fi
  done
  [[ -n "$selected" ]] || die "ports 18787, 28787 and 38787 are all occupied"
  PORT="$selected"
  python3 - "$relay_env" "$PORT" "$TAILSCALE_IP" <<'PY'
from pathlib import Path
import sys
path = Path(sys.argv[1])
port = sys.argv[2]
host = sys.argv[3]
out = []
seen_port = False
seen_host = False
for line in path.read_text().splitlines():
    if line.startswith("PORT="):
        out.append(f"PORT={port}")
        seen_port = True
    elif line.startswith("HOST="):
        out.append(f"HOST={host}")
        seen_host = True
    else:
        out.append(line)
if not seen_port:
    out.insert(0, f"PORT={port}")
if not seen_host:
    out.insert(0, f"HOST={host}")
tmp = path.with_name(path.name + ".tmp")
tmp.write_text("\n".join(out) + "\n")
tmp.chmod(0o600)
tmp.replace(path)
PY
  say "port ${old_port} already belongs to another service; selected ${PORT}"
fi

vps_token="$(python3 - "$relay_env" <<'PY'
import json,sys
for line in open(sys.argv[1],encoding='utf-8'):
    if line.startswith('DEVICE_TOKENS_JSON='):
        raw = line.split('=',1)[1].strip()
        if len(raw) >= 2 and raw[0] == raw[-1] and raw[0] in ("'", '"'):
            raw = raw[1:-1]
        print(json.loads(raw)['vps'])
        break
else:
    raise SystemExit('DEVICE_TOKENS_JSON missing')
PY
)"
agent_env="${CONFIG_DIR}/agent-vps.env"
umask 077
cat > "$agent_env" <<ENV
RELAY_URL=http://127.0.0.1:${PORT}
DEVICE_ID=vps
DEVICE_TOKEN=${vps_token}
POLLERS=2
DESKTOP_COMMAND=npx --yes @wonderwhy-er/desktop-commander@0.2.51
LOCAL_MCP_TIMEOUT_MS=120000
LOCAL_SESSION_TTL_MS=2100000
ENV
chmod 0600 "$agent_env"

relay_unit="${APP_DIR}/deploy/systemd/kodentra-commander-relay.service"
[[ -f "$relay_unit" ]] || die "missing systemd relay unit: $relay_unit"
sudo install -m 0644 "$relay_unit" "/etc/systemd/system/${RELAY_SERVICE}"

sudo tee "/etc/systemd/system/${AGENT_SERVICE}" >/dev/null <<UNIT
[Unit]
Description=Kodentra Commander VPS Device Agent
After=network-online.target ${RELAY_SERVICE}
Wants=network-online.target
Requires=${RELAY_SERVICE}

[Service]
Type=simple
User=juanma
WorkingDirectory=${APP_DIR}
EnvironmentFile=${agent_env}
ExecStart=/usr/bin/node ${APP_DIR}/src/agent.mjs
Restart=on-failure
RestartSec=2
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=read-only
ReadWritePaths=${APP_DIR} /home/juanma/.npm /home/juanma/.cache

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload
sudo systemctl enable --now "$RELAY_SERVICE"
sudo systemctl enable --now "$AGENT_SERVICE"
sleep 2
systemctl is-active --quiet "$RELAY_SERVICE" || { sudo journalctl -u "$RELAY_SERVICE" -n 100 --no-pager; die "relay service is not active"; }
systemctl is-active --quiet "$AGENT_SERVICE" || { sudo journalctl -u "$AGENT_SERVICE" -n 100 --no-pager; die "VPS agent service is not active"; }
curl -fsS "http://${TAILSCALE_IP}:${PORT}/health" >/tmp/kodentra-commander-health.json
say "local relay health: $(cat /tmp/kodentra-commander-health.json)"

if [[ -f "$CADDYFILE" ]] && command -v docker >/dev/null 2>&1; then
  marker="# KODENTRA_COMMANDER_MANAGED"
  if ! grep -Fq "$marker" "$CADDYFILE"; then
    backup="${CADDYFILE}.bak.$(date +%Y%m%d%H%M%S)"
    cp -a "$CADDYFILE" "$backup"
    cat >> "$CADDYFILE" <<CADDY

${marker}
${PUBLIC_HOST} {
    encode zstd gzip
    reverse_proxy ${TAILSCALE_IP}:${PORT}
    header {
        -Server
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "no-referrer"
    }
}
CADDY
    if docker exec shared-ingress-caddy caddy validate --config /etc/caddy/Caddyfile >/tmp/kodentra-caddy-validate.txt 2>&1; then
      docker exec shared-ingress-caddy caddy reload --config /etc/caddy/Caddyfile
      say "Caddy validated and reloaded for ${PUBLIC_HOST}"
    else
      cp -a "$backup" "$CADDYFILE"
      cat /tmp/kodentra-caddy-validate.txt >&2 || true
      die "Caddy validation failed; original Caddyfile restored"
    fi
  else
    say "Caddy block already present; no duplicate appended"
  fi
else
  say "Caddy integration skipped: ${CADDYFILE} or Docker unavailable"
fi

say "relay=$(systemctl is-active "$RELAY_SERVICE") agent=$(systemctl is-active "$AGENT_SERVICE")"
say "endpoint=https://${PUBLIC_HOST}/mcp/vps"
say "secrets remain only in ${CONFIG_DIR}; do not paste them into chat or commit them"
