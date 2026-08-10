# Pharma Content Skills

医药向 **独立、轻量** Skill 仓库：通过 **Git 安装** 后即可使用。

**不依赖** 其他内容生产仓库、设备或数字人环境。

## 业务怎么开口（推荐）

```text
请安装并运行这个项目，然后带我用。
先问我选哪个：
1. 复刻 PPT 模板
2. 选模板生成 PPT
```

| 选项 | 人话 |
|------|------|
| **1 复刻 PPT 模板** | 有一份看好的课件 → 存成以后能反复用的模板 |
| **2 选模板生成 PPT** | 模板已有 → 先写满内容初稿给你审 → 你点头再出 PPT（可批量） |

完整口语说明：[`docs/business-usage.md`](docs/business-usage.md)

## 通过 Git 安装

```bash
git clone https://github.com/lmr1123/pharma-content-skills.git
cd pharma-content-skills
# 可选：pip install python-pptx
```

- 安装说明：[`docs/install-via-git.md`](docs/install-via-git.md)  
- Skill 入口：[`skills/pharma-courseware-replication/SKILL.md`](skills/pharma-courseware-replication/SKILL.md)  

代理「从 Git 安装 Skill」时：仓库用上面地址，入口 `skills/pharma-courseware-replication/SKILL.md`。

## 原则

1. 先问 1 还是 2，再用大白话带材料  
2. 模板可批量复用：版式锁定，只换该换的  
3. **签样课型（穿心莲绿 / 参课蓝）用 `skills/.../engines/` 生产迁入引擎出片**，不是通用框  
4. 不编造药效；不生成假包装  
5. 运行时零外部 monorepo 路径依赖（引擎已自包含拷贝）  

## 生产级引擎（v0.3）

| 课型 | 目录 | 首次 |
|------|------|------|
| 疾病+商品场景 | `skills/pharma-courseware-replication/engines/disease-product-scenario-pptx-v1` | `npm i` |
| 疾病健康培训·参课蓝 | `skills/pharma-courseware-replication/engines/disease-health-shenke-blue-v1` | `npm i` |

说明：`skills/pharma-courseware-replication/engines/README.md`  
