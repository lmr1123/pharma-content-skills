# 课型说明 · 疾病健康知识培训 v1

| 项 | 值 |
|----|-----|
| course_type_id | `disease-health-training-v1` |
| 业务名 | 疾病健康知识培训 PPT |
| 角色 | **生产签样课型 · 参课蓝 v3**（生成器+插图自包含迁入） |
| 预制 PPT 视觉 | `ppt-health-training-blue-v1` |
| 引擎 | `engines/disease-health-shenke-blue-v1/` |
| 内容样例 | `engines/.../content/急性上呼吸道感染.content.json` |
| 填写说明 | `engines/disease-health-shenke-blue-v1/本课型怎么填.md` |

## 板块骨架

封面 → 目录 → 定义病因 → 临床表现 → 检查 → 治疗（一般/全身/局部）→ 对症表 → 注意事项×N → 关怀 → 特殊人群 → 收尾 → 一页通  

## 使用

1. 复制 content JSON 换病种字段；**勿改 scene_type / 版式金样**  
2. 授权包装图放 `assets/packshots/` 或覆盖 `assets/placeholders/`  
3. 出片：`scripts/build_with_engine.sh disease-health-shenke-blue <content.json> <out.pptx>`  
4. 插图已随引擎迁入（重绘知识图）；包装仍业务真图  
