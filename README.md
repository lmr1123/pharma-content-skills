# Pharma Content Skills

医药向 **独立、轻量** Skill 仓库：通过 **Git 安装** 后即可使用。

**不依赖** 其他内容生产仓库、设备或数字人环境。

## 业务怎么开口（推荐）

```text
请安装并运行这个项目，然后直接带我做。
不要让我选 1/2 或任何技术选项。
我丢参考课件 → 存成可反复出片的模板；
我要换主题 → 先写满内容再出 PPT。
做好的内容和 PPT 请直接打开给我看。
只写 workspace，不要覆盖官方 skills。
```

| 你实际在做的事 | 代理会做的事 |
|----------------|--------------|
| 复刻 / 存模板 | 挂签样引擎 + 高保真颗粒度（不是只抄框架） |
| 换主题出课 | 内容初稿 → 你审 → 再出 PPT；双开文件给你复核 |

完整口语说明：[`docs/business-usage.md`](docs/business-usage.md)  
**业务自有模板、升级不覆盖：** [`docs/business-own-template.md`](docs/business-own-template.md)

## 通过 Git 安装

```bash
git clone https://github.com/lmr1123/pharma-content-skills.git
cd pharma-content-skills
# 可选：pip install python-pptx
```

- 安装说明：[`docs/install-via-git.md`](docs/install-via-git.md)  
- Skill 入口：[`skills/pharma-courseware-replication/SKILL.md`](skills/pharma-courseware-replication/SKILL.md)  

代理「从 Git 安装 Skill」时：仓库用上面地址，入口 `skills/pharma-courseware-replication/SKILL.md`。

官方更新用 `git pull`，**不会覆盖** `workspace/` 里业务自己的模板与成片。

## 原则

1. **零选择题**：业务不回答编号；代理按材料推断  
2. **用户级默认、不覆盖**：业务定稿只写 `workspace/`  
3. **签样课型用 `engines/` 出片**，禁止通用框冒充  
4. **复刻 = 金样颗粒度**（字阶/强调/拓扑/插图），不是页序 markdown  
5. **做完默认 open** 内容初稿与 PPT 给业务复核  
6. 不编造药效；不生成假包装  
7. 运行时零外部 monorepo 路径依赖（引擎已自包含）

## 生产级引擎（v0.3）

| 课型 | 目录 | 首次 |
|------|------|------|
| 疾病+商品场景 | `skills/pharma-courseware-replication/engines/disease-product-scenario-pptx-v1` | `npm i` |
| 疾病健康培训·参课蓝 | `skills/pharma-courseware-replication/engines/disease-health-shenke-blue-v1` | `npm i` |

说明：`skills/pharma-courseware-replication/engines/README.md`  

**沉淀与复用同一路径**：[docs/deposit-to-reuse.md](docs/deposit-to-reuse.md)  
**穿心莲高保真交接**：[docs/HANDOVER-2026-08-11-fidelity-upgrade.md](docs/HANDOVER-2026-08-11-fidelity-upgrade.md)  
