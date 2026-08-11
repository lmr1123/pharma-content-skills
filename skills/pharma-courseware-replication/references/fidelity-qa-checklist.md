# 签样课型保真验收清单（绿 · 疾病+商品场景）

> 用途：引擎升级后、以及**模式 1 沉淀完成前**勾选。  
> 完整任务与真源路径：仓库 `docs/HANDOVER-2026-08-11-fidelity-upgrade.md`。  
> 变体触发器与验证方法：`engines/disease-product-scenario-pptx-v1/FIDELITY.md`。  
> 穿心莲 18 页差分结论：`workspace/runs/chuanxinlian-fidelity-qa/FIDELITY-DIFF.md`（2026-08-11，无 🔴）。

## 对照物

| 角色 | 路径 |
|------|------|
| 视觉真源 | 生产仓 `…/disease-product-scenario-v1/qa-editable/slide-NN.{png,layout.json}`（几何/字阶权威） |
| 当前引擎 | `engines/disease-product-scenario-pptx-v1/export.mjs` + `tokens.json` |
| 出片 | `node export.mjs --data <script.json> --out <out.pptx>` |
| 渲染差分 | `soffice --headless --convert-to pdf` + `pdftoppm -png -r 96`，左 gold 右保真拼图 |

> ⚠️ 无 Microsoft YaHei 的机器上 LibreOffice 替代字体更宽，文本换行/溢出是环境差异；字阶以 layout json 比对为准，**不要为塞下文本缩字号**。

## 全局（chrome / 字 / 色）

- [ ] 画布 13.333×7.5 in（1280×720 px @96）
- [ ] 字体默认微软雅黑（或 tokens 声明字体），标题加粗层级清晰
- [ ] chrome 节号块：深绿底白字，字号对齐生产（目标 ~20pt）
- [ ] chrome 标题：深墨色，字号对齐生产（目标 ~27pt），非发灰小字
- [ ] chrome 绿强调短条 + 分隔线位置接近金样
- [ ] 品牌右上：secondary 绿，不抢主标题
- [ ] 页脚「仅限内部」+ 页码可读
- [ ] 主绿 `#009900` / 深绿 `#066A2F` 用于重点，不是随机装饰色
- [ ] 重点红 `#E60012` 仅用于警示/禁忌类，不滥涂

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
- [x] 字阶逐页经 layout json `resolvedFontSize` 核实（仅 p17 数据行 2pt 统一化、p18 表头 B 列自动缩排差异）
- [x] 文本/填充色经 gold PNG 像素采样核实（含 #33413A 软墨、#E60012 强调红、双色板 #00B98F/#2F8AFF）
- [x] 插图全部就位；金样真图走本机绝对路径不进 git
- [x] 可可康回归：18 页出片、0 缺图、0 违禁命中（变体全部 opt-in，旧路径不受影响）

## 沉淀声明

仅当以上勾选完成，方可在 `template-manifest.md` 写：

```text
fidelity: gold-aligned-v1   # 或注明仍为 path-only
engine: .../disease-product-scenario-pptx-v1
```

`path-only` = 能出片；`gold-aligned-v1` = 过本清单。
