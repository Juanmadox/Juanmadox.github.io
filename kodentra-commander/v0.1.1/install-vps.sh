#!/usr/bin/env bash
set -euo pipefail

BASE="https://raw.githubusercontent.com/Juanmadox/Juanmadox.github.io/main/kodentra-commander"
APP_DIR="${APP_DIR:-/home/juanma/projects/kodentra-commander}"
TMP_DIR="$(mktemp -d)"
STAGE="$TMP_DIR/kodentra-commander"
cleanup(){ rm -rf "$TMP_DIR"; }
trap cleanup EXIT

need(){ command -v "$1" >/dev/null 2>&1 || { echo "missing required command: $1" >&2; exit 1; }; }
need curl
need sha256sum
need install

mkdir -p "$STAGE/src" "$STAGE/deploy/systemd" "$STAGE/scripts"
fetch(){ local url="$1" out="$2" sha="$3"; curl -fL --retry 3 --retry-delay 1 --connect-timeout 10 "$url" -o "$out"; echo "$sha  $out" | sha256sum -c -; }

fetch "$BASE/v0.1.0/package.json" "$STAGE/package.json" "967975043d2469e6506a515c43ee38e322e0e3e6c7eaacff8367bdc7529363a0"
fetch "$BASE/v0.1.0/src/common.mjs" "$STAGE/src/common.mjs" "6f512c4a893a8b3b871ca1b0abbc5dfc7b3fe31fea9132dfda4e2b344b7227cb"
fetch "$BASE/v0.1.0/src/relay-core.mjs" "$STAGE/src/relay-core.mjs" "ae08bce231e468f238d39a07358c6e4898d4e0e39aa117db95144ffdc64b014d"
fetch "$BASE/v0.1.0/src/relay.mjs" "$STAGE/src/relay.mjs" "6582d997a81887070abea82048f890ee0736ca5b85bd7b59edaec469b586b9c9"
fetch "$BASE/v0.1.1/src/agent.mjs" "$STAGE/src/agent.mjs" "3814553934bf16a7e66f13e38c54b08db82a572648944ac801ef9751b1b9c678"
fetch "$BASE/v0.1.1/src/stdio-session.mjs" "$STAGE/src/stdio-session.mjs" "177a2e294b694ca25417d1fc61c27b47df15b1a78488a8cbae5292f879d5ad8e"
fetch "$BASE/v0.1.1/deploy/systemd/kodentra-commander-relay.service" "$STAGE/deploy/systemd/kodentra-commander-relay.service" "496eeb567bfd9c61eafa23e6a9d8cf8a42c18988390b6d83e7350fab8159263b"
fetch "$BASE/v0.1.1/deploy/systemd/kodentra-commander-agent.service" "$STAGE/deploy/systemd/kodentra-commander-agent.service" "96057167cceabe7e6413f047ec65715abcccb433c8bce7462a4e45749f7451d0"
fetch "$BASE/v0.1.1/scripts/bootstrap-vps.sh" "$STAGE/scripts/bootstrap-vps.sh" "59de2ead227c263227db020fc7b66543d76e9a3790de38cc16d7dc3221c1a4df"
chmod +x "$STAGE/scripts/bootstrap-vps.sh"

if [[ -e "$APP_DIR" ]]; then
  BACKUP="${APP_DIR}.backup.$(date +%Y%m%d%H%M%S)"
  mv "$APP_DIR" "$BACKUP"
  echo "preserved_previous=$BACKUP"
fi
mkdir -p "$(dirname "$APP_DIR")"
mv "$STAGE" "$APP_DIR"
exec "$APP_DIR/scripts/bootstrap-vps.sh"
