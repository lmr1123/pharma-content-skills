---
name: pharma-courseware-replication
version: 0.2.6
description: >
  医药内训课件独立 Skill（Git 可安装）。业务入口口语二选一：
  (1) 复刻 PPT 模板；(2) 选模板生成 PPT（可批量）。
  生成路径：先按材料或代理初始化「完整内容初稿」给业务审，确认/改完后再出 PPT；禁止先交空白清单。
  触发词：复刻模板、选模板生成、换主题、批量出课、内容初稿、审核后再生成。
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
| **1 复刻模板** → 可批量复用模板包 | 依赖其他 monorepo |
| **2 选模板生成** → 先完整内容初稿 → 审/改 → 再 PPTX | **先交空白/全是「待填」的空文档当交付** |
| 有材料按材料写；没材料也起草一版标「待审」 | 把草稿说成已审定药效；假包装图 |

## 两条主路径

### 模式 1 · 复刻 PPT 模板

**人话：** 把看好的课件学成模板存下来。

1. 拆页序/页型/槽位  
2. 提取色板 → `visual/tokens.json`  
3. 素材地图；知识图可补；包装真图位  
4. `reuse/change-list.md`  
5. 样例 `output/courseware.pptx`（可用参考主题或完整示意，**不要**只有空表）  
6. 写入 `workspace/templates/<template-id>/`  

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

1. 用确认后的内容 → `courseware.content.json`  
2. 模板 tokens 出 `courseware.pptx`  
3. 更新 `fill-checklist.md` 阶段为「已出 PPT」  

### 模式 2b · 批量生成 — 同样内容先行

对每个主题各自走 **A → 审/改 → C**。  

- 可先批量交齐所有主题的 `content-draft.md`，业务逐个点头后再批量出片  
- 或主题 A 确认出片的同时，主题 B 仍在改稿  
- `batch-summary.md` 增加列：`内容状态`（草稿待审 / 已确认 / 已出片）  

**禁止：** 批量生成一堆空 PPT 或空 markdown。

## 两层风格

| 层 | 规则 |
|----|------|
| PPT 版式 | 跟业务参考；课型绿/蓝仅快捷默认 |
| 知识插图 | 绿/蓝配套优先，回落门店活力；不改 PPT 母版 |

出片阶段再补插图亦可；**内容审过之前以文案草稿为主**。

## 开始前读取

1. `references/compliance-redlines.md`  
2. `references/output-contract.md`  
3. `references/page-type-vocabulary.md`  
4. `references/visual-optimization.md`  
5. `references/style-selection.md`  
6. 课型（可选）`references/course-types/*`  
7. `templates/content-draft.md`、`templates/fill-checklist.md`  
8. `scripts/build_pptx.py`  

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

### 复刻模板

- [ ] `workspace/templates/` 有 slots + tokens + change-list + 非空样例 pptx  

### 选模板生成

- [ ] **先有** 写满的 `content-draft.md`（非空壳）  
- [ ] 业务可见「待审」标注，未冒充已审定  
- [ ] **确认后** 才出正式 pptx  
- [ ] 未改模板 tokens / 页序骨架  
- [ ] 包装真图或命名占位，无假包装  
