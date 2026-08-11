# 插图画风 · 医疗扁平（彩色）

| 项 | 值 |
|----|-----|
| style_id | `illustration-medical-flat-color-v1` |
| kind | illustration |
| 兼容 PPT | `ppt-courseware-green-v1`（母版可绿）、其他课型亦可 |

## 何时用

- **绿课型（穿心莲骨架）缺知识图时的默认生图画风**  
- 需要症状 / 人群 / 护理 / 场景示意，且希望插图是**彩色多色**，不是整页绿绿的  

## 语法要点

- 二维扁平医药科普；**多色**（青绿 + 暖橙/琥珀 + 浅蓝/紫灰点缀），浅底  
- **禁止**整图单色绿线稿 / 全绿 monochrome / 「绿滤镜」统一染色  
- 图内无文字、无真实包装与商标、无未审定药效大字  
- 方形主体居中，适合嵌进课件图槽  
- 气质亲和、非恐吓  

## 与 PPT 母版的关系

```text
PPT chrome / 主绿母版  ←  ppt-courseware-green-v1（可绿）
知识插图文件           ←  本规格（彩色）
```

包装实拍仍走 `business_asset`，禁止用本风格生成假包装。

## 回落

业务明确要更暖色门店风时，可用 `store-vitality-v1`。  
历史 id `illustration-medical-flat-green-v1` **不再作为绿课型默认**（易生成全绿插图）。
