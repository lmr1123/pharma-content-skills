# PPT 版式 · 商品培训绿

| 项 | 值 |
|----|-----|
| style_id | `ppt-courseware-green-v1` |
| style_pack_id | `style-pack.dashenlin-courseware-green-v1` |
| kind | ppt_chrome |
| 适用课型 | `disease-product-scenario-v1`（疾病+商品场景） |
| 引擎 | `engines/disease-product-scenario-pptx-v1/export.mjs` |
| 来源 | 生产仓已签样引擎 + dashenlin 绿 tokens（自包含迁入） |

## 何时用

- 业务选「疾病+商品场景」课型，或参考接近穿心莲骨架绿系  
- **正式出片必须跑引擎**，不是通用壳  

## 何时不用

- 业务参考是其他品牌色 → **从业务参考重新抽取** tokens，写入该模板包 `visual/`，布局仍优先用本引擎骨架  

## 色板 / 字阶

见同目录 `tokens.json`（与生产 `dashenlin-courseware-green-v1` 一致：Microsoft YaHei，主绿 `#009900` 等）。

## 配套插图

引擎输入里的 `image` 字段；演示真题见 `engines/.../samples/gold-chuanxinlian.script.json`。缺知识图默认 `illustration-medical-flat-color-v1`（彩色）补，**不改** PPT chrome 主绿。
