# 业务使用说明 · 医药课件模板沉淀 Skill

面向：门店培训 / 总部内容同学（WorkBuddy 或同类对话代理）  
仓库：`pharma-content-skills`（**独立轻量**，通过 Git 安装即可）

安装步骤见：`docs/install-via-git.md`。

---

## 两件核心事

```text
① 沉淀模板          参考课件 → 可批量复用的模板包
② 用模板生成主题    同一模板 → 多个病种/单品课件（可批量）
```

| | 沉淀模板 | 用模板生成（含批量） |
|--|----------|----------------------|
| 何时 | 第一次，或版式大改时 | 日常换主题、一课多品 |
| 输入 | 你认可的参考 PPT/截图 | 已沉淀的 `template-id` + 主题材料 |
| 锁定 | 页序骨架 + PPT 色板 + 插图策略 | **不改** 骨架与色板 |
| 输出 | `workspace/templates/<id>/` | `workspace/runs/<id>/<主题>/` |

---

## ① 沉淀模板

### 口令（复制即用）

```text
请读取本仓库技能：skills/pharma-courseware-replication/SKILL.md
按「模式 1 · 沉淀模板」执行。

参考文件：【本地路径】
模板命名建议：tpl-【课型或简称】-【日期】

要求：
1. 大框架（页序/板块）跟参考
2. PPT 视觉跟参考（只在同一套里对齐优化，不要换皮）
3. 缺的知识插图可补；包装位留给真图，禁止假包装
4. 写出 reuse/change-list.md，保证以后换主题/批量复用只改清单上的项
5. 产物写到：workspace/templates/【template-id】/
6. 生成可打开的 output/courseware.pptx（可用占位正文演示结构）
```

### 沉淀成功的标志

`workspace/templates/<template-id>/` 内至少有：

| 路径 | 作用 |
|------|------|
| `template-manifest.md` | 模板身份证 |
| `structure/slots.json` | 机读槽位（批量复用的契约） |
| `visual/tokens.json` | 色板锁定 |
| `reuse/change-list.md` | ★ 换主题/批量时改什么 |
| `output/courseware.pptx` | 可打开样例 |

**之后批量生成时，代理只读这份模板，不再重新发明版式。**

---

## ② 用模板生成其他主题（单次）

```text
请读取 skills/pharma-courseware-replication/SKILL.md
按「模式 2 · 用模板生成主题」执行。

模板：workspace/templates/【template-id】/
新主题：【病名或商品名】
材料：【文案路径 / 包装图路径；没有写「待补」】

要求：
- 禁止改页序骨架与 visual/tokens（PPT 风格锁定）
- 只改 change-list 上的 content / 业务图 / 主题插图
- 缺审定内容标 pending，不编造功效
- 输出到：workspace/runs/【template-id】/【theme-id】/
  含 courseware.pptx、fill-checklist.md、更新后的 slots 副本
```

---

## ②′ 批量复用（一模板 × 多主题）

### 口令

```text
请读取 skills/pharma-courseware-replication/SKILL.md
按「模式 2b · 批量生成」执行。

模板：workspace/templates/【template-id】/

主题列表（有几条做几条，不要硬凑）：
1. 主题名：【A】；材料：【路径或待补】
2. 主题名：【B】；材料：【路径或待补】
3. 主题名：【C】；材料：【路径或待补】

要求：
- 每个主题独立目录 workspace/runs/【template-id】/【theme-id】/
- 全员共用同一 visual/tokens 与页序，禁止中途换皮
- 每个主题各自 change-list 执行结果 + fill-checklist + courseware.pptx
- 汇总表写到 workspace/runs/【template-id】/batch-summary.md
  （主题 | 状态 | PPTX 路径 | 缺件）
- 任一主题缺包装/审定文案：该主题标「部分完成」，继续做其他主题
```

### 批量时模板如何保证可复用

| 机制 | 说明 |
|------|------|
| 模板只读 | `workspace/templates/` 在批量中不改写（或仅增 run 索引） |
| 槽位契约 | `slots.json` 的 framework 槽不动，只填 content / business_asset |
| 色板锁定 | 所有 run 引用同一 `visual/tokens.json` |
| 变更清单 | 每个主题都按同一 `change-list` 结构勾选 |
| 有几条写几条 | 列表/对症表不按模板示例条数硬凑 |

---

## 演示壳（可选，看形态）

安装仓库后若本地尚无 demo，可让代理生成，或管理员预先生成：

```bash
cd skills/pharma-courseware-replication
python3 scripts/build_pptx.py \
  examples/disease-product-scenario-shell.content.json \
  ../../workspace/templates/demo-green-shell/output/courseware.pptx \
  --tokens references/styles/ppt-courseware-green-v1/tokens.json
```

演示正文为占位，**不能**当审定医学内容。

---

## 红线

1. 不编造适应症、数据、「第一/最好」  
2. 不生成假包装顶真图  
3. `workspace/` 默认仅本机；外传前去掉敏感包装  
4. 产出 ≠ 医学/法务已审定  

---

## 管理员交付清单

- [ ] 仓库已 push 到 Git，业务能 clone / 通过 Git 安装 Skill  
- [ ] 业务拿到本页 + `docs/install-via-git.md`  
- [ ] 业务会说两句口令：沉淀模板 / 用模板生成（含批量）  
- [ ] 本机可选 `python-pptx`  
