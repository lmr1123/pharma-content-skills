# 生产级课型引擎（自包含迁入）

本目录从 `chain-pharmacy-content-studio` 的**已签样金样 / 生产引擎**迁入，运行时**不依赖**生产 monorepo 路径。

| 引擎 | 对应金样 | 入口 | 依赖 |
|------|----------|------|------|
| `disease-product-scenario-pptx-v1` | 穿心莲场景课（疾病+商品场景） | `export.mjs` | `npm i`（pptxgenjs） |
| `disease-health-shenke-blue-v1` | 参课蓝健康课 | `build-editable.mjs` | `npm i`（pptxgenjs） |

## 迁入内容

- **版式 / chrome / 字阶 / 色板**：生产引擎布局与 tokens（绿：`tokens.json`；蓝：生成器内 `C`/`T`）
- **插图**：参课蓝整套 `assets/`（重绘知识图 + 包装坑位占位）
- **内容契约**：穿心莲 `input-schema.json` + `disease-product-scenario-script/v1`；蓝：`content/*.content.json`
- **设计参考**：preview 关键帧、`gold-layout.inspect.ndjson`（穿心莲金样布局树）
- **填写说明**：`本课型怎么填.md`

## 明确未迁入 / 降级

| 项 | 说明 |
|----|------|
| `@oai/artifact-tool` | 穿心莲生产原用；Skill 内改为 **pptxgenjs 同布局移植**，见 `export.prod-artifact-tool.mjs` 存档 |
| 金样 PPT 二进制 / 业务包装真图 | 不进仓库；换题用业务授权图 |
| 穿心莲医学正文 | 非 `gold_sample` 输入硬阻断金样关键词；演示用 `samples/neutral-theme.json` |
| PNG 逐页 QA / montage | 原 artifact-tool 能力；现 `--qa` 只写 `generate-report.json` |

## 出片命令

```bash
# 疾病+商品场景（绿）
cd engines/disease-product-scenario-pptx-v1
npm i
node export.mjs --data samples/neutral-theme.json --out /tmp/out.pptx --qa /tmp/qa

# 疾病健康培训（参课蓝）
cd engines/disease-health-shenke-blue-v1
npm i
node build-editable.mjs content/急性上呼吸道感染.content.json
# 或换病：复制 content JSON 改字段后再跑
```

Skill **模式 1 沉淀**与 **模式 2 复用**必须走这里（或新建同类引擎），禁止退回通用壳 `scripts/build_pptx.py` 当正式交付。

## 沉淀如何用上引擎（达到可可康那种复用效果）

详见仓库 `docs/deposit-to-reuse.md`。

| 情况 | 做法 |
|------|------|
| 新主题仍属绿/蓝课型 | **不要**新写布局；模板只指向本目录引擎，换 `script.json` / `content.json` + 图 |
| 新参考是另一套版式 | 新建 `engines/<course-type-id>/`（pptxgenjs 布局 + schema + assets + 填写说明），再沉淀 `workspace/templates/` |
| 出片后 WPS 打不开 | 默认勿开字体强制补丁；用 LibreOffice 重存一版再交 |

**合格沉淀** = 业务换主题时，代理只改内容/图，仍调用同一 `export.mjs` / `build-editable.mjs` 出片。  

## 高保真升级（2026-08-11 已完成 Phase A/B/D）

穿心莲金样 18 页差分**无 🔴**（排版/字阶/颜色/插图逐页对齐；无雅黑机器的字体替代换行属环境差异）。  
变体触发器与验收方法：`disease-product-scenario-pptx-v1/FIDELITY.md`。  
差分表：`workspace/runs/chuanxinlian-fidelity-qa/FIDELITY-DIFF.md`；验收勾选：`../references/fidelity-qa-checklist.md`。  
任务上下文：仓库根 `docs/HANDOVER-2026-08-11-fidelity-upgrade.md`（Phase C 插画规范留待后续）。  
