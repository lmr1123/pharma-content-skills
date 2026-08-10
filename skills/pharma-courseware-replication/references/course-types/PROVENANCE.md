# 课型版式来源（生产仓迁入）

| course_type_id | 生产模板 | 迁入引擎 | 签样状态 |
|----------------|----------|----------|----------|
| `disease-product-scenario-v1` | `templates/settled/disease-product-scenario-v1` | `engines/disease-product-scenario-pptx-v1` | 已签样 · PPTX 可生成 |
| `disease-health-training-v1` | `templates/settled/disease-health-shenke-blue-v1` | `engines/disease-health-shenke-blue-v1` | 金样 v3 可生成 |

**正式复用 = 跑迁入引擎**，不是 `scripts/build_pptx.py` 通用壳。

通用壳仅保留给「未知课型 / 结构烟测」，交付前须标明「非金样版式」。
