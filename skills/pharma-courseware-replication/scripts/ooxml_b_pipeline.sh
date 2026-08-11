#!/usr/bin/env bash
# 产线 B：OOXML 金样 · 抽槽 / 文字预览换题 /（正式换槽另接）
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENGINE="$ROOT/engines/ingredient-health-edu-ooxml-v1"
CMD="${1:-}"
shift || true

usage() {
  cat <<'USAGE'
Usage:
  ooxml_b_pipeline.sh draft  --theme-name "名称" [--out path/theme.json]
  ooxml_b_pipeline.sh preview --theme path/theme.json --out path/preview.pptx
  ooxml_b_pipeline.sh gold-open   # open 金样
USAGE
  exit 2
}

[[ -n "$CMD" ]] || usage
[[ -f "$ENGINE/export.mjs" ]] || { echo "missing engine $ENGINE" >&2; exit 1; }

case "$CMD" in
  draft)
    THEME_NAME=""
    OUT=""
    while [[ $# -gt 0 ]]; do
      case "$1" in
        --theme-name) THEME_NAME="$2"; shift 2 ;;
        --out) OUT="$2"; shift 2 ;;
        *) echo "unknown $1" >&2; exit 2 ;;
      esac
    done
    [[ -n "$THEME_NAME" ]] || { echo "--theme-name required" >&2; exit 2; }
    OUT="${OUT:-$ENGINE/samples/draft-theme.json}"
    mkdir -p "$(dirname "$OUT")"
    node "$ENGINE/export.mjs" \
      --emit-draft "$OUT" \
      --theme-name "$THEME_NAME" \
      --theme-id "draft.$(date +%Y%m%d%H%M%S)" \
      --report "${OUT%.json}.report.json"
    echo "draft: $OUT"
    ;;
  preview)
    THEME=""
    OUT=""
    while [[ $# -gt 0 ]]; do
      case "$1" in
        --theme) THEME="$2"; shift 2 ;;
        --out) OUT="$2"; shift 2 ;;
        *) echo "unknown $1" >&2; exit 2 ;;
      esac
    done
    [[ -n "$THEME" && -n "$OUT" ]] || { echo "--theme and --out required" >&2; exit 2; }
    mkdir -p "$(dirname "$OUT")"
    node "$ENGINE/export.mjs" \
      --theme "$THEME" \
      --out "$OUT" \
      --preview-text-only \
      --report "${OUT%.pptx}.report.json"
    echo "preview: $OUT"
    ;;
  gold-open)
    open "$ENGINE/gold/金样.pptx" 2>/dev/null || true
    ;;
  *)
    usage
    ;;
esac
