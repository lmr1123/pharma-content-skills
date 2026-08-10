# 输出契约

## 文件

| 文件 | 必需 | 说明 |
|------|------|------|
| `replication-plan.md` | 拆参考时是 | 人读方案卡 |
| `slots.json` | 拆参考时是 | 机读槽位，schema 0.1 |
| `fill-checklist.md` | 主题重填时是 | 待办与已填 |
| `handoff-note.md` | 否 | 给下游或制作的备注 |

## `slots.json` 顶层字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `schema_version` | string | 固定 `"0.1"` |
| `skill_id` | string | `pharma-courseware-replication` |
| `title` | string | 参考或主题标题 |
| `courseware_tag` | string | 见页型语汇「课型标签」 |
| `source` | object | 参考来源描述（路径、页数、备注） |
| `pages` | array | 页列表 |
| `notes` | string[] | 全局注意 |

## 页对象 `pages[]`

| 字段 | 说明 |
|------|------|
| `page_index` | 从 1 开始 |
| `page_type` | 语汇表 id |
| `page_type_label_zh` | 中文名 |
| `purpose` | 本页教学目的（一句） |
| `slots` | 槽位数组 |

## 槽位 `slots[]`

| 字段 | 说明 |
|------|------|
| `slot_id` | 稳定 id，如 `p03_title` |
| `kind` | `text` \| `image` \| `list` \| `table` \| `other` |
| `role` | `framework` \| `content` \| `business_asset` \| `system_generate` |
| `label_zh` | 人话标签 |
| `value` | 当前值；未知为 `null` |
| `status` | `empty` \| `from_reference` \| `filled` \| `pending_business` \| `pending_review` |
| `constraints` | 可选：字数、必须来源等 |

完整 JSON Schema：`../templates/slots.schema.json`。
