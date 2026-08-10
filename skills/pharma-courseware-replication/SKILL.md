---
name: pharma-courseware-replication
version: 0.2.5
description: >
  医药内训课件独立 Skill（Git 可安装）。业务入口口语二选一：
  (1) 复刻 PPT 模板；(2) 选模板生成 PPT（可批量）。
  含结构槽位、从参考提取的 PPT 色板、插图策略、换主题清单。
  触发词：复刻模板、选模板生成、换主题、批量出课、培训PPT、课件模板。
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
| 1 / 复刻 / 存成模板 / 按这份做成模板 | 模式 1 → `workspace/templates/` |
| 2 / 选模板 / 生成 / 换主题 / 批量 | 模式 2 或 2b → `workspace/runs/` |

全程少用「沉淀、槽位、tokens、schema」等词；改说「存模板、换病种、缺什么你补、包装用真图」。

- 安装：`docs/install-via-git.md`  
- 业务口令：`docs/business-usage.md`  

## 定位

| 做 | 不做 |
|----|------|
| **1 复刻模板** 业务参考 → 可批量复用模板包 | 依赖其他 monorepo / 设备 |
| **2 选模板生成** 同一模板 → 单主题或批量多主题 PPTX | 用插图默认风整课换皮 |
| 风格与页序锁定，只换内容 / 业务图 / 主题插图 | 生成假包装、编造药效 |

## 两条主路径（必须都支持）

### 模式 1 · 复刻 PPT 模板（Deposit）

**人话：** 把看好的课件学成模板存下来。  
**目标：** 以后能反复、批量调用，而不是一次性 PPT。

1. 读参考，拆页序/页型/槽位  
2. 提取 PPT 色板 → `visual/tokens.json`（跟参考，不换皮）  
3. 素材地图；缺知识图可补；包装 `business_asset`  
4. 写 **`reuse/change-list.md`**（批量复用时的唯一变更清单结构）  
5. 导出样例 `output/courseware.pptx`  
6. **写入** `workspace/templates/<template-id>/`  

成功标准：换主题时只读该目录 + change-list，无需再拆参考。

### 模式 2 · 选模板生成 PPT（单次）

**人话：** 用已有模板换一个病种/商品出课。

1. **只读** `workspace/templates/<template-id>/`（先列出已有模板让用户选）  
2. 不改 `visual/tokens`、不改 framework 页序  
3. 按 change-list 填 content / 业务图 / 主题插图  
4. 输出到 `workspace/runs/<template-id>/<theme-id>/`  
   - `courseware.pptx`、`courseware.content.json`  
   - `fill-checklist.md`、slots 副本  

### 模式 2b · 选模板批量生成

**人话：** 同一套模板，一次出好几个主题。

1. 同一模板 + 主题列表（有几条做几条）  
2. 每个主题独立 `workspace/runs/<template-id>/<theme-id>/`  
3. 全员共用模板色板与骨架  
4. 写 `workspace/runs/<template-id>/batch-summary.md`  
5. 缺件主题标「部分完成」，不阻断其他主题  

**批量可复用性靠：** 模板只读、slots 契约、tokens 锁定、统一 change-list、列表不硬凑条数。

## 两层风格

| 层 | 规则 |
|----|------|
| PPT 版式 | 跟业务参考；课型预制绿/蓝仅快捷默认 |
| 知识插图 | 绿/蓝配套优先，回落 `store-vitality-v1`；不改 PPT 母版 |

见 `references/style-selection.md`。

## 开始前读取

1. `references/compliance-redlines.md`  
2. `references/output-contract.md`  
3. `references/page-type-vocabulary.md`  
4. `references/visual-optimization.md`  
5. `references/style-selection.md`  
6. 课型（可选）`references/course-types/*`  
7. `scripts/build_pptx.py`  

## 目录约定

```text
workspace/
  templates/<template-id>/     # 模式 1：可批量复用的模板
    template-manifest.md
    structure/slots.json
    visual/tokens.json
    reuse/change-list.md
    assets/
    output/courseware.pptx
  runs/<template-id>/          # 模式 2 / 2b
    <theme-id>/
      courseware.pptx
      fill-checklist.md
      ...
    batch-summary.md           # 仅批量时
```

## 课型快捷（可选）

| 课型 | PPT 预制 | 插图预制 |
|------|----------|----------|
| disease-product-scenario-v1 | ppt-courseware-green-v1 | illustration-medical-flat-green-v1 |
| disease-health-training-v1 | ppt-health-training-blue-v1 | illustration-medical-flat-blue-v1 |

业务参考有自有色 → **以参考为准**。

## 质量自检

### 沉淀

- [ ] 路径在 `workspace/templates/`  
- [ ] 有 slots + tokens + change-list + 可打开 pptx  
- [ ] change-list 足够指导批量换题  

### 生成 / 批量

- [ ] 未改模板 tokens 与页序骨架  
- [ ] 每主题独立 run 目录  
- [ ] 批量有 summary；缺件不编造  
- [ ] 包装为真图或占位  
