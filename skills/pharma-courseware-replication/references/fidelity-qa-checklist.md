# 签样课型保真验收清单（绿 · 疾病+商品场景）

> 用途：引擎升级后、以及**模式 1 沉淀完成前**勾选。  
> 完整任务与真源路径：仓库 `docs/HANDOVER-2026-08-11-fidelity-upgrade.md`。  
> 变体触发器与验证方法：`engines/disease-product-scenario-pptx-v1/FIDELITY.md`。  
> 穿心莲 18 页差分结论：`workspace/runs/chuanxinlian-fidelity-qa/FIDELITY-DIFF.md`（2026-08-11，无 🔴）。

## 对照物（真源分层）

| 角色 | 路径 |
|------|------|
| **交付字号权威** | 生产仓 `…/穿心莲…_可编辑重建版.pptx`（打开 PPT 的 `a:sz`） |
| 几何/拓扑 | `…/qa-editable/slide-NN.{png,layout.json}`（bbox；layout 字号是 design unit） |
| 当前引擎 | `engines/disease-product-scenario-pptx-v1/export.mjs` + `tokens.json`（`design_to_delivery: 0.75`） |
| 出片 | `node export.mjs --data <script.json> --out <out.pptx>` |
| **字阶门禁** | `node verify-type-scale.mjs --candidate <out.pptx> --gold <可编辑重建版.pptx>` |
| 渲染差分 | `soffice` + `pdftoppm`，左 gold 右保真（拓扑/色；字阶以 verify 为准） |

> ⚠️ **layout.json 的 27pt ≠ 可编辑 PPT 的 27pt。** 可编辑金样内嵌约 ×0.75（页标题约 **20.25**）。无雅黑时 LO 替代字体更宽是环境差，不要为塞字改 scale。

## 全局（chrome / 字 / 色）

- [ ] 画布 13.333×7.5 in（1280×720 px @96）
- [ ] 字体默认微软雅黑（或 tokens 声明字体），标题加粗层级清晰
- [ ] **`verify-type-scale.mjs` PASS**（median + slide2 相对可编辑金样）
- [ ] chrome 节号：深绿底白字，**打开后约 15pt**（design 20 ×0.75）
- [ ] chrome 标题：深墨色，**打开后约 20.25pt**（design 27 ×0.75），非 layout 的 27 直接写入
- [ ] chrome 绿强调短条 + 分隔线位置接近金样
- [ ] 品牌右上：secondary 绿，不抢主标题
- [ ] 页脚「仅限内部」+ 页码可读
- [ ] 主绿 `#009900` / 深绿 `#066A2F` 用于重点，不是随机装饰色
- [ ] 重点红 `#E60012` 仅用于警示/禁忌类，不滥涂
- [ ] 加粗 / 标红 run 仍在；只缩交付 scale，不删强调逻辑

## 关键帧（沉淀最低五帧）

| 帧 | 页型 | 检查 |
|----|------|------|
| 封面 | cover | 左右 cover_teal / cover_blue；主标题够大；包装/主视觉框位置 |
| 目录 | agenda | 序号强调色；条目层级；与金样目录气质一致 |
| 知识 | disease_definition 或 symptoms | 图文比例、卡片圆角、标题色 |
| 商品 | advantages 或 product_info | 重点功效色、列表密度 |
| 场景 | scenario | 对话角色色、推荐条主绿 |

- [ ] 五帧均 🟢 或仅有业务已知可接受的 🟡  
- [ ] 无整页「通用灰卡壳」观感  

## 插图

- [ ] 知识插画同一画风：默认 `illustration-medical-flat-color-v1`（彩色多色）
- [ ] **非**全绿 monochrome / 深绿线稿唯一色
- [ ] 包装为业务真图或明确命名占位，无假包装
- [ ] 非金样主题未复用穿心莲症状/包装像素

## 换题回归

- [ ] 真题 sample `gold-chuanxinlian.script.json` 可出片（他机无真图 → 占位框 + missing 计数，属预期）  
- [ ] else 原路径回归夹具 `samples/kekang-lingzhi.script.json` 可出片（pages=18 且 forbidden=0；无图片二进制 → 15 张占位属预期）且 chrome 仍正确  
- [ ] 未打开 `GOLD_FORBIDDEN` 误伤金样验收 theme  


## 打开兼容

- [ ] Keynote / PowerPoint / LibreOffice 至少一种可打开  
- [ ] 若需交 WPS：已 LO 重存；默认未强制 font-patch  

## 金样级差分（穿心莲 18 页 · 2026-08-11 已验收）

- [x] 18/18 页排版拓扑与 gold 一致（差分表无 🔴；8 页原 🔴 已由数据触发的金样变体修复：6/7/8/9/12/16/17/18）
- [x] **交付字阶**以可编辑金样 PPTX 为准：`tokens.design_to_delivery=0.75` + `verify-type-scale.mjs`
- [x] **行内强调**（加粗/标红/`blankLine`/绿底条去重/p16 宜忌标题/p17 胆红素首行）与可编辑金样对齐
- [x] 文本/填充色经 gold PNG 像素采样核实（含 #33413A 软墨、#E60012 强调红、双色板 #00B98F/#2F8AFF）
- [x] 插图全部就位；缺图出【图位】；金样真图走本机绝对路径不进 git
- [x] 可可康回归：18 页出片、forbidden=0（变体全部 opt-in）

### Workbuddy 快速测

1. 打开 `workspace/runs/chuanxinlian-fidelity-qa/output/chuanxinlian-fidelity-delivery-scale.pptx`
2. 对照可编辑金样：`…/穿心莲内酯滴丸_商品培训课件2_可编辑重建版.pptx`
3. 重点扫：字号体感、p4 段空行、p5 绿底条不重复、p7 禁用标红、p11 标签加粗、p14–17 图与强调

## 沉淀声明

仅当以上勾选完成，方可在 `template-manifest.md` 写：

```text
fidelity: gold-aligned-v1   # 或注明仍为 path-only
engine: .../disease-product-scenario-pptx-v1
```

`path-only` = 能出片；`gold-aligned-v1` = 过本清单。
