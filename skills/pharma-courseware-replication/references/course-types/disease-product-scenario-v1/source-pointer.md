# 课型说明 · 疾病+商品场景 v1

| 项 | 值 |
|----|-----|
| course_type_id | `disease-product-scenario-v1` |
| 业务名 | 疾病+商品场景培训 PPT |
| 角色 | **生产签样课型**（版式引擎自包含迁入） |
| 预制 PPT 视觉 | `ppt-courseware-green-v1` |
| 引擎 | `engines/disease-product-scenario-pptx-v1/` |
| 内容契约 | `disease-product-scenario-script/v1` |
| 填写说明 | `engines/disease-product-scenario-pptx-v1/本课型怎么填.md` |

## 板块骨架（引擎页序）

封面 → 开篇 → 目录 → 定义 → 症状 → 鉴别 → 原则 → 分型 → 商品信息 → 优势 → 总结 → 人群 → 问诊 → 场景×N → 日常关怀 → 权重品×N → 权重对比  

## 使用

1. 对照 `page-map.md` / `change-list.md` 与引擎 `input-schema.json` 写内容  
2. 中性样例：`engines/disease-product-scenario-pptx-v1/samples/neutral-theme.json`  
3. 出片：`scripts/build_with_engine.sh disease-product-scenario <script.json> <out.pptx>`  
4. **禁止**用 `scripts/build_pptx.py` 当本课型正式交付  
