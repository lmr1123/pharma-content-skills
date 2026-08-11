# 业务自有模板：微调后怎么存、升级怎么不覆盖

面向：首次安装后想「存成自己的用法」，又怕官方 Skill 更新冲掉改动。  
配套：`docs/install-via-git.md`、`docs/business-usage.md`、`docs/deposit-to-reuse.md`。

---

## 一句话

> **官方 Skill（会更新）和业务自己的模板（永不被覆盖）必须分开放。**

| 层 | 路径 | 谁的 | `git pull` / 重装官方 |
|----|------|------|------------------------|
| **官方 Skill** | `skills/pharma-courseware-replication/` | 上游 | **会更新 / 可能覆盖** |
| **业务资产** | `workspace/templates/`、`workspace/runs/` | 业务本机 | **不动**（`.gitignore`） |

**正确习惯：** 微调结果只写进 `workspace/`，**不要改** `skills/` 里的文件。

---

## 1. 首次安装后，微调如何「存成自己的模板」

在 WorkBuddy 走 **模式 1 · 复刻 / 沉淀**，或微调满意后说：

```text
请把我这次确认好的版式/内容/插图规则沉淀成「我自己的模板」，
写入 workspace/templates/<我起的名字>/，
manifest 挂官方引擎，不要改 skills/ 里的任何文件。
```

### 沉淀完成应有的样子

```text
workspace/templates/<你的模板 id>/
  template-manifest.md     # 用哪个官方引擎、怎么出片
  samples/xxx.script.json  # 或 content.json（写满的样例）
  reuse/change-list.md     # 换主题改什么 / 不改什么
  visual/tokens.json       # 可选：业务侧色/字偏好
  assets/                  # 业务图、占位
  output/courseware.pptx   # 建议：样例成片
```

`template-manifest.md` 最少写清：

```text
engine: skills/pharma-courseware-replication/engines/disease-product-scenario-pptx-v1
schema: disease-product-scenario-script/v1
build: scripts/build_with_engine.sh disease-product-scenario <json> <out.pptx>
```

（蓝课型则挂 `disease-health-shenke-blue-v1` 与对应 content 结构。）

之后日常：

```text
用我自己的模板「xxx」生成 PPT，主题是……
先内容初稿，我确认后再出 PPT。
```

代理应 **只读 `workspace/templates/xxx`**，换内容出片，**不要**改官方 Skill。

---

## 2. 什么微调放哪里

| 微调类型 | 放哪 | 官方更新会丢吗 |
|----------|------|----------------|
| 换病种/商品内容、话术、页删减 | `workspace/templates/.../samples` 或 `runs/...` | 不会 |
| 业务包装图、自有插图 | `workspace/.../assets` | 不会 |
| 换题清单、内部约定 | `workspace/.../reuse/` | 不会 |
| 轻微色/字偏好（不改引擎代码） | `workspace/.../visual/tokens.json` | 不会 |
| 直接改官方 `export.mjs` / `SKILL.md` / 官方 samples | ❌ 不要 | **会丢或冲突** |

版式引擎若必须大改：

1. 优先仍挂官方引擎，用数据/变体字段表达  
2. 真要 fork 布局：在 `workspace` 或**业务私有仓**拷引擎改，manifest 指向副本，**不要**覆盖上游同名文件  

技术细节见 `docs/deposit-to-reuse.md`。

---

## 3. 官方有新版本时怎么更新

在**本机 clone 目录**里：

```bash
cd pharma-content-skills
git pull
```

| 会更新 | 不会动 |
|--------|--------|
| `skills/`、`docs/`、官方 samples | `workspace/templates/`、`workspace/runs/` |

更新后对 WorkBuddy 说：

```text
官方 Skill 已 git pull。请确认仍使用 workspace/templates 里我的模板，
不要用官方默认样例覆盖我的沉淀。
```

### 若 WorkBuddy「每次重装 Skill」而不是 pull

- 业务模板必须在**本机固定目录**（推荐本仓库 `workspace/`，或内网盘备份）  
- 重装后把 `workspace` 拷回，或工作目录仍指向带 `workspace` 的那份 clone  
- **禁止**整目录覆盖安装且未备份 `workspace/`

---

## 4. 「存成自己的 Skill」三种强度

### A. 日常推荐（多数业务够用）

- 官方：Git 安装 `pharma-content-skills`  
- 自己的：只沉淀 `workspace/templates/<id>/`  
- 叫「业务模板」，**不必**再做一个 Skill 包；升级最安全  

### B. 团队共享业务模板

- 将 `workspace/templates/` **单独**同步到业务私有 Git / 网盘  
- 每人：clone 官方 Skill + 同步业务 templates  
- 官方 `git pull` 与业务 templates 更新**分开做**  

### C. 公司级「自有 Skill 仓」

- fork 官方仓库，或另建 `company-pharma-skills`  
- 只在 fork 加：公司口令、自有引擎副本、规范  
- 上游用 `upstream` remote 定期 merge  
- **不要**把业务包装图、内部话术塞进上游 `skills/` 再 push 给全员覆盖  

---

## 5. 禁止清单

1. ❌ 改 `skills/.../export.mjs`、`SKILL.md`、官方 `samples/` 当「自己的定稿」  
2. ❌ 把业务包装图、内部话术 commit 进官方仓库再 pull  
3. ❌ 重装 Skill 覆盖整目录却没备份 `workspace/`  
4. ✅ 所有业务定稿只进 `workspace/`；官方层只读 + `git pull`  

---

## 6. 标准口令（可复制）

**沉淀为自己的模板：**

```text
请把当前确认结果沉淀到 workspace/templates/<模板名>/，
挂官方绿/蓝引擎，change-list 写清换题规则。
禁止修改 skills/ 目录。
```

**日常出片：**

```text
用我的模板 workspace/templates/<模板名> 生成，主题是……
先内容初稿，我确认后再出 PPT。
```

**升级官方：**

```text
请 git pull 更新官方 Skill，保留 workspace 不动，
更新后仍优先用我的 templates 列表。
```

---

## 7. 代理自检

- [ ] 未改 `skills/` 业务定稿文件  
- [ ] `workspace/templates/<id>/template-manifest.md` 写清 engine + 出片命令  
- [ ] 样例 JSON **写满**（非空壳）  
- [ ] `git pull` 后仍只从 `workspace/templates` 列业务模板  
- [ ] 业务素材/成片不在官方 skill 路径里当唯一副本（建议另有备份）  
