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
  return createRoot(parseChildren(context, []));
}

function parseChildren(context: any, ancestors: string[]) {
  const nodes = [];

  // 处理核心：根据内容匹配到对应类型节点处理方法，直到内容全部处理完成，返回 AST
  while (!isEnd(context, ancestors)) {
    let s = context.source.trim();

    let node;
    if (s.startsWith("{{")) {
      // 解析插 值，返回虚拟节点
      node = parseInterpolation(context);
    } else if (s[0] === "<") {
      if (/[a-z]/i.test(s[1])) {
        node = parseElement(context, ancestors);
      }
    }

    if (!node) {
      node = parseText(context);
    }

    nodes.push(node);
  }

  return nodes;
}

function isEnd(context: any, ancestors: string[]) {
  // context.source 遇到结束标签
  const s = context.source.trim();
  for (let i = 0; i < ancestors.length; i++) {
    const tag = ancestors[i];
    if (startWidthEndTagOpen(s, tag)) {
      return true;
    }
  }

  // context.source 为空结束
  return !s;
}

function parseText(context: any): any {
  const s = context.source;
  let endIndex = s.length;
  const endTokens = ["</", "{{"];
  for (let i = 0; i < endTokens.length; i++) {
    const index = s.indexOf(endTokens[i]);
    if (index !== -1 && endIndex > index) {
      endIndex = index;
    }
  }

  // 之所以这么写是为了统一写法，然后抽象通用函数
  const content = parseTextData(context, endIndex);

  return {
    type: NodeTypes.TEXT,
    content,
  };
}

function parseElement(context: any, ancestors: string[]): any {
  // 处理开始标签，拿到 element
  const element: any = parseTag(context, TagTypes.START);
  // 用栈存储 element
  ancestors.unshift(element.tag);

  element.children = parseChildren(context, ancestors);
  ancestors.shift();

  // 处理结束标签
  if (startWidthEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagTypes.END);
  } else {
    throw new Error(`缺少结束标签:${element.tag}`);
  }

  return element;
}

function parseTag(context: any, type: any) {
  // element tag 前的空格需要去掉
  advanceBySpace(context);
  // 1. 匹配 & 解析
  const match: any = /^<\/?([a-z]*)/i.exec(context.source);
  const tag = match[1];

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

// 清除多余空格，内容推进
function advanceBySpace(context: any) {
  while (context.source.startsWith(" ")) {
    advanceBy(context, 1);
  }
}

// 内容推进处理
function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length);
}

function createRoot(children: any) {
  return {
    children,
    type: NodeTypes.ROOT,
  };
}

function createParserContext(content: string) {
  return { source: content };
}

function startWidthEndTagOpen(source: any, tag: string) {
  return (
    source.startsWith("</") &&
    source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
  );
}
