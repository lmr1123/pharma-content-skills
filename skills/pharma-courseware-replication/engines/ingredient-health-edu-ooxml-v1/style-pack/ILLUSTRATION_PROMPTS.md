# 产线 B · 知识插图提示词硬规则（米白番茄红金样）

**style_pack_id:** `style-pack.lycopene-health-edu-cream-red-v1`

## 哪些图要换、哪些不换

| action | 典型 | 做法 |
|--------|------|------|
| **replace** | JPEG 等内容图（来源食材、场景照片、语义插画位） | **必须**按新主题重画/重拍并绑定 |
| **keep_gold** | SVG 图标、标题 freeform 点缀、母版/版式纹理 | **保留金样**，壳风格一致，不必 69 张全换 |

`image-plan` 会自动分类；代理只为 `replace` 生图。

## 必须（仅 replace 槽）

- 画风：扁平健康科普插画 / 轻杂志感；亲和、干净，**不是**厚涂、3D 写实、照片拼贴
- 主色锚：番茄红 `#D32F2F` 作点缀；辅绿 `#4CAF50` 仅正向语义；气质贴近米白 `#FBF7F0` / 白卡
- **透明底 PNG**（alpha）：主体居中约 65%–85%；**禁止**整页海报式留白文案区
- 单槽单语义：只画当前图槽含义，**不要**在图内写 PPT 标题长文
- 输出：PNG，建议 ≥512px 短边

## 禁止

- 默认用 `store-vitality-v1` / 全绿 monochrome 当本课型图
- 不透明白/灰底板硬塞
- 假包装、假 logo、假检测报告
- 在 **replace** 槽保留金样番茄/原主题内容像素

## 提示词骨架（每槽替换 {subject} / {slot_role}）

```text
Flat 2D health-education illustration, magazine-clean, soft cream paper mood,
subject: {subject}, role: {slot_role},
accent tomato red #D32F2F and soft green #4CAF50 sparingly,
centered subject 70% frame, transparent background PNG, no text, no watermark,
no photo realism, no 3D render, no dense UI chrome
```
