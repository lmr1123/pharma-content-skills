# 近 100% 复刻：OOXML 金样策略（业务 Skill 必读）

**日期：** 2026-08-11  
**权威判定：** `skills/pharma-courseware-replication/SKILL.md` **§产线判定**（按文件特征，不按商品名）。

**问题案例（样例，非规则）：** WorkBuddy 对某富设计参考用 pptxgenjs 重画 → ~0.4MB / 媒体≈0，却标 `gold-aligned` —— **框架壳，不是复刻。**

---

## 业务要的是什么

> 用这个技能，把看好的参考 PPT **高质量、近乎 100%** 存成以后能用的模板。  
> 不是「页数对上、有点红有点卡片」。

---

## 两条路（代理必须选对，不让业务选）

| 条件（**可测**参考原片特征） | 产线 | fidelity 可写 |
|------------------------------|------|----------------|
| `media≥15` 或 `size≥2MB` 或含 SVG/emf 或重阴影/自由曲线等富设计门禁 | **B** · `ooxml-gold-archive` + 换槽 | `gold-aligned-ooxml-v1` |
| 页结构匹配**已签样**绿/蓝引擎 | **A** · JSON + 引擎 | 引擎 checklist 后 `gold-aligned-v1` |
| 仅探索页序 | 探索 | **只能** `path-only-framework` |

**禁止：** `if 文件名包含番茄红素 then B`。新 PPT 一律跑 inventory + §产线判定。

### 失败样例对照（历史）

| 项 | 富设计原片 | 错误 pptxgenjs 壳 |
|----|------------|-------------------|
| 体积 | ~10MB 级 | ~0.4MB |
| 媒体 | 几十～上百（含 SVG） | ≈0 |
| 正确做法 | 原片归档 = 金样；换题换槽 | 已否决 |

生产仓同类结论：可编辑金样 = 原片本体；框架重建不作金样。
---

## 模式 1 默认动作（代理）

```bash
# 在 pharma-content-skills 仓库根或 Skill 根
python3 skills/pharma-courseware-replication/scripts/deposit_ooxml_gold.py \
  --source "/绝对路径/参考.pptx" \
  --template-id <模板id> \
  --name-zh "<中文名>" \
  --open
```

结果：

- `workspace/templates/<id>/output/courseware.pptx` = **100% 原片**
- `inventory.json` + `reuse/content-draft.md` 打开给业务复核
- manifest 写 `fidelity: gold-aligned-ooxml-v1`

**禁止：**

1. 先 `export.mjs` 用圆角卡「复刻」再标 gold-aligned  
2. 媒体≥15 仍新建 pptxgenjs 课型并声称近 100%  
3. 只交 page-map markdown  

---

## 换主题还能近 100% 吗？

| 阶段 | 诚实标准 |
|------|----------|
| **金样沉淀** | 原片归档 → 业务打开 = 100% |
| **换题量产** | 克隆金样 OOXML → 只换文字槽/图槽（生产 `ingredient-health-edu-pptx-v1`） |
| Skill 尚未迁入 artifact-tool 换槽器时 | 金样观感可 100%；换题量产需生产引擎或后续迁入，**不得假装已 100% 换题** |

---

## 与穿心莲路径的关系

| 课型 | 近 100% 怎么来 |
|------|----------------|
| 穿心莲场景绿 | 自包含 `export.mjs` 已按可编辑金样逐页差分（字阶 0.75、runs、拓扑） |
| 参课蓝 | 迁入 `build-editable.mjs` + assets |
| 康爱森米白番茄红 20 页 | **OOXML 原片金样**，不是第三套 pptxgenjs 壳 |

---

## 自检（标 gold-aligned 前）

- [ ] 样片 SHA256 与参考原片一致（归档策略）**或** 引擎 checklist 关键帧 🟢  
- [ ] 媒体数与原片同量级（不能 97→0）  
- [ ] 已 `open` 原片与样片给业务并排看  
- [ ] 未使用 `build_pptx.py` / 未经门禁的新建 pptxgenjs 壳  
