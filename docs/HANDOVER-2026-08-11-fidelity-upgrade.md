# HANDOVER · 穿心莲高保真复刻升级（交接下一模型）

**日期：** 2026-08-11  
**仓库：** `pharma-content-skills`（`main` @ `96cb78f` 及之后本地未提交改动以本文件为准）  
**Skill：** `skills/pharma-courseware-replication` v0.3.1  
**本交接目标：** 把「穿心莲」签样视觉真正对齐到可编辑金样，并把**对齐方法**写回 Skill，使业务**沉淀新 PPT**也能达到同级质量。

---

## 0. 给下一任代理的一句话

> **路径已经对了（签样引擎 + 写满 JSON + 出片），但穿心莲视觉保真尚未完成。**  
> 业务反馈：排版、字体、标题/重点色、插画风格细节差很大。  
> 下一任不要再换通用壳、不要推倒重写引擎架构；要对着**金样画面**做**逐页差分升级**，并把 checklist / tokens / 引擎改动**沉淀进 Skill**。

---

## 1. 业务已确认的结论（DO / DON'T）

### DO

| 做 | 说明 |
|----|------|
| **同一引擎路径** | 沉淀（模式 1）与复用（模式 2）共用 `engines/*`，见 `docs/deposit-to-reuse.md` |
| **内容先行** | 模式 2 先写满 `content-draft` / script JSON，业务确认再出正式片 |
| **对照金样差分** | 升级以「可编辑重建版 + PDF 高保真 + inspect」为视觉真源，逐页修 `export.mjs` / 蓝引擎 |
| **改完回写 Skill** | tokens、字阶、chrome、页布局、验收清单、样例片 QA 证据都进仓库 |
| **可可康仅作路径样例** | `workspace/runs/kekang-lingzhi-reuse/` = 路径验收；**不等于**穿心莲视觉已签样 |

### DON'T

| 禁止 | 原因 |
|------|------|
| 用 `scripts/build_pptx.py` 当签样课型交付 | 通用壳，业务已否定 |
| 再造「A/B 质量分级」叙事 | 业务要求：只有签样引擎路径 |
| 运行时依赖 `chain-pharmacy-content-studio` 路径 | Skill 必须自包含；只允许**对照**生产仓金样 |
| 把金样穿心莲医学文案/症状图拷进非金样主题 | 绿引擎有 `GOLD_FORBIDDEN` + 资产阻断 |
| 破坏性默认开字体 XML 补丁 | WPS 易打不开；`--font-patch` 仅 opt-in |
| 整文件重写 `export.mjs` 而不对照金样 | 易丢已迁入的布局；应 Edit 逐页对齐 |
| 只改 markdown、不改引擎代码就宣称「保真完成」 | 业务要的是打开 PPT 的观感 |

---

## 2. 当前状态（诚实基线）

### 已完成（v0.3 / v0.3.1）

- 两套生产引擎**自包含迁入** `skills/pharma-courseware-replication/engines/`
  - 绿：`disease-product-scenario-pptx-v1`（pptxgenjs 移植生产布局）
  - 蓝：`disease-health-shenke-blue-v1`（生成器 + assets）
- 正式出片：`scripts/build_with_engine.sh`
- 沉淀=复用路径文档：`docs/deposit-to-reuse.md`
- 可可康双课型跑通 18+15 页，业务评价：**初步可以，细节后磨**；并要求**沉淀也要走同一路径**

### 未完成（本交接核心）

| 缺口 | 业务原话维度 | 当前表现 |
|------|----------------|----------|
| 排版 | 「细节差异很大」 | 页拓扑/间距/卡片与金样不完全一致；部分页是引擎简化版 |
| 字体 / 字阶 | 标题、正文大小 | Skill 移植时**系统缩小**了多处字号（见 §4） |
| 颜色 | 标题、重点突出 | chrome 标题色/强调条/主绿层级需对照金样；部分强调未对齐 |
| 插画风格 | 知识图气质 | 换题插图多为占位/异源素材，未统一到金样知识插画规范 |
| 金样主题真机对照 | 穿心莲本尊 | 尚未用**穿心莲 script + 金样图**出片并做 18 页并排 QA 签样 |

**结论：** 「能出片」≠「穿心莲复刻完成」。下一任任务 = **保真升级 + 方法沉淀**。

---

## 3. 视觉真源与代码真源（必须分清）

### 3.1 视觉真源（用户眼睛认的「穿心莲效果」）

生产仓（**对照用，不作为 Skill 运行时依赖**）：

```text
# 签样可编辑重建（canonical artifact，manifest 已写）
chain-pharmacy-content-studio/production-library/templates/settled/disease-product-scenario-v1/
  穿心莲内酯滴丸_商品培训课件2_可编辑重建版.pptx
  穿心莲内酯滴丸_商品培训课件2_可编辑重建版.pptx.inspect.ndjson
  preview/cover.png + key-01..05.png

# 校验根
chain-pharmacy-content-studio/production-library/validation/courseware/disease-product-scenario-v1/
  穿心莲内酯滴丸_商品培训课件2_可编辑重建版.pdf
  穿心莲内酯滴丸_商品培训课件2_PDF高保真基线.pdf / .pptx
  qa-editable/  qa-reference/   # 若有逐页 PNG 优先用
  upgrade-v2/                   # 历史升级对照 montage，可参考方法
```

Skill 内已拷贝的对照物：

```text
skills/pharma-courseware-replication/engines/disease-product-scenario-pptx-v1/
  gold-layout.inspect.ndjson   # 可编辑重建布局树（bbox + name + text）
  preview/*.png                # 关键帧
  tokens.json
  export.mjs                   # 当前要改的主文件
  export.prod-artifact-tool.mjs # 生产 artifact-tool 版存档（对照布局用）
  samples/neutral-theme.json
```

### 3.2 代码真源

| 层 | 路径 | 角色 |
|----|------|------|
| Skill 正式渲染 | `engines/disease-product-scenario-pptx-v1/export.mjs` | **改这里**交付 |
| 生产原版（artifact-tool） | 生产仓同名 `export.mjs` + Skill 内 `export.prod-artifact-tool.mjs` | 字阶/坐标对照；Skill 禁止运行时依赖 monorepo |
| 布局树 | `gold-layout.inspect.ndjson` | **几何/命名**对照；注意：个别页拓扑与现引擎「三柱/两列目录」并不完全相同 |
| 蓝课型 | `engines/disease-health-shenke-blue-v1/` | 本轮若时间紧可后置；用户点名的是穿心莲绿 |

### 3.3 重要认知：inspect 与引擎布局可能「两套叙事」

`gold-layout.inspect.ndjson` 来自**可编辑重建版**，例如：

- **Opening（slide 2）**：`opening-thesis-*`、`opening-focus-*` 等命名表面，偏「论断条 + 焦点卡」
- **Agenda（slide 3）**：右侧竖向 `目 录` + chip 列表（`agenda-chip-*`），不是 2×2 大卡
- **Disease def（slide 4）**：全宽 `definition-surface` + 左侧节号 `1.1`；引擎现版是「左图右文 + tags」
- **Chrome**：节号可为 `1.1` / `1.2`；页脚 `02 / 18`

而 **生产 export / Skill export** 当前是数据驱动的「可复用骨架」（三柱 opening、2×2 agenda、左图右文定义…），字阶在生产版更接近签样数字，Skill 移植时又缩小了一档。

**升级策略（强制）：**

1. **第一优先**：把 Skill 字阶 / chrome / 封面 / 强调色 **对齐生产 export 数字**（低风险、立刻改善「字体颜色标题」）。  
2. **第二优先**：对业务最敏感的页（封面、目录、辨证定义、症状、商品优势、场景对话），用 **PDF/preview 并排**，按需把拓扑改向 **gold inspect**（可能改 schema 字段映射，要兼容已有 kekang script）。  
3. **禁止**：在没打开金样 PDF/preview 的情况下凭感觉改布局。

---

## 4. 已定位的硬差距（Skill vs 生产 export，可立即修）

以下来自代码对照（单位：pt / px 布局坐标一致为 1280×720）。

| 位置 | 生产 export | Skill export（当前） | 影响 |
|------|-------------|----------------------|------|
| chrome 节号字 | size **20** | **16** | 左上角章节块发虚 |
| chrome 标题 | size **27** | **22** | 标题不够醒目（业务点名） |
| chrome 品牌 | size **14** | **12** | 右上角弱 |
| chrome 页脚提示 | size **11** | **10** | 次要 |
| chrome 页码 | size **12**，仅序号 | **11** + `NN / total` 格式略不同 | 可对齐生产或对齐金样 `02 / 18` |
| 封面组织名 | **18** | **16** | |
| 封面 eyebrow | **17** | **15** | |
| 封面主标题 | **40** | **32** | 主视觉塌陷 |
| 封面副标题 | **21** | **18** | |
| 封面底部说明 | **14 / 12** | **12 / 11** | |
| Opening kicker | **18** | **16** | |
| Opening headline | **34** | **28** | |
| Opening 柱标题/正文 | **20 / 16** | **18 / 14** | |
| Opening quote | **20** | **17** | |
| Agenda 序号/标题 | **30 / 21** | **26 / 18** | |
| 疾病定义病名/正文 | **31 / 21** | **26 / 16** | |
| 封面装饰圆 | 空心描边 orbit | 实心盘 | 气质不同 |
| bullet 默认 | size **18** | **17** | 全文偏小 |

**tokens.json** 声明 `page_title: 26`、`cover_title: 36`，但与生产 chrome **27 / 封面 40** 也不一致——升级时应 **以生产 export + 金样观感为准回写 tokens**，避免文档与代码两套数。

颜色 tokens（绿系）本身大致正确：

```text
primary #009900 / deep #066A2F / secondary #45A817
mint #E9F7EE / pale #F4FAF5 / ink #1F2A24 / muted #5A6B61
red #E60012 / cover_teal #006D58 / cover_blue #176A91
```

重点色问题更多在 **用在哪、字多大、哪条强调线**，不是换一套色板。

---

## 5. 下一任工作计划（按优先级）

### Phase A · 字阶与 chrome 对齐（预计 0.5–1 天）→ 验证：导出后标题明显变接近

1. 打开并并排：
   - 金样 PDF 或 preview key frames  
   - 当前 Skill 中性样例出片  
2. 编辑 `export.mjs`：`addChrome`、封面、opening、agenda、各页 `size:` **逐项对齐生产 export**（可用 `diff` 生产 `export.mjs` vs Skill `export.mjs`）。  
3. 回写 `tokens.json` 的 `type_scale_pt` 与真实代码一致。  
4. 封面 orbit：尽量用 pptxgenjs 描边椭圆复现空心环；若 API 限制，在注释中写降级说明，不要实心糊一块。  
5. 重跑：

```bash
cd skills/pharma-courseware-replication/engines/disease-product-scenario-pptx-v1
npm i   # 若需要
node export.mjs \
  --data samples/neutral-theme.json \
  --out /tmp/chuanxinlian-fidelity-neutral.pptx \
  --qa /tmp/chuanxinlian-fidelity-qa
```

6. 用 Keynote/PPT/LibreOffice 打开；WPS 不稳时 LO 重存，**不要**默认 `--font-patch`。

**完成标准 A：** 任意内容页 chrome 标题字号/颜色/绿强调条与生产 export 一致；封面主标题观感不再「缩小一号」。

---

### Phase B · 穿心莲真题出片 + 逐页并排 QA（1–2 天）→ 验证：18 页差分表

1. **准备金样主题输入（仅保真验收，遵守医学阻断例外）**  
   - 生产引擎允许 `meta.theme_id === theme.product.andrographolide-drop-pills` 使用金样文案。  
   - 从生产仓 settled / validation 找回签样 script 或从 inspect 文本回填 `samples/gold-chuanxinlian.script.json`（**可进 Skill 的中性结构字段；包装真图可不进 git，本机绝对路径或 gitignored assets**）。  
2. 导出 `workspace/runs/chuanxinlian-fidelity-qa/output/`。  
3. 建差分表（建议直接写进该 run 的 `FIDELITY-DIFF.md`）：

| 页 | 页型 | 排版 | 字阶 | 颜色/强调 | 插图 | 处理 |
|----|------|------|------|-----------|------|------|
| 01 封面 | cover | | | | | |
| … | | 用 🔴/🟡/🟢 | | | | |

4. 优先修 🔴 页；每修 2–3 页重导出一次，避免一次改飞。  
5. 拓扑若与 gold inspect 冲突：  
   - 先问：**业务签的是「可编辑重建画面」还是「数据引擎可复用骨架」？**  
   - 默认建议：**观感跟金样，字段仍走 schema**；必要时扩展可选字段，保持 kekang script 可跑。

**完成标准 B：** 18 页差分表无 🔴；业务可对照 PDF 说「穿心莲这套可以」。

---

### Phase C · 插画风格规范沉淀（1 天）→ 验证：换题图也像一套课

1. 从金样/参课蓝提炼 **知识插画规范**（构图、留白、线面、禁止写实假药盒、禁止与包装坑位抢视觉）。  
2. 写入 Skill：  
   - `references/illustration-style-green-v1.md`（新建）  
   - 更新 `references/style-selection.md`、`templates/asset-map.md`  
3. 绿课型 `assets/`：缺图占位风格统一；模式 2 生图默认跟此规范（门店活力 **仅** 在无规范时回落，见 lessons）。  
4. 包装：**只**业务授权真图路径，禁止 AI 假包装。

**完成标准 C：** 新主题插图清单 + 1 页样例图气质与 preview 一致；文档可被模式 1 沉淀复用。

---

### Phase D · 把「高保真方法」写进 Skill，服务业务沉淀（0.5 天）→ 验证：模式 1 checklist 可勾

把下列固化进仓库（下一任做完后打勾）：

| 交付物 | 建议路径 |
|--------|----------|
| 本交接后续更新 / 完成报告 | `docs/HANDOVER-2026-08-11-fidelity-upgrade.md`（本文件 §9 填结果） |
| 保真验收清单 | `skills/pharma-courseware-replication/references/fidelity-qa-checklist.md` |
| 绿引擎 tokens + export 修复 | `engines/disease-product-scenario-pptx-v1/` |
| 金样对照说明 | `engines/.../FIDELITY.md`（真源路径、diff 命令、禁止事项） |
| 样例出片证据（可 git-lfs 或本机-only） | `workspace/runs/chuanxinlian-fidelity-qa/` |
| 沉淀模板示例 | `workspace/templates/disease-product-scenario-v1/`（manifest 挂引擎 + 写满 sample） |
| 版本 | `SKILL.md` → **0.3.2**（或 0.4.0 若拓扑大改） |

**模式 1 沉淀完成定义（升级后）：**

1. 挂引擎（不是通用壳）  
2. schema 写满样例  
3. **按 fidelity checklist 过一遍关键帧**（封面 + 目录 + 1 知识页 + 1 商品页 + 1 场景页）  
4. 样例 pptx 可打开  
5. `reuse/change-list.md` 写清换题只换内容/图  

业务口语不变：

```text
1. 复刻 PPT 模板
2. 选模板生成 PPT
```

---

## 6. 推荐操作顺序（复制即用）

```bash
# 0. 仓根
cd /Users/liminrong/Projects/pharma-content-skills

# 1. 字阶 diff 线索（生产 vs Skill）
diff -u \
  ../chain-pharmacy-content-studio/production-library/engines/disease-product-scenario-pptx-v1/export.mjs \
  skills/pharma-courseware-replication/engines/disease-product-scenario-pptx-v1/export.mjs \
  | head -200

# 2. 金样布局检索（按页）
rg '"slide": 2' skills/pharma-courseware-replication/engines/disease-product-scenario-pptx-v1/gold-layout.inspect.ndjson | head

# 3. 改 export.mjs / tokens.json 后出片
cd skills/pharma-courseware-replication/engines/disease-product-scenario-pptx-v1
node export.mjs --data samples/neutral-theme.json --out /tmp/fidelity-neutral.pptx

# 4. 可可康回归（勿回归坏路径）
node export.mjs \
  --data ../../../workspace/runs/kekang-lingzhi-reuse/green/kekang-lingzhi.script.json \
  --out /tmp/kekang-green-regression.pptx
```

可选：LibreOffice 转 PDF 做并排：

```bash
soffice --headless --convert-to pdf --outdir /tmp /tmp/fidelity-neutral.pptx
```

---

## 7. 文件地图（下一任只碰这些）

### 必读

1. 本文件  
2. `docs/deposit-to-reuse.md`  
3. `skills/pharma-courseware-replication/SKILL.md`  
4. `skills/pharma-courseware-replication/engines/README.md`  
5. `tasks/lessons.md`  
6. `workspace/runs/kekang-lingzhi-reuse/README.md`

### 必改（保真）

- `engines/disease-product-scenario-pptx-v1/export.mjs`  
- `engines/disease-product-scenario-pptx-v1/tokens.json`  
- （后续）`references/fidelity-qa-checklist.md`、`engines/.../FIDELITY.md`

### 勿改 / 慎改

- 不要删 `GOLD_FORBIDDEN` 与非金样主题阻断  
- 不要把通用壳升格为默认  
- 不要在 `~/.claude/settings.json` 写模型映射（全局环境课）  
- 蓝引擎除非用户点名同步保真，否则本轮聚焦绿穿心莲

---

## 8. 验收对话（交给业务时用）

```text
这次升级对齐的是「穿心莲」签样画面，不是再换一套壳。

请打开：
1）金样 PDF / 可编辑重建版
2）我们新出的穿心莲保真片（或中性样例 + 可可康回归片）

请重点看：
- 标题大小与颜色是否接近
- 重点绿/强调是否到位
- 目录/知识页/商品页排版是否顺眼
- 插图是否像同一套课

回复：
- 「通过」→ 我把改动写进 Skill，沉淀模板按此标准
- 「第 N 页还差…」→ 我按页继续改
```

---

## 9. 完成结果区（下一任填写）

- [x] Phase A 字阶/chrome 对齐，tokens 回写（2026-08-11，见 tokens.json `note`）
- [x] Phase B 穿心莲 18 页差分无 🔴（2026-08-11，差分表 `workspace/runs/chuanxinlian-fidelity-qa/FIDELITY-DIFF.md`；业务口头通过待签）
- [ ] Phase C 插画规范文档 + 样例（未做，留下一任）
- [x] Phase D checklist / FIDELITY.md / SKILL 版本 bump（0.3.1→0.3.2，2026-08-11）
- [x] 可可康回归仍可出片（18 页、0 缺图、0 违禁命中，2026-08-11 复测）
- [x] git commit 信息建议：`fix(engine): align green courseware type scale and chrome to gold`（已按此提交）
- [ ] 业务沉淀试跑：模式 1 新参考挂引擎 + fidelity 五帧检查（留业务触发）

**实际 diff 摘要：** 绿引擎 8 页 🔴 拓扑全部由「数据触发的金样变体」修复（6 双色板 / 7 总结条 / 8 双栏卡 / 9 信息面板 / 12 箭头流 / 16 五项叮嘱 / 17 权重明细整页几何 / 18 对照表图片行+合并单元格），另修目录 ellipse 序号点、优势节点 X 非均分、删 p17 多余图注；18/18 页排版拓扑与 gold 一致，字阶经 layout json 核实，颜色经 PNG 像素采样核实。剩余 🟡 两类：行内强调 run 未逐字转写（引擎已支持 run 数组）、无雅黑机器的 LibreOffice 字体替代换行（环境差异，方法见 FIDELITY-DIFF.md §方法论）。可可康回归常绿（变体全 opt-in）。
**业务签样人/日期：** _（待业务口头确认后填）_  

---

## 10. 已知环境坑

| 坑 | 处理 |
|----|------|
| WPS 打不开 pptxgenjs 产物 | 默认关 font-patch；LibreOffice 重存；先交 PDF |
| 生产 export 依赖 `@oai/artifact-tool` | Skill 用 pptxgenjs；只对照坐标/字号，不引入 monorepo |
| 金样包装/症状真图版权 | 不进公开 git；本机路径或 gitignore |
| 非金样主题写入「穿心莲」等关键词 | 引擎硬失败——正确行为，保真验收需用金样 theme_id |
| 用户说「初步可以」只针对路径 | 不要把可可康当穿心莲保真完成证据 |

---

## 11. 与「沉淀新 PPT 也要高质量」的闭环

```text
业务丢参考 PPT
    ↓ 模式 1
判断课型 → 挂绿/蓝引擎 或 新建 engines/<id>
    ↓
按 fidelity-qa-checklist 抽关键帧对齐（排版/字/色/图）
    ↓
写满 sample JSON + 引擎跑通样例片
    ↓ 模式 2
换题只改 JSON/图 → 同一引擎出片
    ↓
效果 ≈ 签样引擎当前保真水位（本轮要把水位抬到穿心莲金样）
```

**没有引擎保真，沉淀只会复制「能出片」；有引擎保真，沉淀才能复制「像金样」。**

---

## 12. 联系上下文（会话摘要）

- 独立仓从通用壳演进到生产引擎迁入（v0.3）  
- 可可康双引擎复用验收通过「路径」；WPS 问题已记录  
- 业务最新要求：**穿心莲细节未达标 → 细致对照升级；写交接；结果沉淀 Skill；业务沉淀同质**  

**下一任启动句（可复制）：**

> 读 `docs/HANDOVER-2026-08-11-fidelity-upgrade.md`，从 Phase A 修绿引擎字阶与 chrome，对照生产 export 与 gold-layout.inspect，再出穿心莲保真片做 18 页差分。
