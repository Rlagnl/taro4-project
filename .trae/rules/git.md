# Git 工作流规则

## 分支管理
- **main/master**：只用于发布版本，禁止直接开发和提交
- **develop**：主开发分支，所有新功能都从这里分支
- **feature/***：特性分支，用于开发具体功能
- **hotfix/***：热修复分支，用于紧急修复

## 工作流程
1. **从 develop 分支开始**：
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **创建特性分支**：
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **开发完成后**：
   - 提交代码到特性分支
   - 切换回 develop 分支
   - 合并特性分支
   - 推送到远程

## 紧急修复流程
1. **从 main 分支创建热修复分支**：
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/your-fix-name
   ```

2. **修复完成后**：
   - 提交代码到热修复分支
   - 切换回 main 分支并合并
   - 切换回 develop 分支并合并
   - 推送到远程

## 严格禁止
- **禁止直接提交到 main/master 分支**
- **禁止在 main/master 分支上进行开发**
- **禁止绕过 develop 分支直接合并到 main**

## 处理错误操作
如果不小心在 main 上做了修改：

1. **创建临时分支**：
   ```bash
   git checkout -b temp-fix
   ```

2. **切换回 main 并重置**：
   ```bash
   git checkout main
   git reset --hard HEAD~1  # 撤销最后一次提交
   ```

3. **切换到 develop 并合并临时分支**：
   ```bash
   git checkout develop
   git merge temp-fix
   ```

4. **删除临时分支**：
   ```bash
   git branch -d temp-fix
   ```

## 提交规范
- 使用 conventional commit 格式
- 提交信息清晰明了
- 关联相关 issue（如果有）