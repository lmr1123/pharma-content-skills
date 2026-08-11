# 近 100% 复刻：OOXML 金样策略（业务 Skill 必读）

**日期：** 2026-08-11  
**问题案例：** WorkBuddy 对 `康爱森番茄红素.pptx` 用 pptxgenjs 重画  
`health-popularization-v1` → 产物 ~0.4MB / 媒体≈0，却标 `gold-aligned-v1` —— **这是框架壳，不是复刻。**

---

## 业务要的是什么

> 用这个技能，把看好的参考 PPT **高质量、近乎 100%** 存成以后能用的模板。  
> 不是「页数对上、有点红有点卡片」。

---

## 两条路（代理必须选对，不让业务选）

| 条件（参考原片） | 策略 | fidelity 可写 |
|------------------|------|----------------|
| 媒体多（≥15）、体积大、含 SVG/真图/复杂阴影/自由曲线 | **`ooxml-gold-archive`**：原片拷贝为金样 | `gold-aligned-ooxml-v1` |
| 版式简单、可数据驱动、已有签样引擎（穿心莲绿 / 参课蓝） | **挂已有引擎** + 逐页保真差分 | 引擎 checklist 通过后 `gold-aligned-v1` |
| 只想先跑通页序 | 可做框架探索 | **只能** `path-only-framework`，**禁止** gold-aligned |

### 康爱森番茄红素（本机真源）

| 项 | 原片 | WorkBuddy 错误壳 |
|----|------|------------------|
| 路径 | `Downloads/健康科普参考文档/康爱森番茄红素.pptx` | `…/health-popularization-lycopene-v1/output/courseware.pptx` |
| 体积 | ~9.9MB | ~0.4MB |
| 媒体 | **97**（jpeg/png/**svg**） | ~0 |
| 字体/观感 | Noto Sans SC、outerShdw、纹理背景 | HarmonyOS 近似色 + 形状水印番茄 |
| 正确金样 | **原片归档**；生产 settled `kangaisen-lycopene-health-edu-v1` | 已归档为失败示范 |

生产仓教训（已签样）：  
`chain-pharmacy-content-studio/.../kangaisen-lycopene-health-edu-v1`  
→ **可编辑金样 = 原片本体**；框架重建进 `archive-framework-v1/`，**不作金样**。

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
