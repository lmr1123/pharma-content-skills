# 沉淀 → 复用：怎么达到「可可康验收」那种效果

业务认可的复用效果，来自一条固定链路，不是「先交通用框再慢慢像」。

**可可康灵芝胶囊** 复用验收（`workspace/runs/kekang-lingzhi-reuse/`）证明：  
用 **已沉淀的签样引擎** + **写满的主题内容 JSON** + **插图/包装路径** 出片，**路径正确、初步可用**。

**注意（2026-08-11）：** 路径通过 ≠ 穿心莲金样视觉已完成。  
排版 / 字阶 / 标题与重点色 / 插画仍须按金样差分升级引擎；方法与任务见  
`docs/HANDOVER-2026-08-11-fidelity-upgrade.md`。  
升级完成后，模式 1 沉淀须过保真关键帧检查，才能声称「新 PPT 也能达到同级质量」。

---

## 一句话标准

| 阶段 | 必须交付什么 | 禁止 |
|------|----------------|------|
| **沉淀（模式 1）** | 可反复出片的 **课型引擎包**（或挂到已有引擎）+ 内容契约 + 样例内容 + 样例图 | 只存 markdown 页序、只出通用壳 PPT |
| **复用（模式 2）** | 主题内容写满 → 审 → **同一引擎**出片 | 换主题时换皮、用 `build_pptx.py` 冒充签样课型 |

---

## 沉淀时必须对齐的四层

新参考 PPT 要沉淀成「能复用到可可康那种程度」，代理必须做出：

### 1. 课型归属（先选路）

| 判断 | 动作 |
|------|------|
| 接近「疾病+商品+场景」绿系 | **挂** `engines/disease-product-scenario-pptx-v1`，不要另起通用壳 |
| 接近「参课蓝健康培训」 | **挂** `engines/disease-health-shenke-blue-v1` |
| 明显另一套版式 | **新建** `engines/<course-type-id>/`（pptxgenjs 布局 + schema + assets），再沉淀模板包 |

「挂」= 模板 manifest 写清 `engine` 路径；换题只改内容 JSON，不改布局代码。

### 2. 内容契约（机器能喂引擎）

- 绿：`disease-product-scenario-script/v1`（见引擎 `input-schema.json`）  
- 蓝：生成器 `content/*.content.json` 的 `scene_type` + 字段  
- 沉淀物里放：`samples/` 或 `content/` 一份**写满的**签样/真实主题样例（绿课型默认 `gold-chuanxinlian.script.json`；禁止假数据壳或空壳）

### 3. 视觉与插图

- `tokens.json` 或引擎内色板/字阶（与参考一致）  
- 知识插图：进 `assets/`（或复用时 run 目录覆盖）  
- 包装：业务授权真图路径；没有则命名占位，**禁止假包装**  
- 出片后若目标是 WPS：避免破坏性字体补丁；必要时 LibreOffice 重存（见下）

### 4. 换题清单 + 样例成片

- `reuse/change-list.md`：换主题改什么、不改什么  
- `output/` 或引擎跑通的 **样例 pptx**（真实可打开，非空表）  
- 模板包写入 `workspace/templates/<template-id>/`，manifest 标明引擎与 schema

---

## 模板包目录（沉淀完成长什么样）

```text
workspace/templates/<template-id>/
  template-manifest.md      # engine、课型、schema、如何出片
  structure/                # 页序 / page-map（给人看）
  visual/tokens.json        # 或指向引擎 tokens
  assets/                   # 默认识意图、占位
  samples/
    theme.script.json       # 或 content.json —— 写满的样例
  reuse/change-list.md
  output/courseware.pptx    # 用引擎跑样例的结果
```

`template-manifest.md` 最少写清：

```text
engine: skills/.../engines/disease-product-scenario-pptx-v1
schema: disease-product-scenario-script/v1
build: scripts/build_with_engine.sh disease-product-scenario <json> <out.pptx>
```

---

## 复用时（模式 2）— 与可可康同一路径

1. 选模板 → 读 manifest 的 **engine**  
2. **写满** 主题 script/content（材料优先；缺则起草并标待审）  
3. 业务点头  
4. `build_with_engine.sh` 出片；插图放 run 的 `assets/` 并写进 JSON  
5. 打开验收；细节再打磨版式代码或文案，不推倒换通用壳  

参考 run：`workspace/runs/kekang-lingzhi-reuse/`（绿 18 页 + 蓝 15 页）。

---

## 打开兼容（WPS / 办公软件）

- 引擎默认 **不强制字体 XML 补丁**（WPS 易挂）；需要时再 `--font-patch`  
- 若仍打不开：用 LibreOffice 重存一版，或先交付 PDF 预览  
- 验收时优先 PowerPoint / Keynote / 修复后的 pptx  

---

## 沉淀完成自检（代理打勾）

- [ ] 模板挂到 **引擎**，不是只靠 `build_pptx.py`  
- [ ] schema 样例 **写满**，能 `node export` / `build-editable` 跑通  
- [ ] 样例 pptx **本机能打开**  
- [ ] change-list 说明换主题只换内容/图  
- [ ] 包装无假图；敏感表述可标待审  

业务只需要记住：

> **1 存模板 = 存成以后能自动出片的那一套；2 换主题 = 换内容再按同一套出片。**  
> 效果要对齐你签过样的版式，细节后面慢慢磨。
