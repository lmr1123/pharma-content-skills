# AGENTS · Pharma Content Skills

面向在本仓库内维护 Skill、协助业务跑 Skill 的代理。

## 项目边界

- 本仓 = **医药向通用 Skill 集合**，轻量、可独立交付。
- **不要**把连锁药店内容工作室（出片管线、金样库、设备安装、数字人渲染）搬进本仓。
- 需要高保真出片时：产出交接物（方案卡 + 槽位表），提示对接生产仓或其他 Skill，而不是在本仓实现整条渲染链。

## 改 Skill 时

1. 先读目标 Skill 的 `SKILL.md` 与 `references/`。
2. **一个 Skill 一个职责**；新能力优先新建 `skills/<name>/`，不要无限加长现有 Skill。
3. 事实单源：红线、输出 schema、页型语汇放在 `references/`，`SKILL.md` 只写流程与入口。
4. 改输出契约时同步 `templates/` 与 `docs/multi-skill-collab.md`。
5. 业务可纠正的规则写入 `tasks/lessons.md`。

## 跑 Skill 时（业务会话）

1. 确认用户意图落在哪个 Skill；不匹配则说明并建议正确 Skill。
2. 产物默认写到 `workspace/<run-id>/`（本机），不要污染 `skills/`。
3. 医药红线：不编造适应症、数据、功效；缺审定文案就标「待业务提供」。
4. 参考素材：只学结构与版式逻辑；不把参考像素当可商用生产资产。

## 多 Skill 协同

- 上游产物必须是约定格式（见 `docs/multi-skill-collab.md`）。
- 下游 Skill 只消费契约字段，不假设上游实现细节。
- 禁止「一个超级 Skill 包办从参考到成片」。

## 禁止

- 在本仓提交业务包装实拍、未授权金样像素、个人密钥。
- 向业务承诺「任意参考一次像素级复刻」。
- 要求业务为了用本 Skill 先装完整生产大仓。
