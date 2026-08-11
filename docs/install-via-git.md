# 通过 Git 安装本 Skill

面向：业务电脑 / WorkBuddy / 同类代理环境。  
**只依赖本仓库**，无需其他内容工程。

---

## 安装（一次性）

### 方式 A · clone（推荐）

```bash
git clone https://github.com/lmr1123/pharma-content-skills.git
cd pharma-content-skills
```

可选（导出 PPTX 时）：

```bash
pip install python-pptx
```

### 方式 B · 代理内「从 Git 安装 Skill」

若 WorkBuddy / Claude Code / Cursor 等支持「从 Git 安装 skill」：

1. 填写本仓库 HTTPS 或 SSH 地址  
2. 入口文件指向：`skills/pharma-courseware-replication/SKILL.md`  
3. 工作目录建议设为仓库根（便于写 `workspace/`）

### 安装后代理应能读到

```text
skills/pharma-courseware-replication/SKILL.md
docs/business-usage.md
```

更新：

```bash
cd pharma-content-skills && git pull
```

> **重要：** `git pull` 只更新官方 `skills/` / `docs/`。  
> 业务自己的模板与成品在 `workspace/`，**不会被 pull 覆盖**。  
> 微调后如何「存成自己的」、升级怎么不丢：见 [`docs/business-own-template.md`](business-own-template.md)。

---

## 安装后业务怎么说

```text
请安装并运行这个项目，然后带我用。
先问我：
1. 复刻 PPT 模板
2. 选模板生成 PPT
```

| 选项 | 人话 | 产物目录 |
|------|------|----------|
| **1 复刻 PPT 模板** | 把看好的课件存成可反复用的模板 | `workspace/templates/` |
| **2 选模板生成 PPT** | 先内容初稿审核，确认后再出 PPT（可批量） | `workspace/runs/` |

详细口语说明见 `docs/business-usage.md`。  
业务自有模板与防覆盖：`docs/business-own-template.md`。

---

## 目录约定（安装后）

```text
pharma-content-skills/
  skills/pharma-courseware-replication/   # 官方 Skill（只读、随 git 更新）
  workspace/
    templates/     # ★ 业务自有模板（本机资产，默认不进 git，pull 不覆盖）
    runs/          # ★ 各主题成片与草稿（默认不进 git）
  docs/
```

`workspace/` 已在 `.gitignore`，业务素材与成品留在本机。  
**禁止**把业务定稿写进 `skills/`——那里会被官方更新覆盖。
