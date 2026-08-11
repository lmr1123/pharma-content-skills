# 示例（本 Skill 自有）

| 文件 | PPT 色板 | 插图 | 内容 |
|------|----------|------|------|
| disease-product-scenario-shell.content.json | ppt-courseware-green-v1 | illustration-medical-flat-color-v1 | **穿心莲真题摘要**（对标蓝） |
| disease-health-training-shell.content.json | ppt-health-training-blue-v1 | illustration-medical-flat-blue-v1 | 健康培训结构示例 |

正式绿引擎出片请用：  
`engines/disease-product-scenario-pptx-v1/samples/gold-chuanxinlian.script.json`（完整 script，非假数据壳）。

```bash
python3 scripts/build_pptx.py examples/disease-product-scenario-shell.content.json \
  ../../workspace/demo-disease-product-shell/output/courseware.pptx \
  --tokens references/styles/ppt-courseware-green-v1/tokens.json
```
