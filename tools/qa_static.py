from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
errors: list[str] = []
checks = 0


def check(condition: bool, message: str) -> None:
    global checks
    checks += 1
    if not condition:
        errors.append(message)


react_html = sorted(
    p for p in ROOT.rglob("*.html")
    if "demo" not in p.relative_to(ROOT).parts
)
check(len(react_html) == 21, f"expected 21 React HTML files, got {len(react_html)}")
for path in react_html:
    text = path.read_text(encoding="utf-8")
    rel = path.relative_to(ROOT)
    check("orderflow-prospect.js" not in text, f"{rel}: legacy prospect injector present")
    check("lovable-badge" not in text, f"{rel}: Lovable badge residue present")
    check("r2.dev" not in text, f"{rel}: external Lovable/R2 asset present")
    check("/assets/orderflow-release.js" in text, f"{rel}: release runtime missing")

sales = {
    "claramunt": "Claramunt Food Service",
    "disalvi": "Disalvi",
    "cendis": "Cendis S.A.",
}
required_csp = [
    "default-src 'self'", "script-src 'none'", "connect-src 'none'",
    "object-src 'none'", "base-uri 'none'", "form-action 'none'",
]
for slug, name in sales.items():
    path = ROOT / "demo" / slug / "index.html"
    check(path.exists(), f"{slug}: landing missing")
    if not path.exists():
        continue
    text = path.read_text(encoding="utf-8")
    check(name in text, f"{slug}: prospect name missing")
    check('<meta name="robots" content="noindex,nofollow,noarchive">' in text, f"{slug}: noindex policy missing")
    check("<script" not in text.lower(), f"{slug}: sales landing must contain zero scripts")
    check("<form" not in text.lower(), f"{slug}: sales landing must contain zero forms")
    check("location.replace" not in text, f"{slug}: redirect residue present")
    check('loading="lazy"' in text, f"{slug}: demo iframe must lazy-load")
    check('src="/"' in text and "<iframe" in text, f"{slug}: isolated engine iframe missing")
    check('rel="noopener noreferrer"' in text, f"{slug}: safe external-window rel missing")
    for directive in required_csp:
        check(directive in text, f"{slug}: CSP directive missing: {directive}")
    external = re.findall(r'https?://[^"\'\s<>]+', text)
    check(not external, f"{slug}: external URL(s) found: {external}")

routes = (ROOT / "assets" / "routes-BHnTTOUC.js").read_text(encoding="utf-8")
check('"aria-label":t.name||t.label||`Segmento de gráfico`' in routes,
      "Recharts sector accessible-name hardening missing")

for path in [ROOT / "assets" / "orderflow-sales.css", ROOT / "assets" / "orderflow-release.css"]:
    text = path.read_text(encoding="utf-8")
    check("http://" not in text and "https://" not in text, f"{path.name}: external URL in first-party CSS")

if errors:
    print(f"STATIC_GATE_FAIL {len(errors)} error(s) / {checks} checks")
    for item in errors:
        print(" -", item)
    sys.exit(1)
print(f"STATIC_GATE_PASS {checks}/{checks}")
