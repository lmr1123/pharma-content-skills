# 多 Skill 协同约定

原则：**小 Skill 接力，大项目拆开给业务。**

## 标准接力链（示例）

```text
[1] pharma-courseware-replication
      输入: 参考 PPT/截图 +（可选）新主题说明
      输出: 复刻方案卡.md + slots.json

[2] （未来）pharma-copy-review
      输入: slots.json + 业务话术
      输出: 审定/风险标注后的 slots.json

[3] （未来）pharma-asset-checklist
      输入: slots.json
      输出: 缺件清单（包装图、证照、示意图）

[4] （可选）生产仓交接 / 出片 Skill
      输入: slots.json + 授权素材路径
      输出: PPTX / 视频（在其他仓库完成）
```

业务一次对话里可以串多个 Skill，但 **每个 Skill 的入口文档独立**，避免「装一个包就懂一百件事」。

## 共享产物约定

| 文件 | 生产者 | 消费者 | 说明 |
|------|--------|--------|------|
| `replication-plan.md` | 复刻 Skill | 人 / 下游 | 人话方案卡 |
| `slots.json` | 复刻 Skill | 下游 Skill / 生产仓 | 机读槽位，见 schema |
| `fill-checklist.md` | 复刻 Skill（主题重填） | 业务 | 待填项清单 |
| `handoff-note.md` | 任意 | 任意 | 可选：交接说明、未决问题 |

路径建议：

```text
workspace/<run-id>/
  source/           # 用户放入的参考（勿提交敏感原片到公开远程）
  replication-plan.md
  slots.json
  fill-checklist.md
  handoff-note.md
```

## Skill 目录约定

每个 Skill 固定形状：

```text
skills/<skill-id>/
  SKILL.md              # 入口（触发、步骤、边界）
  references/           # 单源事实
  templates/            # 输出模板 / schema
  examples/             # 脱敏示例（可选）
```

- `skill-id`：小写 + 连字符，前缀建议 `pharma-`。
- 不在 Skill 内嵌其他 Skill 的全文；只写「输入来自 / 输出交给」的契约名。

## 版本

- Skill 自身版本写在 `SKILL.md` front matter 的 `version`。
- `slots.json` 带 `schema_version`；破坏性变更升主版本并在本文件记一笔。

当前：`slots.schema.json` → **0.1**
