---
name: pharma-courseware-replication
version: 0.3.2
description: >
  医药内训课件独立 Skill（Git 可安装）。业务入口口语二选一：
  (1) 复刻/沉淀 PPT 模板；(2) 选模板生成 PPT（可批量）。
  沉淀与复用同一路径：签样引擎 + 写满内容 JSON + 插图，禁止通用壳当交付。
  内容先写满待审，确认后再出片。触发词：复刻、沉淀、选模板生成、换主题、批量出课。
---

# 医药课件模板沉淀与批量复用

## 对业务怎么说话（必读）

用户一上来或意图不清时，**先用口语引导，再干活**。推荐开场：

```text
这个技能装好了，我可以带你用。你先选一个：

1. 复刻 PPT 模板
   ——你有一份看好的课件，想存成以后能反复用的模板

2. 选模板生成 PPT
   ——模板已经有了，要换成别的病种/商品（可以一次做好几个）

你回 1 或 2 就行，别的我一步步问你。
```

| 用户说的 | 内部路径 |
|----------|----------|
| 1 / 复刻 / 存成模板 | 模式 1 → `workspace/templates/` |
| 2 / 选模板 / 生成 / 换主题 / 批量 | 模式 2 或 2b → `workspace/runs/`（**先内容初稿，再出片**） |

全程少用「沉淀、槽位、tokens」；改说「存模板、换病种、先出一版内容你看看、你点头我再出 PPT」。

- 安装：`docs/install-via-git.md`  
- 业务口令：`docs/business-usage.md`  

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
- `scripts/build_pptx.py` = **通用壳烟测 only**，不得当作穿心莲/参课蓝正式复用结果。  
- 换主题：锁引擎布局，只换内容 JSON + 业务授权图；非金样主题勿拷贝穿心莲医学关键词（引擎硬阻断）。

## 两条主路径

### 模式 1 · 复刻 / 沉淀 PPT 模板

**人话：** 把看好的课件存成**以后能反复出片**的模板（效果对齐可可康那种复用验收，不是存一堆空说明）。

**标准路径（与模式 2 共用引擎，见 `docs/deposit-to-reuse.md`）：**

1. **定课型 / 定引擎**  
   - 像绿「疾病+商品场景」→ 挂 `engines/disease-product-scenario-pptx-v1`  
   - 像蓝「参课健康培训」→ 挂 `engines/disease-health-shenke-blue-v1`  
   - 完全另一套版式 → **新建** `engines/<id>/`（布局代码 + schema + assets），禁止只写 markdown  
2. **拆结构给人看**：页序 / page-map / 换题清单 `reuse/change-list.md`  
3. **落内容契约**：引擎 schema 的**写满**样例 JSON（`samples/` 或 `content/`）  
4. **视觉**：tokens/色板字阶跟参考；知识图进 assets；包装真图或命名占位  
5. **用引擎跑通样例片** → `output/courseware.pptx`（本机能打开；需要时 LibreOffice 重存兼容 WPS）  
6. **模板包**写入 `workspace/templates/<template-id>/`，`template-manifest.md` 写死：  
   `engine` + `schema` + `build_with_engine.sh …` 命令  

沉淀完成 = **换主题时只改 JSON/图、同一引擎能出片**。  
未挂引擎、只能通用壳出片的，**不算**合格沉淀。  

### 模式 2 · 选模板生成 PPT（单次）— **内容先行**

**人话：** 用已有模板换主题；**先给你看一版写满的内容，你觉得行再出 PPT。**

#### 阶段 A · 初始化内容初稿（先做这个）

1. 只读模板 `workspace/templates/<template-id>/`，列出供用户选  
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
5. 用口语请业务审核，例如：  

```text
内容初稿已经写好了（路径：…/content-draft.md）。
请你看一遍：
- 回复「通过」或「可以出 PPT」→ 我按这个生成课件
- 回复要改哪里 → 我改完再给你看
- 有补充材料也可以直接丢给我
```

6. **停在这里等业务**；在未确认前 **不生成** 正式 `courseware.pptx`（或明确标注仅内部预览且仍要审——默认推荐：确认前不出正式片）

#### 阶段 B · 按意见改内容

- 只改正文与清单，仍不出片或只更新 draft  
- 改完再请确认  

#### 阶段 C · 业务确认后出 PPT

仅当业务明确同意（「通过 / 可以出 / 按这个生成」等）后：

1. 把确认稿整理成引擎输入：  
   - 绿课型 → `disease-product-scenario-script/v1` JSON（对照 `engines/.../input-schema.json` + `samples/neutral-theme.json`）  
   - 蓝课型 → 参课蓝 `content/*.content.json` 结构  
2. **用对应引擎出片**（`build_with_engine.sh`），禁止通用壳冒充  
3. 业务包装图：路径写入 JSON；缺图用引擎占位，不伪造品牌包装  
4. 更新 `fill-checklist.md` 阶段为「已出 PPT」  

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
| 知识插图 | 参课蓝用引擎 `assets/`；绿课型用业务图 + 引擎占位；缺知识图可补门店活力画风，不改母版 |

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

- [ ] 模板 **挂引擎**（manifest 有 engine + 出片命令）  
- [ ] schema 样例 **写满**，引擎命令本机跑通  
- [ ] 样例 pptx **能打开**（WPS 不行则修复/重存后再交）  
- [ ] change-list + tokens/assets 齐全  
- [ ] 未用通用壳冒充签样课型交付  

### 选模板生成

- [ ] **先有** 写满的 `content-draft.md` / 引擎 JSON（非空壳）  
- [ ] 业务可见「待审」标注，未冒充已审定  
- [ ] **确认后** 才出正式 pptx  
- [ ] 正式片走 **同一引擎**，路径与沉淀一致  
- [ ] 包装真图或命名占位，无假包装  

### 验收参照

- 可可康复用 run：`workspace/runs/kekang-lingzhi-reuse/`（**路径**验收：引擎 + 写满 JSON；非穿心莲像素签样）  
- **穿心莲高保真升级交接**（下一任必读）：仓库 `docs/HANDOVER-2026-08-11-fidelity-upgrade.md`  
  - 业务判定：排版/字体/标题与重点色/插画仍差金样很多  
  - 升级后沉淀：同一引擎 + 保真清单关键帧，才能声称「新 PPT 同质」  
