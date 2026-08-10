---
name: pharma-courseware-replication
version: 0.2.4
description: >
  医药内训课件独立 Skill（Git 可安装）：(1) 沉淀可批量复用的模板包；
  (2) 用模板生成/批量生成其他主题课件并导出 PPTX。
  含结构槽位、从参考提取的 PPT 色板、插图策略、换主题清单。
  触发词：课件复刻、沉淀模板、换主题、批量生成、槽位表、模板包、培训PPT。
---

# 医药课件模板沉淀与批量复用

## 定位

| 做 | 不做 |
|----|------|
| **模式 1** 业务参考 → 可批量复用模板包 | 依赖其他内容 monorepo / 设备 |
| **模式 2 / 2b** 同一模板 → 单主题或批量多主题 PPTX | 用插图默认风整课换皮 |
| 风格与页序锁定，只换 content / 业务图 / 主题插图 | 生成假包装、编造药效 |

- 安装：`docs/install-via-git.md`  
- 业务口令：`docs/business-usage.md`  

## 两条主路径（必须都支持）

### 模式 1 · 沉淀模板（Deposit）

**目标：** 产出以后能反复、批量调用的模板，而不是一次性 PPT。

1. 读参考，拆页序/页型/槽位  
2. 提取 PPT 色板 → `visual/tokens.json`（跟参考，不换皮）  
3. 素材地图；缺知识图可补；包装 `business_asset`  
4. 写 **`reuse/change-list.md`**（批量复用时的唯一变更清单结构）  
5. 导出样例 `output/courseware.pptx`  
6. **写入** `workspace/templates/<template-id>/`  

成功标准：换主题时只读该目录 + change-list，无需再拆参考。

### 模式 2 · 用模板生成主题（Refill，单次）

1. **只读** `workspace/templates/<template-id>/`  
2. 不改 `visual/tokens`、不改 framework 页序  
3. 按 change-list 填 content / 业务图 / 主题插图  
4. 输出到 `workspace/runs/<template-id>/<theme-id>/`  
   - `courseware.pptx`、`courseware.content.json`  
   - `fill-checklist.md`、slots 副本  

### 模式 2b · 批量生成（Batch）

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
