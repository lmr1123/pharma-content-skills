# 产线 B · 知识插图提示词硬规则（米白番茄红金样）

**style_pack_id:** `style-pack.lycopene-health-edu-cream-red-v1`

## 必须

- 画风：扁平健康科普插画 / 轻杂志感；亲和、干净，**不是**厚涂、3D 写实、照片拼贴
- 主色锚：番茄红 `#D32F2F` 作点缀；辅绿 `#4CAF50` 仅正向语义；底与卡片感贴近米白 `#FBF7F0` / 白卡
- **透明底 PNG**（alpha）：主体居中，占画面约 65%–85%；**禁止**整页海报式留白文案区
- 单槽单语义：只画当前图槽含义，**不要**在图内写 PPT 标题长文
- 输出：PNG，建议 ≥512px 短边；正式绑定 formal 模式要求真实 PNG 文件

## 禁止

- 默认用 `store-vitality-v1` / 全绿 monochrome 医疗线稿当本课型图
- 不透明白/灰底板「卡片图」硬塞进金样图槽（金样多为透明图标/插画）
- 生成假包装、假 logo、假检测报告
- 保留金样番茄/原商品像素当新主题正式交付（SHA 会挡）

## 提示词骨架（每槽替换 {subject} / {slot_role}）

```text
Flat 2D health-education illustration, magazine-clean, soft cream paper mood,
subject: {subject}, role: {slot_role},
accent tomato red #D32F2F and soft green #4CAF50 sparingly,
centered subject 70% frame, transparent background PNG, no text, no watermark,
no photo realism, no 3D render, no dense UI chrome
```
