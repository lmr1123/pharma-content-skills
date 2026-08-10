# 页型语汇（医药内训课件）

拆参考时 **优先使用下表 `id`**。无法归类时用 `custom`，并在 `label_zh` 写中文说明。

| id | 中文名 | 典型内容 |
|----|--------|----------|
| `cover` | 封面 | 课程名、主题名、品牌条 |
| `agenda` | 目录/议程 | 章节列表 |
| `objectives` | 学习目标 | 3～5 条目标 |
| `disease_overview` | 疾病/证候概述 | 定义、人群、诱因 |
| `symptoms` | 症状表现 | 卡片/图标列表 |
| `mechanism` | 机制/原理 | 简图 + 短句（须有来源） |
| `product_intro` | 单品介绍 | 品名、定位、包装位 |
| `ingredient` | 成分解读 | 成分名、作用简述（须审定） |
| `indication_scene` | 适用场景 | 场景卡、联合情境 |
| `comparison` | 对比 | 表格/双栏对比 |
| `usage` | 用法用量 | 剂量、疗程（须说明书/审定） |
| `caution` | 注意事项/禁忌 | 警示列表 |
| `medication_advice` | 用药建议 | 联合用药、生活建议 |
| `faq` | 常见问题 | Q&A |
| `summary` | 要点总结 | 3～7 条回顾 |
| `quiz` | 测验 | 题目与要点 |
| `outro` | 收尾/行动号召 | 回柜话术、联系方式 |
| `section_divider` | 章节隔页 | 大标题过渡 |
| `definition` | 定义页 | 证候/疾病定义条（场景课常用） |
| `treatment_block` | 治疗分块 | 一般/全身/局部等分节治疗 |
| `drug_table` | 药品表 | 对症表、注意表 |
| `care` | 关怀/护理 | 生活叮嘱、专业关怀卡 |
| `one_page_summary` | 一页通总结 | 课程浓缩（可 16:9 总结卡） |
| `weighted_product` | 权重/对标品 | 编码规格与对比（可整节删除） |
| `custom` | 其他 | 必须写清用途 |

## 视觉槽角色

| role | 含义 |
|------|------|
| `framework` | 版式装饰、背景、固定图标风格 |
| `content` | 随主题变的文案/数据 |
| `business_asset` | 业务必须提供的图（包装等） |
| `system_generate` | 可用中性图占位 |

## 课型标签（可选，粗粒度）

拆完后可给整份参考打 1 个主标签，便于检索与下游：

- `disease_edu` — 疾病/健康科普
- `product_training` — 单品/商品培训
- `ingredient_edu` — 成分科普
- `scenario_combo` — 疾病+商品场景
- `mixed` — 混合
- `unknown` — 未判断
