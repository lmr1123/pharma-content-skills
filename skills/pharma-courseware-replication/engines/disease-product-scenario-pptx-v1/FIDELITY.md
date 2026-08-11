# FIDELITY.md — 绿引擎金样保真对照（穿心莲 18 页）

> 引擎：`disease-product-scenario-pptx-v1/export.mjs`（pptxgenjs，自包含）
> 金样真源：生产仓 `production-library/validation/courseware/disease-product-scenario-v1/qa-editable/slide-NN.{png,layout.json}`
> 差分表：`workspace/runs/chuanxinlian-fidelity-qa/FIDELITY-DIFF.md`（18 页 🔴/🟡/🟢 + 对照图）
> 最近对齐：2026-08-11（18/18 排版拓扑一致，无 🔴）  
> **行内强调 / 字阶交付**：同日已按可编辑金样 PPTX 收敛（`blankLine`、绿底条去重、p16 标题加粗、p17 首行标红等）；交付产物见下方 Workbuddy 入口。

## 验证方法（重要）— 真源分层（2026-08-11 纠正）

| 维度 | 权威真源 | 说明 |
|------|----------|------|
| **几何 / 拓扑 / bbox** | gold `slide-NN.layout.json` + qa PNG | 卡片位置、变体拓扑 |
| **交付字号（打开 PPT 看到的）** | **可编辑金样 PPTX 内嵌 `a:sz`** | 用户验收以此为准 |
| **代码字面 size** | design unit（≈ layout `resolvedFontSize`） | 经 `tokens.type_scale.design_to_delivery`（**0.75**）写入 PPTX |

**禁止再犯：** 只把 layout.json 的 27/21 写进 PPTX 却声称「对齐金样」——可编辑重建版内嵌字号是设计值的 **0.75 倍**（chrome 标题 20.25 而非 27）。扩题观感应对齐**可打开的金样 PPTX**。

1. **出片后必跑** `node verify-type-scale.mjs --candidate <out.pptx> [--gold <可编辑重建版.pptx>]`（median 与 slide2 首段字号相对金样 |ratio−1|≤4%）。
2. **几何**仍可对 layout.json / pair PNG；**字阶**以 verify 脚本 + 打开 PPT 为准，不以 layout `resolvedFontSize` 直接当交付 pt。
3. **文本颜色**：inspection.ndjson 不含 run 颜色 → PIL 对 gold PNG 采样（`sum(p)<620` 取众数）。
4. **PNG 渲染差分**仅作拓扑/颜色/插图辅助：无雅黑时 LO 替代字体更宽 → 换行溢出是环境差异；**不要**为塞字再改 `design_to_delivery`。
5. 渲染管线：`soffice --headless --convert-to pdf` + `pdftoppm -png -r 96`。

## 金样变体触发器（opt-in，数据驱动）

所有金样拓扑都是**数据字段触发的变体**；换题脚本（如可可康）不带金样变体字段时走原路径，回归不受影响。  
默认演示样例：`samples/gold-chuanxinlian.script.json`（真题；中性假数据样例已移除）。  
else 原路径回归夹具：`samples/kekang-lingzhi.script.json`（真题，不含图片二进制；改引擎后必跑，pages=18 且 forbidden=0）。

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

## Workbuddy / 本机验收入口（2026-08-11）

```bash
# 出片（本机需有裁图绝对路径；他机缺图 → 薄荷绿【图位】）
cd skills/pharma-courseware-replication/engines/disease-product-scenario-pptx-v1
node export.mjs \
  --data samples/gold-chuanxinlian.script.json \
  --out ../../../workspace/runs/chuanxinlian-fidelity-qa/output/chuanxinlian-fidelity-delivery-scale.pptx

# 字阶门禁（对照可编辑金样 PPTX）
node verify-type-scale.mjs \
  --candidate ../../../workspace/runs/chuanxinlian-fidelity-qa/output/chuanxinlian-fidelity-delivery-scale.pptx \
  --gold <生产仓>/…/穿心莲内酯滴丸_商品培训课件2_可编辑重建版.pptx

# 换题回归（opt-in 变体不得破坏）
node export.mjs --data samples/kekang-lingzhi.script.json --out /tmp/kekang-reg.pptx
```

| 角色 | 路径 |
|------|------|
| **交付 PPT（打开验收）** | `workspace/runs/chuanxinlian-fidelity-qa/output/chuanxinlian-fidelity-delivery-scale.pptx` |
| 金样 script | `engines/…/samples/gold-chuanxinlian.script.json` |
| 可编辑金样 PPTX | 生产仓 `…/settled/disease-product-scenario-v1/穿心莲…_可编辑重建版.pptx` |
| 差分表 | `workspace/runs/chuanxinlian-fidelity-qa/FIDELITY-DIFF.md` |

**run 字段约定：** `{text,bold?,color?,breakLine?,blankLine?}`；`blankLine`=段后空行（金样 `\n\n`）。表格单元格可用 `{text,emphasis:true}` 红粗。

## 已知可接受差异（🟡）

- p17 信息表数据行统一 design→delivery 后约 fs12.75 档；gold 个别格略大（差约 1–2pt design），不单独改表。
- gold 页 18 表头 B 列偶发自动缩排；引擎统一字号。
- 无雅黑时 LO 渲染换行 ⚠️font 属环境差，不是引擎回归失败。

## 红线（不得回退）

- `GOLD_FORBIDDEN` 硬阻断是**正确行为**：非金样 theme_id 写入穿心莲医学关键词必须失败。金样验收用 `meta.gold_sample: true` + `theme_id: theme.product.andrographolide-drop-pills`。
- 金样包装/症状/对照真图走**本机绝对路径**，不进 git。
- `--font-patch` 默认关（WPS 兼容），仅 opt-in。
- 引擎自包含：不得 runtime 依赖 monorepo / `@oai/artifact-tool`（只对照其坐标字号）。
