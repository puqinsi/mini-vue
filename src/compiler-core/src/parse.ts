import { NodeTypes } from "./ast";

// 标签类型
const enum TagTypes {
  START,
  END,
}

export function basicParse(content: string) {
  // 创建上下文对象
  const context = createParserContext(content);

  // 返回 ast（Abstract Syntax Tree）抽象语法树
  return createRoot(parseChildren(context));
}

function parseChildren(context: any) {
  const s = context.source;
  const nodes = [];

  let node;
  if (s.startsWith("{{")) {
    // 解析插 值，返回虚拟节点
    node = parseInterpolation(context);
  } else if (s[0] === "<") {
    if (/[a-z]/i.test(s[1])) {
      node = parseElement(context);
    }
  }

  if (!node) {
    node = parseText(context);
  }

  nodes.push(node);

  return nodes;
}

function parseText(context: any): any {
  // 之所以这么写是为了统一写法，然后抽象通用函数
  const content = parseTextData(context, context.source.length);
  console.log("context source:", context.source);

  return {
    type: NodeTypes.TEXT,
    content,
  };
}

function parseElement(context: any): any {
  const element = parseTag(context, TagTypes.START);
  console.log("context source:", context.source);
  parseTag(context, TagTypes.END);
  console.log("context source:", context.source);

  return element;
}

function parseTag(context: any, type: any) {
  // 1. 匹配 & 解析
  const match: any = /^<\/?([a-z]*)/i.exec(context.source);
  const tag = match[1];
  console.log(match);

  // 2. 推进代码
  advanceBy(context, match[0].length);
  advanceBy(context, 1);

  // 如果是结束标签不需要返回值
  if (type === TagTypes.END) return;

  return {
    type: NodeTypes.ELEMENT,
    tag,
  };
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
  const rawContent = parseTextData(context, rawContentLength);
  const content = rawContent.trim();

  advanceBy(context, closeDelimiterLength);

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content,
    },
  };
}

// 取内容 & 内容推进
function parseTextData(context: any, length: number) {
  const content = context.source.slice(0, length);
  advanceBy(context, length);

  return content;
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
