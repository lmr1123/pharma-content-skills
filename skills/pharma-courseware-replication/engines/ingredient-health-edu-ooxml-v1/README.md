# 产线 B · OOXML 金样换槽（成分健康科普 / 康爱森类）

**不是** pptxgenjs 重画。金样 = 原片 OOXML；换题 = 克隆后换文字/图槽。

## 依赖

- Node 18+
- `@oai/artifact-tool`：本机通过 `vendor/artifact-tool` 符号链接到生成仓安装，或设 `ARTIFACT_TOOL_ROOT`

```bash
# 制作机示例（已链到 chain-pharmacy-content-studio 的 artifact-tool）
ls vendor/artifact-tool/dist/artifact_tool.mjs
```

## 金样

- `gold/金样.pptx`（SHA 与 settled 康爱森金样一致）
- 业务新参考：先 `deposit_ooxml_gold.py` 归档到 `workspace/templates/`，正式换槽前把金样拷入本引擎或 `--source` 指向

## 换题完整顺序（正式交付）

```text
1 填文字 theme（emit-draft → 改字）
2 emit-image-plan → 素材计划（约 69 槽）
3 按 style-pack 生图（透明 PNG，米白番茄红气质）——禁止门店活力默认
4 bind_ooxml_assets.py 绑定 assets/
5 approval + formal export（全部图槽，清掉金样图）
```

`preview-text-only` **只证明版式壳**，图片仍是金样 → **不得**当「辅酶Q10 扩展完成」。

## 命令

```bash
# 1) 文字槽草稿
node export.mjs --emit-draft samples/draft-theme.json \
  --theme-name "辅酶Q10健康科普" --theme-id demo.q10

# 2) 图槽素材计划（必做）
node export.mjs --image-plan samples/image-plan.json --theme-name "辅酶Q10健康科普"
# → image-plan.json + image-plan.md + 每槽 prompt

# 3) 仅版式预览（图未换！）
node export.mjs --theme path/to/theme.json --out out/preview.pptx --preview-text-only

# 4) 绑定 PNG 后正式出片
python3 ../../scripts/bind_ooxml_assets.py \
  --theme theme.json --plan samples/image-plan.json \
  --assets-dir ./assets --out theme.bound.json
# 填 asset_authorization + approval 后：
node export.mjs --theme theme.bound.json --out out/final.pptx \
  --qa out/qa --report out/report.json --approval approval.json
```

画风：`style-pack/ILLUSTRATION_PROMPTS.md` + `design.md` + `tokens.json`  
Skill 封装：`scripts/ooxml_b_pipeline.sh`