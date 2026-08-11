---
name: pharma-courseware-replication
version: 0.3.6
description: >
  医药内训课件独立 Skill。业务零选择题；双产线：
  A=JSON+引擎（穿心莲绿/参课蓝换题）；B=OOXML金样换槽（康爱森类，
  engines/ingredient-health-edu-ooxml-v1，禁止 pptxgenjs 壳）。
  归档 deposit_ooxml_gold；预览换题 --preview-text-only；正式换图槽另接。
  做完默认 open。触发词：复刻、换主题、康爱森、番茄红素、OOXML。
---

# 医药课件模板沉淀与批量复用

## 对业务怎么说话（必读 · v0.3.4）

### 硬规则（不可违反）

| # | 规则 |
|---|------|
| R1 | **不要让业务做技术选择题**（禁止开场「回 1 或 2」「选路径 A/B」「要不要高保真」）。业务只交材料与目标；你推断并执行。 |
| R2 | **默认用户级、不覆盖**：结果只写 `workspace/templates/` 与 `workspace/runs/`；**禁止**改 `skills/` 官方文件。`git pull` 不碰 workspace。见 `docs/business-own-template.md`。 |
| R3 | **复刻 = 近 100% 视觉**。富设计参考（媒体≥15 / 含 SVG / 大体积）→ **OOXML 原片归档** `scripts/deposit_ooxml_gold.py`（`docs/ooxml-gold-fidelity.md`），**禁止** pptxgenjs 重画却写 `gold-aligned`。绿/蓝签样课型 → 挂现成引擎 + 保真清单。 |
| R4 | **制作完成默认打开复核**：内容初稿与 PPT 就绪后，在业务机 **立刻 `open` 两个文件**（见下「交付打开」），再请业务看。不要只丢路径。 |
| R5 | **内容先行**：换主题时先写满 `content-draft.md` / 引擎 JSON；业务点头后再出正式片（明确要求预览片除外）。 |

### 意图推断（内部，不念给业务）

| 业务实际给的 / 说的 | 内部路径 | 你怎么开口 |
|---------------------|----------|------------|
| 丢来一份参考 PPT /「存成模板」「复刻这份」 | **模式 1** → `workspace/templates/<id>/` | 「我按你这份课件做成以后能反复出片的模板，做好后直接打开给你看。」 |
| 已有模板 + 新病种/商品 /「换主题」「做几个」 | **模式 2/2b** → `workspace/runs/` | 「我先按模板写满一版内容，写好后打开给你审；你点头我再出 PPT。」 |
| 两者都像 / 意图不清 | **不问 1/2**；用**一句话确认目标**（不是菜单）：「你是要把这份课件存成模板，还是用现成模板换一个主题出课？」业务用自然语言答即可。 | 确认后立刻开工，不再展开选项表 |

全程少用「沉淀、槽位、tokens、schema」；改说「存模板、换病种、先出一版内容你看看、你点头我再出 PPT」。

### 交付打开（默认 · 必做）

内容初稿就绪时（模式 2 阶段 A / 模式 1 样例内容写满后）：

```bash
# macOS；路径换成本次 run/template 真实路径
open "workspace/runs/<template-id>/<theme-id>/content-draft.md"
# 若有 Word 业务更熟，可同时 open 对应 docx（若已生成）
```

正式 PPT 出片后（或明确交付预览片后）：

```bash
# 优先 WPS（本机已装时）；否则 open 默认应用
open -a "wpsoffice" "…/courseware.pptx" 2>/dev/null \
  || open "…/courseware.pptx"
open "…/content-draft.md"   # 与 PPT 一起打开，便于对照改
```

Windows / 无 `open`：用系统默认方式打开同一对文件，并在对话里写清「已为你打开」。  
**禁止**只回复路径让业务自己找文件。

- 安装：`docs/install-via-git.md`  
- 业务口令：`docs/business-usage.md`  
- **业务自有模板 / 升级不覆盖：** 仓库 `docs/business-own-template.md`（微调只写 `workspace/`，禁止改 `skills/`）  


## 定位

| 做 | 不做 |
|----|------|
| **1 复刻模板** → 可批量复用模板包 | 运行时依赖其他 monorepo 路径 |
| **2 选模板生成** → 先完整内容初稿 → 审/改 → **生产级引擎**出片 | **先交空白/全是「待填」的空文档当交付** |
| 有材料按材料写；没材料也起草一版标「待审」 | 把草稿说成已审定药效；假包装图 |
| 穿心莲/参课蓝课型用迁入引擎的版式字色插图 | 用 `scripts/build_pptx.py` 通用壳当正式交付 |

## 生产级引擎（必读 · v0.3）

两套金样对应能力已从生产仓**自包含迁入** `engines/`（版式、chrome、字阶、色板、插图、填写规范）。详见 `engines/README.md`。

| 课型 | 引擎 | 内容契约 | 出片 |
|------|------|----------|------|
| 疾病+商品场景（绿 · 穿心莲骨架） | `engines/disease-product-scenario-pptx-v1/` | `disease-product-scenario-script/v1`（`input-schema.json`） | `scripts/build_with_engine.sh disease-product-scenario <script.json> <out.pptx>` |
| 疾病健康培训（参课蓝） | `engines/disease-health-shenke-blue-v1/` | 生成器 `content/*.content.json` | `scripts/build_with_engine.sh disease-health-shenke-blue <content.json> <out.pptx>` |

- 首次使用：在对应引擎目录执行 `npm i`（仅 pptxgenjs）。  
- 绿引擎金样保真：变体触发器与验收方法见 `engines/disease-product-scenario-pptx-v1/FIDELITY.md`（穿心莲 18 页差分 2026-08-11 无 🔴）。  
- **Workbuddy 打开测交付片：** `workspace/runs/chuanxinlian-fidelity-qa/output/chuanxinlian-fidelity-delivery-scale.pptx`（说明见同目录 `README-WORKBUDDY.md`）。  
- `scripts/build_pptx.py` = **通用壳烟测 only**，不得当作穿心莲/参课蓝正式复用结果。  
- 换主题：锁引擎布局，只换内容 JSON + 业务授权图；非金样主题勿拷贝穿心莲医学关键词（引擎硬阻断）。

## 两条主路径

### 模式 1 · 复刻 / 沉淀 PPT 模板

**人话：** 把看好的课件存成**打开几乎和原片一样**的模板，以后还能换主题——不是「页数对了、有点像」。

**先判策略（代理内部 · 不让业务选）：**

| 参考原片特征 | 你必须走的路 |
|--------------|--------------|
| 媒体多 / 含 SVG / 体积大 / 复杂阴影与纹理（例：**康爱森番茄红素**） | **`deposit_ooxml_gold.py` 原片归档** → `fidelity: gold-aligned-ooxml-v1`。详见仓库 `docs/ooxml-gold-fidelity.md` |
| 明确是穿心莲绿 / 参课蓝结构 | 挂现成 `engines/*`，按 FIDELITY 差分 |
| 只有简单结构探索 | 可做框架，**只能** `path-only-framework`，**禁止**写 gold-aligned |

**禁止当完成的伪交付（业务已踩坑）：**

| 伪交付 | 真实案例 / 为何不合格 |
|--------|------------------------|
| pptxgenjs 圆角卡重画 + 标 `gold-aligned` | WorkBuddy `health-popularization-lycopene-v1`：0.4MB / 媒体≈0 vs 原片 9.9MB / 97 媒体 |
| 只写 page-map / 页序 markdown | 不能出片，也无版式 |
| 只跑 `scripts/build_pptx.py` 通用壳 | 字号/卡片/强调/插图全不对 |
| 未 open 原片与样片并排 | 业务无法发现「只有框架」 |

#### 路径 A · OOXML 金样归档（近 100% 默认）

```bash
python3 scripts/deposit_ooxml_gold.py \
  --source "/path/to/参考.pptx" \
  --template-id <id> \
  --name-zh "<中文名>" \
  --open
```

- 样片 `workspace/templates/<id>/output/courseware.pptx` **SHA256 = 原片**  
- 同时写出 `inventory.json`、`reuse/content-draft.md` 并 open  
- 换题量产：克隆 OOXML 换槽（生产 `ingredient-health-edu-pptx-v1`）；Skill 未迁入换槽器前，**诚实**说明「金样 100%，换题引擎另接」

#### 路径 B · 已有签样引擎（绿 / 蓝）

见 `docs/deposit-to-reuse.md` + `docs/HANDOVER-2026-08-11-fidelity-upgrade.md`：挂引擎 → 写满 JSON → 保真清单 → open。

#### 路径 C · 新版式且必须数据驱动（少见）

新建 `engines/<id>/` 后，**在未过关键帧对照前只能 path-only**；媒体密集参考**不得**用本路径冒充 100%。

沉淀完成 = 业务打开样片认可「就是这份课件」+ 换题路径写进 manifest。  
**禁止**把业务定稿写进 `skills/`。  


### 模式 2 · 选模板生成 PPT（单次）— **内容先行**

**人话：** 用已有模板换主题；**先给你看一版写满的内容，你觉得行再出 PPT。**

#### 阶段 A · 初始化内容初稿（先做这个）

1. 只读 `workspace/templates/`（**优先业务自有**）+ 官方课型说明；若只有一个可用模板直接用，**不要**列菜单让业务猜 ID  
2. 收集：主题名、业务给的文案/说明书/大纲/包装图（有什么用什么）  
3. **按模板页序写满一版内容**，输出到  
   `workspace/runs/<template-id>/<theme-id>/content-draft.md`  
   （也可用 `courseware.content.json` 同步填好，便于后步出片）  
4. 写法规则：  
   - **业务给了的** → 优先原文整理进对应页，标 `来源：业务提供`  
   - **业务没给的** → **代理起草完整可读段落/列表**，标 `来源：代理起草·待审`  
   - **禁止**整页只写「待填」「【待业务】」交差  
   - 功效/禁忌/数据等敏感句：起草可以有，但必须标 **待审**；不得声称已医学通过  
   - 包装：有真图写路径；没有则写「占位框·待换真图」，不生成假包装  
5. **立刻 open 内容初稿**（见「交付打开」），再用口语请业务审核：  

```text
内容初稿已经写好并打开了。
你看一遍：说「通过」或「可以出 PPT」→ 我生成课件；
要改哪里直接说；有补充材料也可以丢给我。
```

6. **停在这里等业务**；在未确认前 **不生成** 正式 `courseware.pptx`（明确要求预览片除外，且预览片也要 open）

#### 阶段 B · 按意见改内容

- 只改正文与清单，仍不出片或只更新 draft  
- 改完再请确认  

#### 阶段 C · 业务确认后出 PPT

仅当业务明确同意（「通过 / 可以出 / 按这个生成」等）后：

1. 把确认稿整理成引擎输入：  
   - 绿课型 → `disease-product-scenario-script/v1` JSON（对照 `engines/.../input-schema.json` + 真题样例 `samples/gold-chuanxinlian.script.json`；换题只学结构勿抄医学结论）  
   - 蓝课型 → 参课蓝 `content/急性上呼吸道感染.content.json` 结构  

2. **用对应引擎出片**（`build_with_engine.sh`），禁止通用壳冒充  
3. 业务包装图：路径写入 JSON；缺图用引擎占位，不伪造品牌包装  
4. 更新 `fill-checklist.md` 阶段为「已出 PPT」  
5. **立刻 open 正式 pptx + content-draft**（双开对照）；口语告知「两个文件已打开，请复核」  

### 模式 2b · 批量生成 — 同样内容先行

对每个主题各自走 **A → 审/改 → C**。  

- 可先批量交齐所有主题的 `content-draft.md`，业务逐个点头后再批量出片  
- 或主题 A 确认出片的同时，主题 B 仍在改稿  
- `batch-summary.md` 增加列：`内容状态`（草稿待审 / 已确认 / 已出片）  

**禁止：** 批量生成一堆空 PPT 或空 markdown。

## 两层风格

| 层 | 规则 |
|----|------|
| PPT 版式 | **签样课型用迁入引擎**；业务另有参考时从参考抽 tokens 并尽量对齐引擎 chrome |
| 知识插图 | 参课蓝用引擎 `assets/`；绿课型用业务图 + 引擎占位；**缺知识图默认 `illustration-medical-flat-color-v1`（彩色）**，禁止全绿 monochrome；暖色回落 `store-vitality-v1`；不改 PPT 母版绿 |

出片阶段再补插图亦可；**内容审过之前以文案草稿为主**。

## 开始前读取

1. `engines/README.md`（生产迁入引擎）  
2. `references/course-types/PROVENANCE.md`  
3. `references/compliance-redlines.md`  
4. `references/output-contract.md`  
5. `references/style-selection.md`  
6. 课型 `references/course-types/*` + 对应引擎 `本课型怎么填.md`  
7. `templates/content-draft.md`、`templates/fill-checklist.md`  
8. 正式出片：`scripts/build_with_engine.sh`（通用壳 `scripts/build_pptx.py` 仅烟测）  

## 目录约定

```text
workspace/
  templates/<template-id>/
  runs/<template-id>/<theme-id>/
    content-draft.md           # ★ 先有：完整内容初稿
    fill-checklist.md          # 进度：待审 → 已确认 → 已出片
    courseware.content.json    # 初稿阶段即可写满；确认后锁定
    courseware.pptx            # ★ 仅确认后（或明确要求预览时）
  runs/<template-id>/batch-summary.md
```

## 质量自检

### 复刻 / 沉淀

- [ ] **未**让业务选 1/2 或引擎名  
- [ ] 模板 **挂引擎**（manifest 有 engine + 出片命令）  
- [ ] schema 样例 **写满**，引擎命令本机跑通  
- [ ] 样例 pptx **能打开**，且已 **默认 open** 内容+PPT 给业务  
- [ ] 关键帧过保真清单（非仅 markdown 页序）  
- [ ] change-list + tokens/assets 齐全  
- [ ] 未用通用壳冒充签样课型交付  
- [ ] 产物在 `workspace/`，未改 `skills/`  

### 选模板生成

- [ ] **先有** 写满的 `content-draft.md` / 引擎 JSON（非空壳）  
- [ ] 内容初稿已 **open**；业务可见「待审」标注  
- [ ] **确认后** 才出正式 pptx，并 **open pptx+草稿**  
- [ ] 正式片走 **同一引擎**，路径与沉淀一致  
- [ ] 包装真图或命名占位，无假包装  

### 验收参照

- 可可康复用 run：`workspace/runs/kekang-lingzhi-reuse/`（**路径**验收：引擎 + 写满 JSON；非穿心莲像素签样）  
- **穿心莲高保真升级交接**（下一任必读）：仓库 `docs/HANDOVER-2026-08-11-fidelity-upgrade.md`  
  - 业务判定：排版/字体/标题与重点色/插画仍差金样很多  
  - 升级后沉淀：同一引擎 + 保真清单关键帧，才能声称「新 PPT 同质」  
