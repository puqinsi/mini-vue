import { NodeTypes } from "./ast";

export function basicParse(content: string) {
  // 创建上下文对象
  const context = createParserContext(content);

  // 返回 ast（Abstract Syntax Tree）抽象语法树
  return createRoot(parseChildren(context));
}

function parseChildren(context: any) {
  const nodes = [];

  let node;
  if (context.source.startsWith("{{")) {
    // 解析插 值，返回虚拟节点
    node = parseInterpolation(context);
  }
  nodes.push(node);

  return nodes;
}

function parseInterpolation(context: any) {
  const openDelimiter = "{{";
  const closeDelimiter = "}}";
  const openDelimiterLength = openDelimiter.length;
  const closeDelimiterLength = closeDelimiter.length;

  const closeIndex = context.source.indexOf(
    closeDelimiter,
    openDelimiterLength,
  );
  advanceBy(context, openDelimiterLength);

  const rawContentLength = closeIndex - closeDelimiterLength;
  // 细节：原始值先保留，再根据需要处理
  const rawContent = context.source.slice(0, rawContentLength);
  const content = rawContent.trim();

  advanceBy(context, rawContentLength + closeDelimiterLength);

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content,
    },
  };
}

// 内容推进处理
function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length);
}

function createRoot(children: any) {
  return {
    children,
  };
}

function createParserContext(content: string) {
  return { source: content };
}
