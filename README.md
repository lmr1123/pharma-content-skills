# Pharma Content Skills

医药向 **独立、轻量** Skill 仓库：通过 **Git 安装** 后即可使用。

**不依赖** 其他内容生产仓库、设备或数字人环境。

## 这个 Skill 做什么（两件事）

| | 能力 | 说明 |
|--|------|------|
| **1** | **沉淀模板** | 业务参考 → 可批量复用的模板包（结构 + 色板 + 换题清单 + 样例 PPTX） |
| **2** | **用模板生成主题** | 同一模板生成其他病种/单品；支持 **批量** 多主题，风格与页序锁定 |

## 通过 Git 安装

```bash
git clone https://github.com/lmr1123/pharma-content-skills.git
cd pharma-content-skills
# 可选：pip install python-pptx
```

详细：[`docs/install-via-git.md`](docs/install-via-git.md)  
业务口令：[`docs/business-usage.md`](docs/business-usage.md)  
Skill 入口：[`skills/pharma-courseware-replication/SKILL.md`](skills/pharma-courseware-replication/SKILL.md)

若代理支持「从 Git 安装 Skill」：仓库地址用上表 clone URL，入口指向 `skills/pharma-courseware-replication/SKILL.md`。

## 仓库结构

```text
pharma-content-skills/
├── docs/
│   ├── install-via-git.md      # Git 安装
│   └── business-usage.md       # 业务两套口令（沉淀 / 生成·批量）
├── skills/pharma-courseware-replication/
└── workspace/                  # 本机模板与成品（不进 git）
    ├── templates/              # 沉淀的可复用模板
    └── runs/                   # 各主题生成结果
```

## 快速口令

**沉淀模板：**

```text
请读 skills/pharma-courseware-replication/SKILL.md，按「模式 1 · 沉淀模板」，
参考【路径】，产物写到 workspace/templates/【template-id】/。
```

**批量生成：**

```text
请按「模式 2b · 批量生成」，模板 workspace/templates/【id】/，
主题列表：A、B、C…… 输出到 workspace/runs/【id】/ 下各主题目录。
```

## 原则

1. 模板可批量复用：tokens + 页序锁定，只换清单上的项  
2. PPT 视觉跟业务参考；门店活力仅插图回落  
3. 不编造药效；不生成假包装  
4. 零外部项目依赖  
