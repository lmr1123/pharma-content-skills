---
name: pharma-courseware-replication
version: 0.1.0
description: >
  医药/连锁药店内训场景：把业务指定的参考课件（PPT/PDF/截图）拆成可复用的结构与槽位，
  并支持按新病种/单品重填。用于「参考这份来做」「沉淀结构以便复用」，不是生产仓出片或数字人渲染。
  触发词：课件复刻、结构拆解、按参考做PPT、槽位表、医药培训模板拆解、换成XX主题。
---

# 医药课件结构复刻

## 定位

| 做 | 不做 |
|----|------|
| 拆参考的页序、页型、文案槽、视觉槽 | 像素级自动复刻任意参考 |
| 区分固定框架 vs 可换内容 vs 须业务提供资产 | 编造适应症、数据、功效话术 |
| 输出方案卡 + 机读槽位表 | 写入生产仓 settled / 设备安装 |
| 按同一结构生成新主题填写清单 | TTS、数字人口型、完整渲染管线 |

**参考源由业务指定。** 历史金样只可作示例，不是唯一标准。

## 何时启用

- 用户给出参考 PPT/PDF/多页截图，要求「按这个结构和风格做」
- 用户要把某份认可的课件「沉淀成可复用结构」（非入库生产系统）
- 用户要在已拆结构上「换成另一病种/单品」并列出待填项

不启用：只要下载现成生产模板出片 → 应走内容工作室业务路径；只要改几个字 → 普通编辑即可。

## 开始前读取

1. `references/compliance-redlines.md` — 医药红线（必守）
2. `references/page-type-vocabulary.md` — 页型语汇（优先用表内名称）
3. `references/output-contract.md` — 产物字段说明
4. 输出模板：`templates/replication-plan.md`、`templates/slots.schema.json`

## 工作流

### A. 拆参考（Replication）

1. **收集输入**
   - 参考文件路径或已粘贴的页说明
   - 业务一句话目标（门店培训 / 总部课件 / 仅结构学习）
   - 是否已有审定文案（有则绑定，无则槽位留空并标记 `pending_business`）

2. **逐页观察**（有文件则读；仅截图则按图；信息不足就问，不猜关键药学结论）
   - 页码、标题、主要区块
   - 文案：哪些像固定话术框架，哪些是主题相关
   - 图：包装实拍 / 示意图 / 装饰 / 图标
   - 布局：左右分栏、卡片网格、流程、对比、总结

3. **归类每个槽位**
   - `framework`：版式/装饰，换主题通常保留逻辑
   - `content`：随主题替换的文案或数据（须审定来源）
   - `business_asset`：包装图、logo、证照等必须业务提供
   - `system_generate`：可用中性示意图占位（不得冒充实拍包装）

4. **写产物**到 `workspace/<run-id>/`（若在仓库内跑）：
   - `replication-plan.md` — 用 `templates/replication-plan.md`
   - `slots.json` — 符合 `templates/slots.schema.json`
   - 可选 `handoff-note.md` — 未决问题、建议的下游 Skill

5. **向用户交代**
   - 共几页、核心结构
   - 换主题最少要提供什么
   - 合规与素材风险各一条
   - 明确：当前是结构级复刻，不是成品出片

### B. 主题重填（Refill）

前置：已有本 Skill 产出的 `slots.json`（或同等结构）。

1. 读入槽位表 + 新主题名称与业务提供的材料清单。
2. 只填充 `content` / 已提供的 `business_asset` 路径；**禁止**用模型编造药效数据与适应症。
3. 输出 `fill-checklist.md`：已填 / 待业务 / 待审核。
4. 更新 `slots.json` 的 `values` 与 `status` 字段；不擅自删框架槽。

### C. 交给下游（可选）

若用户要高保真 PPT/视频：

- 交付 `replication-plan.md` + `slots.json` + 授权素材列表
- 说明可对接：内容工作室生产仓，或其他出片 Skill
- **本 Skill 到此结束**，不在本仓启动渲染

## 质量自检

- [ ] 每页有页型标签（尽量来自页型语汇表）
- [ ] 每个视觉槽有角色：`business_asset` / `system_generate` / `framework`
- [ ] 无「看起来像药效结论但无来源」的已填正文
- [ ] 方案卡写明「学结构不搬参考像素」
- [ ] 未要求业务安装生产大仓

## 协同

见仓库根目录 `docs/multi-skill-collab.md`。本 Skill 是链上的 **结构入口**，不是终点工厂。
