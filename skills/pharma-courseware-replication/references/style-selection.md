# 风格选择（两层）

| 层 | 含义 | 来源 |
|----|------|------|
| **A. PPT 版式** | 色板、页眉页脚、卡片母版 | 业务参考优先；否则课型预制绿/蓝 |
| **B. 知识插图** | 症状/护理等生成图 | 缺图时：课型配套插画 → 门店活力回落 |

## A. PPT 决策

```text
业务指定 / 参考可抽色板？
  ├─ 是 → 写入本模板 visual/style-spec.md + tokens.json
  └─ 否 → 课型？
            · disease-product-scenario → ppt-courseware-green-v1
            · disease-health-training  → ppt-health-training-blue-v1
            · 未定 → 问业务，或临时 pptx-shell-neutral-v1
```

禁止用门店活力做整课 PPT 换皮。

## B. 插图决策

```text
需要 system_generate？
  ├─ 参考图可用 → 跟参考画风
  ├─ PPT 为绿母版 → illustration-medical-flat-green-v1
  ├─ PPT 为蓝母版 → illustration-medical-flat-blue-v1
  └─ 其他 / 业务要暖色 → store-vitality-v1
包装/logo → 永远 business_asset，不生成假包装
```

## 写入

- `meta.style_id` / `visual_style_id` → A  
- `meta.illustration_style_id` / `illustration_style_id` → B  
