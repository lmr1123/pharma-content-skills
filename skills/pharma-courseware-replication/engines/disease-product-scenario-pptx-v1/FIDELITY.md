# FIDELITY.md — 绿引擎金样保真对照（穿心莲 18 页）

> 引擎：`disease-product-scenario-pptx-v1/export.mjs`（pptxgenjs，自包含）
> 金样真源：生产仓 `production-library/validation/courseware/disease-product-scenario-v1/qa-editable/slide-NN.{png,layout.json}`
> 差分表：`workspace/runs/chuanxinlian-fidelity-qa/FIDELITY-DIFF.md`（18 页 🔴/🟡/🟢 + 对照图）
> 最近对齐：2026-08-11（18/18 排版拓扑一致，无 🔴）

## 验证方法（重要）

1. **几何/字阶以 gold `slide-NN.layout.json` 为权威**：逐元素比 `bbox` / `resolvedFontSize`。
2. **文本颜色**：inspection.ndjson 不含 run 颜色 → 用 PIL 对 gold PNG 采样（阈值 `sum(p)<620` 取文本像素众数）。
3. **PNG 渲染差分仅作拓扑/颜色/插图辅助**：无 Microsoft YaHei 的机器上 LibreOffice 会用更宽 CJK 替代字体，文本换行/溢出是**环境差异不是引擎缺陷**（字阶经 layout json 核实）。验收时不要把 ⚠️font 当 bug 修（尤其不要为塞下文本而缩字号）。
4. 渲染管线：`soffice --headless --convert-to pdf` + `pdftoppm -png -r 96`；对照图 = 左 gold 右保真 + 36px 标签带。

## 金样变体触发器（opt-in，数据驱动）

所有金样拓扑都是**数据字段触发的变体**；换题脚本（如可可康）不带金样变体字段时走原路径，回归不受影响。  
默认演示样例：`samples/gold-chuanxinlian.script.json`（真题；中性假数据样例已移除）。

| 页 | 触发 | 变体拓扑 |
|----|------|----------|
| 01 封面 | `cover.locked_image` | 整页锁定金样封面图 |
| 02 开篇 | `opening.variant==="thesis"` | 中心论断式 |
| 03 目录 | `pages.agenda.image` | chromeless：左整幅图 cover+右竖排「目 录」+ellipse 序号 chip |
| 04 疾病定义 | `disease.cause`+`pathogenesis` | 定义+病因+病机+总结条 |
| 05 症状 | `disease.symptoms` 5 项（schema maxItems 5） | 5 卡横排 |
| 06 鉴别 | `disease.comparison.memory`(恰3)+`change_note` | 双色板（绿 #00B98F/蓝 #2F8AFF）+口诀三卡+演变条；维度名 `左\|右` 可按板拆分 |
| 07 治疗 | `disease.treatment_summary` | 3 surfaceCard+mint 总结条（原则须恰 3 条） |
| 08 证候 | `pages.subtypes.variant==="split-columns"` | 左绿条卡+临床/治则双栏 |
| 09 产品信息 | `pages.product_info.variant==="panel"` | 左包装图+深绿描边面板标签值行（恰 6 项；`emphasis` 红色） |
| 10 优势 | `pages.advantages.core` + `advantages[].node` 全配 | 中心椭圆（core 文案）+节点圆（X=130/400/680/960 非均分） |
| 11 小结 | `summary.groups` 恰 3 + `pages.product_summary.image` | 三 surfaceCard+中央产品图 |
| 12 人群 | `pages.audience.variant==="arrow-flow"` + `audience[].flows`(1..4) | 红色产品头+包装图+人群筹码+箭头流（右列灰 #777） |
| 13 咨询 | consultation thesis（`pages.consultation` thesis 字段） | 横标+规则线+4 surfaceCard |
| 14/15 场景 | `scenarios[].blocks`(恰3)+`summary` | 三块卡+mint 总结/主绿 talktrack（`image` 可选） |
| 16 叮嘱 | `daily_care` 5 项且前 2 带图其余不带 | 左 2 图+着色卡（ECFFF4/FFF1F1）+右 3 surfaceCard |
| 17 权重明细 | （基础几何已按 gold 重写，无需触发） | 信息表四栏 [90,90,160,125]、胆红素表 [260,120,210]；单元格 `{text,emphasis}` 红粗 |
| 18 权对照 | `comparison.products[].image` | 图片行 `rows[].kind:"images"` + 显式行高 `height` + 行字阶 `size` + 行填充 `fill` + 行色 `color` + 同值合并单元格 + 列宽 `products[].width` |

## 已知可接受差异（🟡）

- 行内强调 run（红/绿加粗）引擎已支持（`addText` run 数组），金样脚本部分页正文仍是纯字符串未逐字转写（p2/4/14/15）。
- p17 信息表数据行统一 fs17；gold 主推/零售价为 fs19（差 2pt）。
- gold 页 18 表头 B 列 fs16（生产侧自动缩排），引擎统一 fs17。

## 红线（不得回退）

- `GOLD_FORBIDDEN` 硬阻断是**正确行为**：非金样 theme_id 写入穿心莲医学关键词必须失败。金样验收用 `meta.gold_sample: true` + `theme_id: theme.product.andrographolide-drop-pills`。
- 金样包装/症状/对照真图走**本机绝对路径**，不进 git。
- `--font-patch` 默认关（WPS 兼容），仅 opt-in。
- 引擎自包含：不得 runtime 依赖 monorepo / `@oai/artifact-tool`（只对照其坐标字号）。
