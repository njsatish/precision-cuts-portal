#!/usr/bin/env bash
set -euo pipefail
[ "$#" -eq 2 ] || { echo "Usage: tools/create_booksy_project.sh CONFIG_JSON OUTPUT_DIRECTORY" >&2; exit 1; }
CONFIG_SOURCE="$1"; OUTPUT="$2"; ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
[ -f "$CONFIG_SOURCE" ] || { echo "ERROR: Missing config: $CONFIG_SOURCE" >&2; exit 1; }
[ ! -e "$OUTPUT" ] || { echo "ERROR: Output exists: $OUTPUT" >&2; exit 1; }
python3 "$ROOT/tools/validate_portal_config.py" "$CONFIG_SOURCE"
mkdir -p "$OUTPUT"
(cd "$ROOT" && tar --exclude='.git' --exclude='.DS_Store' --exclude='node_modules' --exclude='public-site/assets/config/portal.json' -cf - .) | (cd "$OUTPUT" && tar -xf -)
mkdir -p "$OUTPUT/public-site/assets/config"; cp "$CONFIG_SOURCE" "$OUTPUT/public-site/assets/config/portal.json"
(cd "$OUTPUT" && python3 tools/generate_portal_config.py && git init && git add -A && git commit -m "Initialize configurable Booksy portal")
echo "SUCCESS: Created $OUTPUT"
