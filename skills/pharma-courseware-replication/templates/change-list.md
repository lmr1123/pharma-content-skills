# 换主题更新点清单

| 项 | 内容 |
|----|------|
| 模板 | `{{template_id}}` |
| 原主题 | {{from_theme}} |
| 新主题 | {{to_theme}} |
| 风格（不动） | `{{visual_style_id}}` |

## 必须改（文案 content）

- [ ] …

## 必须换（业务图 business_asset）

- [ ] …

## 建议重生（插图 system_generate）

- [ ] …

## 不要动（framework / 视觉 token）

- [ ] 页序骨架与页型
- [ ] `visual/style-spec.md` 色板与页眉页脚
- [ ] …

## 待业务 / 待审核

- [ ] …

## 完成后

1. 更新 `structure/slots.json` 的 value/status  
2. 更新 `output/courseware.content.json`  
3. 运行 `scripts/build_pptx.py` 重导 `output/courseware.pptx`  
