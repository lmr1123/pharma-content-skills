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

## Next

- [ ] 真实业务参考走一遍模式 1 沉淀（挂绿或蓝引擎）→ 模式 2 换题
- [ ] 细节打磨：按业务点名页增量改引擎布局（不推倒）
- [ ] 可选：出片后自动 LibreOffice 重存，降低 WPS 打不开

## Review · v0.3 引擎迁入

- 迁入：`engines/disease-product-scenario-pptx-v1`（pptxgenjs 移植生产布局）、`engines/disease-health-shenke-blue-v1`（生成器+assets）
- 烟测：中性 18 页绿 + 参课蓝 18 页均成功出片
- 未迁：生产 monorepo 路径依赖、金样业务包装真图二进制、artifact-tool 逐页 PNG QA

## Out of scope

- 其他 monorepo、数字人、设备密钥
