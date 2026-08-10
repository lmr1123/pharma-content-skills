# Todo · pharma-content-skills

## Done

- [x] 独立项目脚手架与 Skill v0.2+
- [x] 模板包 + PPTX + 换题清单
- [x] 风格两层：PPT 跟参考；插图分层（门店活力仅插图回落）
- [x] Skill 自有绿/蓝色板与插图 id（与外部仓脱钩）
- [x] 业务使用说明 `docs/business-usage.md`
- [x] Git 远程发布 + 安装/双模式文档
- [x] **v0.3：生产仓两套金样引擎自包含迁入**（穿心莲绿 + 参课蓝），正式出片走 engines

## Next

- [ ] 用业务真实脱敏参考跑通：内容初稿 → 引擎出片 + 批量两主题
- [ ] 穿心莲引擎若要像素级贴齐「可编辑重建版」inspect，在现有引擎上增量对齐（有差异再补，不推倒重来）
- [ ] 可选：artifact-tool 级 PNG QA 自包含替代

## Review · v0.3 引擎迁入

- 迁入：`engines/disease-product-scenario-pptx-v1`（pptxgenjs 移植生产布局）、`engines/disease-health-shenke-blue-v1`（生成器+assets）
- 烟测：中性 18 页绿 + 参课蓝 18 页均成功出片
- 未迁：生产 monorepo 路径依赖、金样业务包装真图二进制、artifact-tool 逐页 PNG QA

## Out of scope

- 其他 monorepo、数字人、设备密钥
