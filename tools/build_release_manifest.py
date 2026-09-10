from __future__ import annotations

import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "release-manifest.sha256"
INCLUDE_ROOT = {"index.html", "arquitectura.html", "excepciones.html", "pedidos.html", "trazabilidad.html"}
INCLUDE_DIRS = {"assets", "arquitectura", "excepciones", "pedidos", "trazabilidad", "demo", "manual-assets"}

files: list[Path] = []
for path in ROOT.rglob("*"):
    if not path.is_file() or path == OUT:
        continue
    rel = path.relative_to(ROOT)
    if rel.name in {".DS_Store"} or "__pycache__" in rel.parts:
        continue
    if len(rel.parts) == 1 and rel.name in INCLUDE_ROOT:
        files.append(path)
    elif rel.parts[0] in INCLUDE_DIRS:
        files.append(path)

lines = []
for path in sorted(files, key=lambda p: p.as_posix()):
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    lines.append(f"{digest}  {path.relative_to(ROOT).as_posix()}")
OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"MANIFEST_WRITTEN files={len(lines)} path={OUT.name}")
