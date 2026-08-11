# Lessons · pharma-content-skills

记录业务纠正与设计取舍。新条目追加在末尾。

## 2026-08-10 · 建仓取舍

- 复刻能力独立成仓，避免业务背负内容工作室整仓复杂度。
- 参考源由业务指定；历史金样不是唯一标准。
- 多能力用多 Skill 接力，不用一个巨型 Skill。

## 2026-08-10 · v0.2 范围确认

- 交付物升级为 **模板包 + 可打开 PPTX**（代理直接出完整 PPTX）。
- 插图：AI 生成进本机 `workspace`；包装仍业务真图。
- 业务模板实例 **仅本机 workspace**，Skill 内沉淀方法 + 课型蓝图。
- 金样「穿心莲场景课」「参课蓝健康课」拆成 `course-types/*` 蓝图，不拷贝 PPT 二进制进 Skill。
- 仍保持 **一个主 Skill**；话术审/纯缺件表有独立调用量再拆。

## 2026-08-10 · 风格两层纠正（v0.2.1）

- **错：** 把「门店活力」当成整份 PPT 的默认换皮风格，沉淀时覆盖业务认可视觉。  
- **正：**  
  - **PPT 版式/品牌视觉** = 业务认可的参考或品牌要求；同体系内优化，不换皮。  
  - **门店活力** = 仅 **插图/坑位图** 的默认生图画风（缺图、不匹配、或业务明确要补图时）。  
- 结构壳 demo 的暖橙母版 **不代表** 正式沉淀策略；无参考 tokens 时用中性壳烟测。

## 2026-08-10 · 完全独立交付（v0.2.3）

- 本 Skill **不得**依赖或引用其他内容生产仓库路径。  
- 色板/插图以 Skill 内自有 id 交付：`ppt-courseware-green-v1`、`ppt-health-training-blue-v1` 等。  
- 业务交接文档：`docs/business-usage.md`。  
- 色板仍须从业务参考提取；预制包只是课型快捷默认。

## 2026-08-10 · 复用先内容后出片（v0.2.6）

- 模式 2/2b：**禁止**先交空白「待填」文档。  
- 有材料按材料写满；没材料也初始化完整初稿，标「代理起草·待审」。  
- 业务确认或改完后，再生成 PPTX。  
- 草稿 ≠ 医学审定；包装仍禁止假图。

## 2026-08-10 · 复用必须用生产迁入引擎（v0.3.0）

- **错：** 独立 Skill 只做「通用圆角卡片壳」，页内布局/字号/插图与金样完全对不上，却当复用交付。  
- **正：** 两套已签样金样在生产仓已高度复刻 → **把引擎/tokens/插图/填写规范自包含迁入** `engines/`，正式出片走引擎。  
- 穿心莲：`disease-product-scenario-pptx-v1`（布局来自生产 `export.mjs`；渲染改为 pptxgenjs，去掉 artifact-tool 路径依赖）。  
- 参课蓝：整套 `build-editable.mjs` + `assets/` 原样迁入。  
- `scripts/build_pptx.py` 仅未知课型/烟测；**不得**冒充签样课型。  
- 再调版式前先查生产迁入物是否已有，禁止从零重画让业务再一对一验收一遍。  

## 2026-08-11 · 沉淀与复用同一路径（v0.3.1 · 可可康验收）

- 业务认可：可可康两套复用「初步效果还可以，细节后磨」→ **方式要对**，可应用到一切沉淀。  
- **沉淀合格标准** = 模板挂引擎 + 写满 schema 样例 + 引擎能出可打开 pptx；不是只拆页序 markdown。  
- 同课型新主题：只换 JSON/图，不换布局代码。  
- 新版式：新建 engines 课型包，再沉淀 templates。  
- WPS 打不开：默认关字体强制补丁；必要时 LibreOffice 重存。  
- 文档：`docs/deposit-to-reuse.md`。  

## 2026-08-11 · 路径通过 ≠ 穿心莲保真完成

- **错：** 引擎能出 18 页 + 可可康「初步可以」= 穿心莲复刻完成。  
- **正：** 业务明确还有 **排版 / 字体 / 标题与重点色 / 插画风格** 大差距；要 **对着金样差分升级引擎**。  
- Skill 绿引擎相对生产 export 存在**系统字阶缩小**（chrome 标题 22 vs 27、封面主标题 32 vs 40 等）——移植 pptxgenjs 时引入，优先修。  
- `gold-layout.inspect.ndjson` 与当前数据驱动页拓扑可能不一致（如目录竖列 vs 2×2 卡）；改拓扑前先确认签样对象，默认观感跟金样、字段仍走 schema。  
- **保真方法必须沉淀进 Skill**（checklist + tokens + export），否则模式 1 新 PPT 只能复制「能出片」不能复制「像金样」。  
- 交接全文：`docs/HANDOVER-2026-08-11-fidelity-upgrade.md`。  

## 2026-08-11 · 保真差分方法（穿心莲 18 页）

- **几何**以 gold layout json / qa PNG 为权威（bbox、拓扑）；**交付字号**以**可编辑金样 PPTX 内嵌 sz** 为权威（见下条纠正）。
- 无 Microsoft YaHei 的机器：LibreOffice 替代字体更宽 → 渲染换行/溢出是**环境差异**，不要缩字号去塞；装了雅黑即消失。
- 金样拓扑回灌引擎用**数据触发的 opt-in 变体**（variant 字段/特征字段），换题脚本（可可康）走原路径，回归零风险。
- 表格类金样三件套：`{text,emphasis}` 强调单元格、同值合并单元格、行级 height/size/fill/color 覆盖。

## 2026-08-11 · 字阶真源分层（根本纠正）

- **现象：** 业务扩题时旧引擎字号（chrome≈22）几乎贴金样；保真升级按 layout.json/生产 export 抬到 27/21 后「字体好大」。
- **根因：** 存在两套数字——(1) layout `resolvedFontSize` / 生产 export 字面量 = design unit；(2) **可编辑重建版.pptx 内嵌 sz = design × 0.75**。升级只验 (1)，用户打开的是 (2)。
- **正：**
  - **打开 PPT 的观感** = 可编辑金样 PPTX（交付 SSOT）。
  - 代码可保留 design unit 字面量；`addText` 经 `tokens.type_scale.design_to_delivery`（**0.75**）**唯一出口**换算。
  - 门禁：`node verify-type-scale.mjs --candidate out.pptx --gold 可编辑重建版.pptx`，禁止再只对 layout 抬字号。
  - 几何仍跟 layout；加粗/标红/拓扑变体保留，只校正交付 scale。
- **错：** 把「Skill 比生产 export 小」当成缺陷无脑放大；或文档写「字阶以 layout 为准」却让业务对照可编辑 PPT。

## 2026-08-11 · 业务默认不要中性假数据 + 插图不要全绿

- **错：** 绿课型默认 `neutral-theme`（示例证候A）+ `illustration-medical-flat-green-v1` 深绿线稿。  
- **正：** 默认真题 `gold-chuanxinlian.script.json`（对标蓝真实病种）；知识插图默认 `illustration-medical-flat-color-v1`（母版可绿、图须彩色）。  
- 中性假数据壳已删除；换题回归用真实业务 script（如可可康），不是虚构壳。  

## 2026-08-11 · 声称的运行行为必须实测（soft-missing 崩溃）

- **错：** 评估他人提交时凭代码注释（"soft-missing → placeholders"）就断言「他机跑 gold 样例会显示占位框」，没真跑。实际缺图直接崩在 pptxgenjs write。
- **正：** 评估/文档里写「某输入下引擎会怎样」之前，真的构造那个输入跑一遍（这次 = 把脚本拷到无 assets 的目录跑）。
- 顺带暴露的叠加 bug：`findAssetRefs` 记录缺 `input` 字段（缺图时 addImageSafe 按 input 查找永远 miss）；`hit?.resolved ?? resolved` 对 null 穿透；发现条件只认 `image` 键（`locked_image`/`product_image` 不发现、缺了也不计数）。三处凑齐才崩，单看每处都像对的。

## 2026-08-11 · 金样段间空行 vs 图位

- **错：** run 抽回只写了 `breakLine: true`（单换行），金样可编辑 inspect 实际是 `\n\n`（空段落）；第4页病因/病机、第7页三原则卡都会挤在一起。
- **对：** 段间空行用 `blankLine: true`（引擎展开为 break + 空段落）；列表项之间仍用 `breakLine`。
- **图位：** 第14/16/17 金样有裁图，script 有路径且 delivery 已嵌入；「空且无占位」不正确。缺图必须走 soft-missing 薄荷绿+【图位】，write 失败也要占位。

## 2026-08-11 · 症状页绿底条标题重复

- **错：** 绿底条渲染写一遍 `name`，script `description` 又把 title 当第一 run，结果「口干口渴，喜冷饮」出现两次。
- **对：** description 只写解释句；引擎对「description 以 name 开头」做剥除防御。

## 2026-08-11 · p16 标题加粗 / p17 首行整行标红

- **错：** 日常叮嘱左卡用字符串拼接 title+body，标题无 bold；胆红素表只给含量格 `emphasis`，金样是首行三格全红粗。
- **对：** 左卡 title 独立 bold run；右卡 body 关键句 bold runs；首行三格均 `{text,emphasis:true}`。
- 交付验收片固定：`chuanxinlian-fidelity-delivery-scale.pptx`（Workbuddy）。

## 2026-08-11 · 业务零选择题 + 默认 open + 框架壳不是复刻

- **错：** 开场逼业务「回 1 或 2」；做完只丢路径；把「拆页序/通用壳」当成复刻完成；问业务写用户级还是系统级。  
- **正（v0.3.4）：**  
  1. **零选择题** — 按材料推断模式 1/2，最多一句话确认目标，不展开菜单。  
  2. **默认用户级不覆盖** — 只写 `workspace/`，禁止改 `skills/`。  
  3. **做完默认 open** — 内容初稿与 PPT 就绪后立刻打开给业务复核。  
  4. **复刻颗粒度 = 本仓金样方法** — 引擎 + 写满 JSON + 字阶/runs/拓扑/插图 fit；禁止框架壳。  
- **为何 WorkBuddy 会「只复刻框架」：** 未强制走 `engines/*`+FIDELITY；会话在 structure markdown 停住；或误用通用 PPT 能力；高保真是逐页差分不是一次大纲生成。  
- 文档：`SKILL.md`、`docs/business-usage.md`、`docs/deposit-to-reuse.md` §为何只复刻框架。

## 2026-08-11 · 康爱森番茄红素：pptxgenjs 壳 ≠ 近 100%（v0.3.5）

- **现象：** WorkBuddy 沉淀 `health-popularization-lycopene-v1`，引擎 `health-popularization-v1` 重画 20 页，manifest 竟写 `fidelity: gold-aligned-v1`。  
- **数据对照：** 原片 ~9.9MB / **97 媒体（含 SVG）** / 245 shapes；壳 ~0.4MB / 媒体≈0 / 形状堆砌。  
- **根因：** 把「可换页型的生成器」当成「复刻」；未走生产仓已锁定的 **OOXML 原片金样**（`kangaisen-lycopene-health-edu-v1`：金样=原片，框架重建已 archive）。  
- **正：**  
  1. 富设计参考 → `scripts/deposit_ooxml_gold.py` 归档，`fidelity: gold-aligned-ooxml-v1`。  
  2. **禁止** 新媒体密集片用 pptxgenjs 标 gold-aligned。  
  3. 换题近 100% = 克隆 OOXML 换槽（生产 ingredient-health-edu）；未迁入前诚实说金样 100%、换题另接。  
- 文档：`docs/ooxml-gold-fidelity.md`；失败示范勿再当签样。

## 2026-08-11 · 产线 B 换题必须换图且跟 style_pack

- **现象：** WorkBuddy 用辅酶Q10 扩展：字换了，图仍是金样番茄或另生成的画风不符。
- **根因：** (1) 只用了 `preview-text-only`（设计上不换图）；(2) 生图未走 cream-red style_pack / 透明底，误用门店活力或通用医疗扁平。
- **正：** emit-image-plan → 按 ILLUSTRATION_PROMPTS 生 PNG → bind_ooxml_assets → formal export；preview 不得当交付。
