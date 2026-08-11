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

## 命令

```bash
# 1) 从金样抽出全部槽位草稿 theme.json
node export.mjs --emit-draft samples/draft-theme.json \
  --theme-name "辅酶Q10健康科普" --theme-id demo.q10

# 2) 预览换题（只换已填文字，图仍用金样 → 打开看版式近 100%）
node export.mjs --theme path/to/theme.json --out out/preview.pptx --preview-text-only

# 3) 正式换题（107 字槽全非占位 + 69 图 PNG 绑定 + approval）
node export.mjs --theme theme.json --out out/final.pptx \
  --qa out/qa --report out/report.json --approval approval.json
```

Skill 封装：`scripts/ooxml_b_pipeline.sh`
