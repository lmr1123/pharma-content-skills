# 输出契约 · 模板包 + PPTX

版本：与 Skill `0.2.0` 对齐 · `slots.json` schema **0.2**

## 产物总览

| 文件 / 目录 | 沉淀时 | 换主题时 | 说明 |
|-------------|--------|----------|------|
| `template-manifest.md` | 必需 | 更新 | 模板身份证：课型、风格、页数、用途 |
| `structure/replication-plan.md` | 必需 | 可选修订 | 人读结构方案 |
| `structure/slots.json` | 必需 | 更新 values/status | 机读槽位 |
| `visual/style-spec.md` | 必需 | 通常不动 | **PPT 版式**（通常 extracted-from-reference） |
| `visual/tokens.json` | 推荐 | 不动 | 机读 PPT chrome；驱动 build_pptx |
| `visual/illustration-style.md` | 推荐 | 少动 | 插图画风，默认 store-vitality-v1 |
| `visual/layout-patterns.md` | 推荐 | 不动 | 封面/目录/卡片页等版式模式 |
| `visual/before-after.md` | 推荐 | 可选 | 相对参考的视觉优化说明 |
| `assets/asset-map.md` | 必需 | 更新路径 | 每页图槽角色与路径 |
| `assets/provided/` | 按需 | 可重生 | AI/系统插图、坑位图 |
| `assets/business-required.md` | 必需 | 更新 | 业务必须提供的清单 |
| `reuse/change-list.md` | 必需 | 按新主题重写要点 | ★ 换主题更新点 |
| `reuse/fill-checklist.md` | 推荐 | 必需 | 已填/待业务/待审核 |
| `output/courseware.content.json` | 必需 | 更新 | 驱动 PPTX 的内容 JSON |
| `output/courseware.pptx` | 必需 | 重导 | 可打开完整 PPTX |
| `handoff-note.md` | 可选 | 可选 | 未决问题 |

路径根（默认仅本机，不进 git）：

- 复刻模板：`workspace/templates/<template-id>/`
- 主题 run：`workspace/runs/<template-id>/<theme-id>/`
  - **先** `content-draft.md`（写满的内容初稿，非空壳）
  - `fill-checklist.md`（待审 → 已确认 → 已出片）
  - **后** `courseware.pptx`（业务确认后）
- 批量汇总：`workspace/runs/<template-id>/batch-summary.md`（含内容状态列）

## template-id 命名

```text
tpl-<课型短名>-<主题短名或日期>
例：tpl-disease-product-chuangxinlian-20260810
    tpl-health-uri-demo
```

小写、连字符；避免空格与品牌敏感词进公开仓。

## `slots.json`（0.2）

相对 0.1 增加可选顶层字段：

| 字段 | 说明 |
|------|------|
| `schema_version` | `"0.2"` |
| `template_id` | 与目录名一致 |
| `course_type_id` | 如 `disease-product-scenario-v1` |
| `visual_style_id` | PPT 版式 id 或 `extracted-from-reference` |
| `illustration_style_id` | 插图默认如 `store-vitality-v1`（**不是** PPT 换皮） |
| `pptx_path` | 相对模板包的 PPTX 路径 |

页与槽位字段同 0.1；`role` / `status` 枚举不变。

完整 schema：`../templates/slots.schema.json`。

## `courseware.content.json`

供 `scripts/build_pptx.py` 消费的导出 JSON。最小字段：

```json
{
  "schema_version": "courseware-content/0.1",
  "meta": {
    "title": "课程标题",
    "subtitle": "副标题",
    "organization": "内部培训",
    "internal_notice": "仅限于内部学习",
    "style_id": "extracted-from-reference",
    "illustration_style_id": "store-vitality-v1"
  },
  "slides": [
    {
      "page_index": 1,
      "page_type": "cover",
      "title": "…",
      "body": "…",
      "bullets": [],
      "cards": [],
      "table": null,
      "images": [],
      "notes": ""
    }
  ]
}
```

页型优先用页型语汇表；布局由生成器按 `page_type` + style tokens 映射。

## 换主题时契约

1. **不改** `course_type_id`、页序骨架、`framework` 槽逻辑（除非业务明确要求改框架）
2. **改** `content` 文案、主题相关 `system_generate` 图、业务包装路径
3. **重导** PPTX；旧 PPTX 可留 `output/archive/`（可选）
4. 列表条数：有几条写几条，禁止空行凑满参考条数

## 与制作协作

- 制作同事可收：`slots.json` + `courseware.content.json` + `assets/` + `courseware.pptx`
- 本 Skill 已含可打开 PPTX 时，通常无需其他系统
