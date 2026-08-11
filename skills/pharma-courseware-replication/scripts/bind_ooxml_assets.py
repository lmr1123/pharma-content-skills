#!/usr/bin/env python3
"""Bind PNG assets folder into OOXML theme.json for formal export.

Usage:
  python3 scripts/bind_ooxml_assets.py \\
    --theme path/theme.json \\
    --plan path/image-plan.json \\
    --assets-dir path/assets \\
    --out path/theme.bound.json

Expects PNG files named {asset_key}.png (or any path listed in plan file_hint basename).
Fills theme.assets and every page.images / template_images key.
Does NOT generate images — only binds files that already exist.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--theme", required=True)
    ap.add_argument("--plan", required=True)
    ap.add_argument("--assets-dir", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    theme = json.loads(Path(args.theme).read_text(encoding="utf-8"))
    plan = json.loads(Path(args.plan).read_text(encoding="utf-8"))
    assets_dir = Path(args.assets_dir)
    if not assets_dir.is_dir():
        print(f"ERROR: assets dir missing: {assets_dir}", file=sys.stderr)
        return 2

    slots = plan.get("slots") or []
    assets: dict[str, str] = {}
    missing: list[str] = []
    for slot in slots:
        key = slot["asset_key"]
        candidates = [
            assets_dir / f"{key}.png",
            assets_dir / Path(slot.get("file_hint") or f"{key}.png").name,
        ]
        found = next((p for p in candidates if p.is_file()), None)
        if not found:
            missing.append(key)
            continue
        # relative path from theme out dir parent is unstable; store absolute for engine resolve
        assets[key] = str(found.resolve())

    # Build shape_id → asset_key maps per slide
    by_slide: dict[int, dict[str, str]] = {}
    template_map: dict[str, str] = {}
    for slot in slots:
        if slot.get("slide") is None and slot.get("key"):
            if slot["asset_key"] in assets:
                template_map[slot["key"]] = slot["asset_key"]
            continue
        slide = int(slot["slide"])
        by_slide.setdefault(slide, {})[str(slot["shape_id"])] = slot["asset_key"]

    theme["assets"] = assets
    theme.setdefault("template_images", {})
    for k, asset_key in template_map.items():
        theme["template_images"][k] = asset_key

    for page in theme.get("pages") or []:
        slide = int(page.get("slide") or 0)
        id_map = by_slide.get(slide) or {}
        images = page.setdefault("images", {})
        for shape_id, asset_key in id_map.items():
            if asset_key in assets:
                images[str(shape_id)] = asset_key

    # authorization stub for formal (agent must set real values before formal)
    auth = theme.setdefault("asset_authorization", {})
    if auth.get("confirmed") is not True:
        auth.setdefault("confirmed", False)
        auth.setdefault("authorized_by", "")
        auth.setdefault("authorization_reference", "")
        auth.setdefault("scope", "all-theme-images")

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(theme, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    report = {
        "ok": len(missing) == 0,
        "bound": len(assets),
        "total_slots": len(slots),
        "missing": missing,
        "out": str(out),
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if not missing else 2


if __name__ == "__main__":
    sys.exit(main())
