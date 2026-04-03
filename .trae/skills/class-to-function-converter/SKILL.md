---
name: "class-to-function-converter"
description: "Converts React Class Components to Function Components. Invoke when user asks to refactor class components to function components."
---

# Class to Function Component 转换器

将项目中的 React Class Component 转换为 Function Component。

## 使用方法

当用户要求将 Class Component 改写为 Function Component 时调用此 Skill。

### 转换模式

1. **全项目扫描**（默认）：不指定文件时，扫描 src 目录下所有 .tsx/.jsx 文件
2. **指定单文件转换**：提供文件路径时，仅转换指定的文件

### 使用示例

```
# 转换整个项目
转换所有 class component 为 function component

# 转换指定文件
转换 src/pages/index/index.tsx
转换 ./src/app.ts
```

## 功能特性

1. **扫描项目**：递归扫描 src 目录下的所有 .tsx 和 .jsx 文件
2. **识别 Class Component**：检测继承自 React.Component 或 React.PureComponent 的组件
3. **自动转换**：将 Class Component 转换为 Function Component，包括：
   - state 转换为 useState
   - 生命周期方法转换为 useEffect
   - this.props 转换为 props 参数
   - this.state 转换为 useState 返回的状态变量
   - 类方法转换为普通函数
   - constructor 转换为 useState 初始化
4. **生成报告**：输出转换结果摘要

## 实现说明

### 转换规则

| Class Component | Function Component |
|----------------|---------------------|
| `this.state` | `useState` 返回的状态变量 |
| `this.props` | `props` 参数 |
| `constructor` + `super(props)` | 函数参数 `props` |
| `this.setState()` | `setXxx()` |
| `componentDidMount` | `useEffect(..., [])` |
| `componentDidUpdate` | `useEffect(..., [deps])` |
| `componentWillUnmount` | `useEffect(() => { return () => {} }, [])` |
| `render()` 方法 | 函数返回值 |
| 类方法 | 普通函数（使用 useCallback 包装事件处理函数）|

### 代码规范遵循

- 组件命名：使用 PascalCase
- Props 类型：使用 interface 命名，以 I 开头
- 显式返回类型
- 禁止使用 `any` 类型
- 路径引用使用绝对路径（如 `@/scenes/...`）
- Props 需要先解构再使用，例如 `const { children } = props;`
