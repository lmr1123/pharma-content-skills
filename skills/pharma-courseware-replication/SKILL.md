---
name: pharma-courseware-replication
version: 0.3.8
description: >
  医药内训课件独立 Skill。业务零选择题。产线按参考片特征判定 A/B。
  产线 B 换题必须：文字槽 + 图槽素材计划 + 按 style_pack 生透明 PNG 并 formal 绑定；
  preview-text-only 仅验壳、禁止当交付。禁止门店活力默认画风套 B 金样。
  触发词：复刻、换主题、图槽、素材计划、OOXML、辅酶。
---

# 医药课件模板沉淀与批量复用

## 对业务怎么说话（必读 · v0.3.7）

### 硬规则（不可违反）

| # | 规则 |
|---|------|
| R1 | **不要让业务做技术选择题**（禁止开场「回 1 或 2」「选产线 A/B」「要不要高保真」）。业务只交材料与目标；你按 **§产线判定** 推断并执行。 |
| R2 | **默认用户级、不覆盖**：结果只写 `workspace/templates/` 与 `workspace/runs/`；**禁止**改 `skills/` 官方文件。`git pull` 不碰 workspace。见 `docs/business-own-template.md`。 |
| R3 | **复刻 = 近 100% 视觉**。产线由 **参考 PPT 的可测特征** 决定（见 §产线判定），**不是**由商品名/课型中文绰号决定。禁止「听说是番茄红素就 B / 是穿心莲就 A」这种硬编码。 |
| R4 | **制作完成默认打开复核**：内容初稿与 PPT 就绪后，在业务机 **立刻 `open` 两个文件**（见下「交付打开」），再请业务看。不要只丢路径。 |
| R5 | **内容先行**：换主题时先写满 `content-draft.md` / 引擎 JSON / theme 槽；业务点头后再出正式片（明确要求预览片除外）。 |
| R6 | **禁止** pptxgenjs/通用壳重画后写 `gold-aligned`；失败示范见 WorkBuddy 框架壳（体积骤降、媒体≈0）。 |
| R7 | **产线 B 换题交付必须换图**：走 `emit-image-plan` → 按金样 **style_pack** 生透明 PNG → `bind_ooxml_assets` → formal export。`preview-text-only` **只验版式壳**，图仍是金样，**禁止**当「扩展主题完成」。 |
| R8 | **生图画风跟金样 style_pack，不跟通用默认**：B 成分科普金样用 `style-pack.lycopene-health-edu-cream-red-v1`（米白+番茄红、透明底扁平）；**禁止**默认 `store-vitality-v1` / 全绿 monochrome / 不透明海报底板硬塞图槽。 |

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

## 产线判定（代理内部 · 新参考 PPT 必跑 · 不念给业务）

> **原则：看文件特征与结构匹配，不看文件名里的商品/品牌。**  
> 「穿心莲 / 康爱森 / 番茄红素」只出现在**样例**里，**不是 if 条件。**

### 1. 先采集（可用 `deposit_ooxml_gold.py` 的 inventory 或 zip 统计）

| 信号 | 怎么看 |
|------|--------|
| `media_files` | `ppt/media/` 文件数 |
| `size_bytes` | 参考 pptx 体积 |
| 是否含 SVG/矢量 | media 扩展名 `.svg` / `.emf` |
| 是否匹配已签样引擎结构 | 页序/chrome/字段能否挂绿或蓝 schema（对照 `references/course-types/*` + 引擎 `本课型怎么填.md`） |
| 业务已声明模板 | `workspace/templates/<id>/template-manifest.md` 里的 `pipeline` / `engine` |

### 2. 判定表（按顺序，命中即停）

| 顺序 | 条件（可测） | 产线 | 动作 |
|------|----------------|------|------|
| ① | 业务指定已有模板且 manifest 写了 `pipeline: A` + engine | **A** | 只换 JSON/图，走该引擎出片 |
| ② | 业务指定已有模板且 manifest 写了 `pipeline: B` + 金样路径 | **B** | 克隆该金样换槽，不重画 |
| ③ | 页结构/字段**明确匹配**已签样绿或蓝引擎（可对 page-map / 填写规范） | **A** | 挂对应 `engines/*`，换题只改内容契约 |
| ④ | **富设计门禁任一成立**：`media_files ≥ 15` **或** `size ≥ 2MB` **或** 含 `.svg`/`.emf` **或** 自由曲线/重阴影等（inventory/gate） | **B** | `deposit_ooxml_gold.py` 归档；换题 OOXML 换槽；**禁止**新建 pptxgenjs 壳 |
| ⑤ | 结构简单、仅探索页序、业务未要求近 100% | **探索** | 仅 `path-only-framework`，**禁止** `gold-aligned` |
| ⑥ | 不确定 | **默认 B 归档** | 先原片金样 + open 给业务看；再决定是否值得立项做成 A 引擎 |

### 3. 产线含义（与工具映射）

| 产线 | 模板「长什么样」存在哪 | 换主题 | Skill 工具 |
|------|------------------------|--------|------------|
| **A** | 代码引擎（JSON 驱动重生成） | 换 script/content JSON + 图 | `disease-product-scenario-pptx-v1`、`disease-health-shenke-blue-v1` 等**已签样**引擎 |
| **B** | **该模板自己的金样 PPTX 文件** | 克隆金样 → 换文字/图槽 | ① 任意新片：`deposit_ooxml_gold.py`；② 换槽：对**该金样**跑 OOXML 引擎（`--source` 指向该模板 `output/courseware.pptx`）。`ingredient-health-edu-ooxml-v1` 只是**第一个** B 课型实例（20 页成分科普金样），**不是**「所有 B 都叫番茄红素引擎」 |

### 4. 新丢来一份完全陌生的 PPT 时（最常见）

```text
跑 inventory / deposit_ooxml_gold
  → 写 template-manifest：pipeline: B | A、fidelity、engine 或 gold 路径
  → 若 ④ 富设计 → B：样片 SHA=原片，换题走换槽（槽位从该金样抽出）
  → 若 ③ 匹配绿/蓝 → A：挂引擎，不要归档后当唯一路径却不用引擎
  → open 金样/样片 + 内容清单给业务
```

**错误：** 看见「健康科普」就套 `health-popularization` 重画；或写死「番茄红素才走 B」。  
**正确：** 用上表 ①–⑥；manifest 记下判定结果，下次换题直接读 manifest。

### 5. 样例（仅帮助理解，勿当硬编码）

| 样例参考 | 为何落入该产线 | 不是因为 |
|----------|----------------|----------|
| 穿心莲 18 页绿 | 结构匹配已签样绿引擎 + 已保真 | 文件名有「穿心莲」 |
| 某 20 页重媒体成分科普（历史样例路径曾用康爱森番茄红素） | media≫15、体积大、含 SVG → 门禁 ④ → B | 品牌叫康爱森 |
| WorkBuddy 0.4MB 壳 | 违反 R6 | — |

细节与失败案例：`docs/ooxml-gold-fidelity.md`。

---

## 生产级引擎（必读）

| 角色 | 引擎 / 工具 | 何时用 |
|------|-------------|--------|
| 产线 A · 绿 | `engines/disease-product-scenario-pptx-v1/` | 判定为 A 且结构匹配绿 |
| 产线 A · 蓝 | `engines/disease-health-shenke-blue-v1/` | 判定为 A 且结构匹配蓝 |
| 产线 B · 归档（**任意**参考） | `scripts/deposit_ooxml_gold.py` | 判定为 B 的沉淀金样 |
| 产线 B · 换槽（按金样实例） | `engines/ingredient-health-edu-ooxml-v1/` 等 | 已有对应金样+契约的换题；新 B 课型可复用同套 export，换 `--source`/金样包 |

- A 引擎首次：`npm i`（pptxgenjs）。  
- B 换槽：需 `@oai/artifact-tool`（`vendor/` 或 `ARTIFACT_TOOL_ROOT`）。  
- `scripts/build_pptx.py` = 烟测 only。  
- 详见 `engines/README.md`。

---

## 两条主路径

### 模式 1 · 复刻 / 沉淀 PPT 模板

**人话：** 把看好的课件存成**打开几乎和原片一样**的模板，以后还能换主题——不是「页数对了、有点像」。

**第一步：跑 §产线判定**（不写死商品名）→ 再执行：

#### 产线 B · OOXML 金样 + 换槽

```bash
# ① 归档金样
python3 scripts/deposit_ooxml_gold.py --source "/path/to/参考.pptx" \
  --template-id <id> --name-zh "<中文名>" --open

# ② 文字槽草稿 + 内容初稿 open 给业务审
bash scripts/ooxml_b_pipeline.sh draft --theme-name "新主题" --out runs/.../theme.json

# ③ 图槽素材计划（必做，约 69 槽；含每槽 prompt + style_pack）
bash scripts/ooxml_b_pipeline.sh image-plan --theme-name "新主题" --out runs/.../image-plan.json
# 读 style-pack/ILLUSTRATION_PROMPTS.md，按 plan 生透明 PNG 到 runs/.../assets/

# ④ 绑定图 → formal（禁止只停在 preview）
python3 scripts/bind_ooxml_assets.py --theme theme.json --plan image-plan.json \
  --assets-dir assets --out theme.bound.json
# 业务确认 + asset_authorization + approval 后 formal export（见引擎 README）

# 可选：仅验壳（图仍是金样，不得交付）
bash scripts/ooxml_b_pipeline.sh preview --theme theme.json --out preview-壳only.pptx
```

**WorkBuddy 踩坑（辅酶 Q10）：** 只做了文字填充 + 通用生图/未绑槽 → 图仍是金样番茄或画风错。  
正确：R7+R8，必须 image-plan + cream-red 透明 PNG + formal 绑定。

#### 产线 A · 已签样 JSON 引擎

见 `docs/deposit-to-reuse.md`：挂绿/蓝引擎 → 写满 JSON → `build_with_engine.sh`。

#### 禁止的伪交付

| 伪交付 | 为何不合格 |
|--------|------------|
| pptxgenjs 圆角卡重画 + 标 gold-aligned | 体积/媒体崩塌，观感非原片 |
| 只写 page-map markdown | 不能出片 |
| 未 open 原片与样片并排 | 业务无法发现只有框架 |
| 用商品名硬编码产线 | 新 PPT 无法判断 |

沉淀完成 = 业务打开认可 + **manifest 写明 `pipeline: A|B`、engine 或 gold 路径、fidelity**。  


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

1. 读该模板 `template-manifest.md` 的 **pipeline**（模式 1 已判定写入）：  
   - **A · 绿** → `disease-product-scenario-script/v1` JSON（对照 schema；换题勿抄金样医学原文）  
   - **A · 蓝** → 参课蓝 `content/*.content.json` 结构  
   - **B** → 对该模板金样抽/填 theme 槽 JSON（克隆 OOXML 换槽；非 pptxgenjs）  

2. **按 manifest 产线出片**（`build_with_engine.sh` 或 B 的 export），禁止通用壳冒充  
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
- [ ] 已按 **§产线判定**（特征表）选择 A/B，**未**用商品名硬编码  
- [ ] manifest 写明 `pipeline: A|B` + engine 或 gold 路径 + fidelity  
- [ ] A：挂引擎 + schema 写满可出片；B：样片 SHA≈原片  
- [ ] 样例 pptx **能打开**，且已 **默认 open** 内容+PPT 给业务  
- [ ] 未用通用壳 / pptxgenjs 重画冒充 gold-aligned  
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
