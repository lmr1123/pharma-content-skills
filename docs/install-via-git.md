# 通过 Git 安装本 Skill

面向：业务电脑 / WorkBuddy / 同类代理环境。  
**只依赖本仓库**，无需其他内容工程。

---

## 安装（一次性）

### 方式 A · clone（推荐）

```bash
# 替换为你的实际仓库地址（push 后见 README）
git clone https://github.com/<org-or-user>/pharma-content-skills.git
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

---

## 安装后你会用到的两件事

本 Skill **必须**覆盖两条主路径（缺一不可）：

| # | 能力 | 做什么 | 产物 |
|---|------|--------|------|
| **1** | **沉淀模板** | 业务参考 → 可批量复用的模板包 | `workspace/templates/<template-id>/` |
| **2** | **用模板生成其他主题** | 同一模板 × 一到多个主题 → 成套课件 | `workspace/runs/<template-id>/<theme-id>/` |

模板设计目标：**一份模板，可批量复用**（风格与页序锁定，只换 content / 业务图 / 主题插图）。

详细口令见 `docs/business-usage.md`。

---

## 目录约定（安装后）

```text
pharma-content-skills/
  skills/pharma-courseware-replication/   # Skill 本体（只读、随 git 更新）
  workspace/
    templates/     # ★ 沉淀后的可复用模板（业务资产，默认不进 git）
    runs/          # ★ 用模板生成的各主题成品（默认不进 git）
  docs/
```

`workspace/` 已在 `.gitignore`，业务素材与成品留在本机。
