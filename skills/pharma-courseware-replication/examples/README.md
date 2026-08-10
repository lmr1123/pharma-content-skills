# 示例（本 Skill 自有）

| 文件 | PPT 色板 | 插图 |
|------|----------|------|
| disease-product-scenario-shell.content.json | ppt-courseware-green-v1 | illustration-medical-flat-green-v1 |
| disease-health-training-shell.content.json | ppt-health-training-blue-v1 | illustration-medical-flat-blue-v1 |

```bash
python3 scripts/build_pptx.py examples/disease-product-scenario-shell.content.json \
  ../../workspace/demo-disease-product-shell/output/courseware.pptx \
  --tokens references/styles/ppt-courseware-green-v1/tokens.json
```
