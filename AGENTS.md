# AGENTS · Pharma Content Skills

## 项目边界

- 本仓 = **独立轻量** 医药 Skill 集合。  
- **禁止** 依赖、引用或要求安装其他内容生产仓库 / 设备 / 数字人管线。  
- 主 Skill 产出：模板包 + 可打开 PPTX + 换题清单。  

## 跑 Skill

1. 读 `skills/pharma-courseware-replication/SKILL.md`  
2. 产物只写 `workspace/<template-id>/`  
3. PPT 色板：从 **业务参考** 抽取；课型预制绿/蓝仅作快捷默认  
4. 插图：课型配套优先，回落门店活力；禁止用插图风换 PPT 皮  
5. 包装真图业务提供；不编造药效  
6. 生成 PPTX：签样课型用 `engines/*` + `scripts/build_with_engine.sh`；通用壳 `scripts/build_pptx.py` 仅烟测  

## 改 Skill

- 事实在 `references/`；契约变更同步 `templates/` 与 `docs/`  
- 业务纠正写入 `tasks/lessons.md`  
- 不添加对外部 monorepo 的路径依赖  

## 禁止

- 提交业务包装实拍、密钥到公开远程  
- 承诺任意参考像素级 1:1（签样课型以迁入引擎为准）  
- 要求业务安装「大仓」才能用本 Skill  
