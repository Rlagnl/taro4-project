# 项目 AI 规则
## 技术栈
- Taro4 + taro-ui + TypeScript + React 18 + Zustand
- 工具：ESLint + Prettier
- 禁止：`any`、`// @ts-ignore`、直接操作 DOM

## 代码风格
- 组件：PascalCase（Button.tsx）
- 文件：kebab-case（user-profile.ts）
- 命名：新定义的 interface 命名必须以 `I` 开头，新定义的 Type 命名必须以 `Type` 结尾
- 缩进：2 空格，分号必须
- 类型：显式返回类型，Props 必须 interface
- Props 需要先解构再使用，例如 `const { children } = props;`

## 路径引用规范
- 所有文件引用必须使用绝对路径（如 `@/scenes/GameScene`），禁止使用相对路径（如 `./GameScene`）
- 绝对路径基于 webpack.config.ts 中的 alias 配置（如 `@` 指向 src 目录，`@root` 指向项目根目录）
