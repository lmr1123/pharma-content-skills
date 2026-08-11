# Todo · pharma-content-skills

## Done

- [x] 独立项目脚手架与 Skill v0.2+
- [x] 模板包 + PPTX + 换题清单
- [x] 风格两层：PPT 跟参考；插图分层（门店活力仅插图回落）
- [x] Skill 自有绿/蓝色板与插图 id（与外部仓脱钩）
- [x] 业务使用说明 `docs/business-usage.md`
- [x] Git 远程发布 + 安装/双模式文档
- [x] **v0.3：生产仓两套金样引擎自包含迁入**（穿心莲绿 + 参课蓝），正式出片走 engines
- [x] **v0.3.1：可可康复用验收路径固化**（`docs/deposit-to-reuse.md`：沉淀=挂引擎）

## Next · 穿心莲高保真升级（交接）

> 完整说明：`docs/HANDOVER-2026-08-11-fidelity-upgrade.md`  
> 业务判定：路径 OK（可可康），**穿心莲视觉未复刻完成**（排版/字/色/插画）。

- [x] **Phase A** 绿引擎字阶 + chrome + 封面 对齐生产 export；回写 `tokens.json`（2026-08-11）
- [x] **Phase B** 穿心莲真题出片 + 18 页 `FIDELITY-DIFF`；修 🔴 页（8 页全修复，2026-08-11）
- [ ] **Phase C** 知识插画风格规范写进 `references/`；换题图跟规范
- [x] **Phase D** `fidelity-qa-checklist.md` + 引擎 `FIDELITY.md` + SKILL 版本（0.3.2，2026-08-11）；业务模式 1 试跑留待触发
- [x] 可可康回归出片不破（18 页 / 0 缺图 / 0 违禁，2026-08-11 复测）
- [ ] 真实业务参考走一遍模式 1（挂引擎 + 保真清单）→ 模式 2 换题
- [ ] 可选：出片后自动 LibreOffice 重存，降低 WPS 打不开

## Review · v0.3 引擎迁入

- 迁入：`engines/disease-product-scenario-pptx-v1`（pptxgenjs 移植生产布局）、`engines/disease-health-shenke-blue-v1`（生成器+assets）
- 烟测：中性 18 页绿 + 参课蓝 18 页均成功出片
- 未迁：生产 monorepo 路径依赖、金样业务包装真图二进制、artifact-tool 逐页 PNG QA

## Review · v0.3.1 路径锁定

- 可可康双课型复用：业务认可「初步效果 + 路径可沉淀」
- 文档：`docs/deposit-to-reuse.md`
- **仍欠：** 穿心莲金样级保真（见 HANDOVER）

## Review · v0.3.2 穿心莲保真对齐（2026-08-11）

- 8 页 🔴 拓扑以数据触发的金样变体修复：p6 双色板 / p7 总结条 / p8 双栏卡 / p9 信息面板 / p12 箭头流 / p16 五项叮嘱 / p17 权重明细整页几何 / p18 对照表图片行+同值合并；另修目录 ellipse chip、优势节点 X [130,400,680,960]、删 p17 多余图注
- 18/18 排版拓扑一致；字阶经 gold layout json 核实（仅 p17 数据行 fs17 统一、gold fs19 差 2pt）；颜色经 PNG 像素采样核实
- 已知 🟡：行内强调 run 未逐字转写（引擎已具备 run 数组能力）；无雅黑机器 LibreOffice 字体替代换行为环境差异（方法见 FIDELITY-DIFF.md）
- 引擎新增：addText run 数组；schema 增 memory/change_note/treatment_summary/variant/flows/blocks/locked_image/weighted 行级参数等（全 opt-in，可可康回归常绿）
- 产物：`workspace/runs/chuanxinlian-fidelity-qa/`（pptx + render + compare/pair-NN + FIDELITY-DIFF.md）；方法沉淀 `engines/.../FIDELITY.md` + `references/fidelity-qa-checklist.md`

## Out of scope

- 其他 monorepo、数字人、设备密钥
