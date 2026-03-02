#!/usr/bin/env zsh
set -euo pipefail

SCRIPT_DIR="${0:A:h}"
SRC="$SCRIPT_DIR/src"
DIST="$SCRIPT_DIR/dist"
OUT="$DIST/delete-attached-pdfs.xpi"

mkdir -p "$DIST"
rm -f "$OUT"

(cd "$SRC" && zip -r "$OUT" .)

echo "Built: $OUT"
