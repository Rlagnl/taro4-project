# Skill 规范

## 目录结构

每个 Skill 目录下应包含以下文件：

- `index.ts` - 入口文件（类似 npm 包规范）
- `SKILL.md` - Skill 的说明文档
- `package.json` - Skill 的配置文件

## 文件命名规则

- 入口文件必须命名为 `index.ts`
- 如果一个 skill 目录下需要多个执行文件，除入口文件外，其他文件可根据自身逻辑酌情命名

## 入口文件要求

入口文件必须导出默认函数，该函数接收一个包含以下属性的参数对象：

- `input`: 用户的输入字符串
- `workspace`: 工作空间信息，包含 `uri.fsPath` 表示项目根目录路径

示例：

```typescript
interface ITask {
  input: string
  workspace: {
    uri: {
      fsPath: string
    }
  }
}

export default async function skillName($task: ITask) {
  // Skill 逻辑实现
}
```

## SKILL.md 格式

SKILL.md 文件应包含以下内容：

```markdown
---
name: "<skill-name>"
description: "<简短描述，说明技能功能和调用时机>"
---

# 技能标题

技能详细说明...

## 使用方法

## 功能特性

## 使用示例

## 实现说明
```

### description 字段规范

- 使用英文编写
- 包含技能功能描述和调用时机
- 长度控制在 200 字符以内
- 格式示例：`"Does X. Invoke when Y happens or user asks for Z."`

### SKILL.md 正文语言规范

- `name` 和 `description` 字段必须使用英文编写
- 其余内容（标题、功能特性、使用方法、实现说明等）建议使用中文书写
