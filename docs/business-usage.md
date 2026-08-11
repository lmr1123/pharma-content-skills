# 业务怎么用（口语版）

仓库：`pharma-content-skills`  
安装：`docs/install-via-git.md`  
**自有模板、升级不覆盖：** `docs/business-own-template.md`

---

## 你只要会这一句（推荐）

```text
请安装并运行这个项目（Git：https://github.com/lmr1123/pharma-content-skills.git），
读 skills/pharma-courseware-replication/SKILL.md，然后直接带我做。
不要让我选 1 或 2 或任何技术选项。
我丢参考课件就帮我存成可反复出片的模板；
我要换病种/商品就先写满内容初稿再出 PPT。
做好的内容和 PPT 请直接打开给我看。
结果只写我自己的 workspace，不要覆盖官方技能文件。
```

---

## 你不用做选择题

代理会根据你给的材料自己判断：

| 你实际在做什么 | 代理会做什么 |
|----------------|--------------|
| 丢来一份看好的课件 / 说「存成模板」「复刻」 | 做成以后能反复出片的模板（版式跟参考对齐，不是只抄框架） |
| 说「换主题」「做某某病/商品」 | 先写满内容初稿 → 打开给你审 → 你点头再出 PPT |

你只要用自然语言说目标；**不要**回答「1 还是 2」「路径 A 还是 B」。

---

## 换主题时特别重要

**不是**先给你一份空表让你填。  
流程是：

1. 你给主题（和已有材料，有就给）  
2. 代理 **先写好一版完整内容初稿**，并 **直接打开** 给你看（没材料也会起草，标「待你审」）  
3. 你说「通过」或指出要改哪  
4. 改到你点头后，**再**生成 PPT，并 **直接打开** PPT + 内容对照  

包装图有真图用真图；没有就先占位，不能假包装。

---

## 复刻模板时你会得到什么

准备：参考 PPT 路径、模板想叫啥、有没有现成文案/图。  

结果不是「只存一份说明 / 只剩页框架」，而是：

- `workspace/templates/某某/`：换题清单、写满样例、出片方式  
- 挂到绿/蓝等 **现成版式引擎**（或新课型做成可出片引擎）  
- **样例内容 + 样例 PPT 会直接打开** 给你复核  
- 字号、加粗/标红、卡片、插图要跟参考同一量级（见仓库保真清单；不是通用灰卡壳）

**这些目录是你自己的资产**：官方 Skill 以后 `git pull` **不会覆盖**这里。  
详见：`docs/business-own-template.md`。  
技术说明（业务可不读）：`docs/deposit-to-reuse.md`。

---

## 微调满意后 · 存成「自己的模板」

```text
请把当前确认结果沉淀到 workspace/templates/<模板名>/，
挂官方引擎，不要改 skills/ 目录。
```

之后出片说「用我的模板 xxx」，不要再改官方 Skill 里的文件。

---

## 官方有更新时

```text
请 git pull 更新官方 Skill，保留 workspace 不动，
更新后仍优先用我的 templates 列表。
```

完整说明：`docs/business-own-template.md`。

---

## 更短口令

**开场：**

```text
请装好这个技能直接带我做。不要让我选编号。
做好内容/PPT 请打开给我看。只写 workspace，不改官方 skills。
```

**换主题补充（建议）：**

```text
模板【名字或你帮我认】，主题【病名/商品】。
先按能写的把内容初稿写满并打开给我审，我点头后再出 PPT 并打开。
```

**沉淀 / 升级：**

```text
沉淀：写入 workspace/templates/<名>/，禁止改 skills/
升级：git pull 官方，workspace 不动
```

---

## 给代理（业务可忽略）

- **禁止**开场让业务回 1/2；按材料推断模式 1 或 2。  
- 模式 2：**A 内容初稿 → open → B 修改 → C 确认后出片 → open pptx+草稿**。  
- 模式 1：引擎 + 写满样例 + 保真颗粒度；禁止框架壳；完成 open 样例。  
- 默认用户级、不覆盖：`docs/business-own-template.md`。  
- 见 `SKILL.md` v0.3.4+；`docs/deposit-to-reuse.md`；保真 `references/fidelity-qa-checklist.md`。

## 版式从哪来（业务可忽略技术细节）

仓库里已经装好了两套**以前签过样的课件版式**（绿：疾病+商品场景；蓝：参课健康课），包括框、字、色、插图规则。  
出 PPT 时按这套版式引擎走，**不是**随便画的空白框。  
穿心莲高保真方法与验收片：`docs/HANDOVER-2026-08-11-fidelity-upgrade.md`、  
`workspace/runs/chuanxinlian-fidelity-qa/README-WORKBUDDY.md`。
