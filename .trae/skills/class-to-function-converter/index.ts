import * as fs from 'fs';
import * as path from 'path';

interface ITask {
  input: string;
  workspace: {
    uri: {
      fsPath: string;
    };
  };
}

interface IConversionResult {
  filePath: string;
  success: boolean;
  error?: string;
}

function findAllTSXFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      files.push(...findAllTSXFiles(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx'))) {
      files.push(fullPath);
    }
  }

  return files;
}

function isClassComponent(content: string): boolean {
  const classComponentPattern = /class\s+\w+\s+extends\s+(React\.)?(Component|PureComponent)/;
  return classComponentPattern.test(content);
}

function extractClassName(content: string): string | null {
  const match = content.match(/class\s+(\w+)\s+extends/);
  return match ? match[1] : null;
}

function extractPropsType(content: string, className: string): string | null {
  const propsInterfacePattern = new RegExp(`interface\\s+${className}Props[^}]*\\}`);
  const match = content.match(propsInterfacePattern);
  return match ? match[0] : null;
}

function convertClassToFunction(content: string): string {
  const classNameMatch = content.match(/class\s+(\w+)\s+extends/);
  if (!classNameMatch) return content;

  const className = classNameMatch[1];
  const propsTypeName = `I${className}Props`;

  const stateMatch = content.match(/state\s*=\s*\{([^}]+)\}/);
  const setStateMatch = content.match(/this\.setState\(\{([^}]+)\}\)/g);
  const componentDidMountMatch = content.match(/componentDidMount\(\s*\)\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/);
  const componentDidUpdateMatch = content.match(/componentDidUpdate\([^)]*\)\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/);
  const componentWillUnmountMatch = content.match(/componentWillUnmount\(\s*\)\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/);
  const renderMatch = content.match(/render\(\s*\)\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/s);

  let result = content;

  result = result.replace(/import\s+React\s+from\s+['"]react['"]/g, "import React, { useState, useEffect, useCallback, FC } from 'react'");

  const propsType = extractPropsType(content, className);
  let propsInterface = '';
  if (propsType) {
    const cleanedProps = propsType
      .replace(/interface\s+\w+Props/, `interface ${propsTypeName}`)
      .replace(/\}$/, '  // TODO: 根据实际使用完善\n}');
    propsInterface = cleanedProps + '\n\n';
  } else {
    propsInterface = `interface ${propsTypeName} {\n  // TODO: 添加 Props 类型定义\n}\n\n`;
  }

  let stateDeclarations = '';
  let setStateReplacements: string[] = [];
  let effectStatements: string[] = [];

  if (stateMatch) {
    const stateContent = stateMatch[1];
    const stateVars = stateContent.split(',').map(s => s.trim()).filter(s => s);
    for (const stateVar of stateVars) {
      const [key, value] = stateVar.split(':').map(s => s.trim());
      const varName = key.replace(/['"]/g, '');
      const initialValue = value || 'null';
      stateDeclarations += `const [${varName}, set${varName.charAt(0).toUpperCase() + varName.slice(1)}] = useState<any>(${initialValue});\n`;
    }
    stateDeclarations += '\n';
  }

  if (setStateMatch) {
    for (const setState of setStateMatch) {
      const match = setState.match(/this\.setState\(\{([^}]+)\}\)/);
      if (match) {
        const stateUpdates = match[1].split(',').map(s => s.trim());
        for (const update of stateUpdates) {
          const [key, value] = update.split(':').map(s => s.trim());
          const varName = key.replace(/['"]/g, '');
          setStateReplacements.push(`set${varName.charAt(0).toUpperCase() + varName.slice(1)}(${value});`);
        }
      }
    }
  }

  if (componentDidMountMatch || componentDidUpdateMatch) {
    const effects: string[] = [];
    if (componentDidMountMatch) {
      effects.push(`useEffect(() => {\n${componentDidMountMatch[1]}}\n, []);`);
    }
    if (componentDidUpdateMatch) {
      effects.push(`useEffect(() => {\n${componentDidUpdateMatch[1]}}\n);`);
    }
    effectStatements = effects;
  }

  if (componentWillUnmountMatch) {
    effectStatements.push(`useEffect(() => {\nreturn () => {\n${componentWillUnmountMatch[1]}}\n}, []);`);
  }

  let renderContent = '';
  let propsDestructure = '';
  const propsRefs: string[] = [];

  if (renderMatch) {
    const processed = renderMatch[1]
      .replace(/this\.props\.(\w+)/g, (match, propName) => {
        if (!propsRefs.includes(propName)) {
          propsRefs.push(propName);
        }
        return propName;
      })
      .replace(/this\.(\w+)/g, '$1');

    if (propsRefs.length > 0) {
      propsDestructure = `  const { ${propsRefs.join(', ')} } = props;\n\n`;
    }

    renderContent = processed;
  }

  const effectsCode = effectStatements.length > 0 ? effectStatements.join('\n\n') + '\n\n' : '';

  const newComponent = `${propsInterface}const ${className}: FC<${propsTypeName}> = (props) => {\n${propsDestructure}${stateDeclarations}${effectsCode}${renderContent ? `  return (\n${renderContent}\n  );\n` : '  return null;\n'}};`;

  return newComponent;
}

export default async function classToFunctionConverter($task: ITask): Promise<void> {
  const workspaceRoot = $task.workspace.uri.fsPath;
  const userInput = $task.input.trim();
  const srcDir = path.join(workspaceRoot, 'src');

  if (!fs.existsSync(srcDir)) {
    console.log('未找到 src 目录，请确认项目结构');
    return;
  }

  let targetFiles: string[] = [];

  if (userInput) {
    const relativePath = userInput.replace(/^[.\/\\]+/, '');
    const targetPath = path.isAbsolute(relativePath)
      ? relativePath
      : path.join(workspaceRoot, relativePath);

    if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
      if (targetPath.endsWith('.tsx') || targetPath.endsWith('.jsx')) {
        targetFiles = [targetPath];
        console.log(`正在转换指定文件: ${path.relative(workspaceRoot, targetPath)}\n`);
      } else {
        console.log('指定文件不是 .tsx 或 .jsx 文件');
        return;
      }
    } else {
      console.log(`文件不存在: ${relativePath}`);
      return;
    }
  } else {
    console.log('开始扫描项目中的 React 组件...\n');
    targetFiles = findAllTSXFiles(srcDir);
  }

  const classComponents: string[] = [];
  const conversionResults: IConversionResult[] = [];

  for (const file of targetFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    if (isClassComponent(content)) {
      const className = extractClassName(content);
      classComponents.push(`${file} (${className})`);
      console.log(`发现 Class Component: ${path.relative(workspaceRoot, file)} (${className})`);

      try {
        const convertedContent = convertClassToFunction(content);
        fs.writeFileSync(file, convertedContent, 'utf-8');
        conversionResults.push({
          filePath: file,
          success: true,
        });
        console.log(`  ✓ 已转换为 Function Component\n`);
      } catch (error) {
        conversionResults.push({
          filePath: file,
          success: false,
          error: error instanceof Error ? error.message : '未知错误',
        });
        console.log(`  ✗ 转换失败: ${error instanceof Error ? error.message : '未知错误'}\n`);
      }
    }
  }

  console.log('\n========== 转换报告 ==========');
  console.log(`处理文件总数: ${targetFiles.length}`);
  console.log(`发现 Class Component: ${classComponents.length}`);

  if (conversionResults.length > 0) {
    console.log('\n转换结果:');
    for (const result of conversionResults) {
      const relativePath = path.relative(workspaceRoot, result.filePath);
      if (result.success) {
        console.log(`  ✓ ${relativePath}`);
      } else {
        console.log(`  ✗ ${relativePath} - ${result.error}`);
      }
    }
  }

  if (classComponents.length === 0) {
    console.log('\n未发现 Class Component，项目已全部使用 Function Component！');
  }
}
