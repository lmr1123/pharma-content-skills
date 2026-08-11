#!/usr/bin/env bash
# Route formal PPTX builds to production-ported engines.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENGINE="${1:-}"
DATA="${2:-}"
OUT="${3:-}"

usage() {
  cat <<USAGE
Usage:
  # 产线 A · JSON + 引擎
  build_with_engine.sh disease-product-scenario <script.json> <out.pptx>
  build_with_engine.sh disease-health-shenke-blue <content.json> <out.pptx>

  # 产线 B · OOXML 换槽（文字预览；正式全图槽见 engines/.../README.md）
  build_with_engine.sh ingredient-ooxml-preview <theme.json> <out.pptx>
USAGE
  exit 2
}

[[ -n "$ENGINE" && -n "$DATA" && -n "$OUT" ]] || usage
DATA="$(cd "$(dirname "$DATA")" && pwd)/$(basename "$DATA")"
OUT="$(mkdir -p "$(dirname "$OUT")" && cd "$(dirname "$OUT")" && pwd)/$(basename "$OUT")"

case "$ENGINE" in
  disease-product-scenario|green|dps)
    DIR="$ROOT/engines/disease-product-scenario-pptx-v1"
    [[ -d "$DIR/node_modules" ]] || (cd "$DIR" && npm i)
    node "$DIR/export.mjs" --data "$DATA" --out "$OUT"
    ;;
  disease-health-shenke-blue|blue|shenke)
    DIR="$ROOT/engines/disease-health-shenke-blue-v1"
    [[ -d "$DIR/node_modules" ]] || (cd "$DIR" && npm i)
    # build-editable writes next to generator; copy to OUT
    (cd "$DIR" && node build-editable.mjs "$DATA")
    # find newest pptx in DIR
    NEWEST="$(ls -t "$DIR"/*.pptx 2>/dev/null | head -1 || true)"
    if [[ -z "$NEWEST" ]]; then
      echo "ERROR: no pptx produced" >&2
      exit 1
    fi
    cp "$NEWEST" "$OUT"
    echo "Copied $NEWEST -> $OUT"
    ;;
  ingredient-ooxml-preview|ooxml-preview|lycopene-preview)
    DIR="$ROOT/engines/ingredient-health-edu-ooxml-v1"
    node "$DIR/export.mjs" --theme "$DATA" --out "$OUT" --preview-text-only \
      --report "${OUT%.pptx}.report.json"
    ;;
  *)
    usage
    ;;
esac
