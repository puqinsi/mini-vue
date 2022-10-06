import { isString } from "../../shared";
import { NodeTypes } from "./ast";
import {
  CREATE_ELEMENT_BLOCK,
  helperMapName,
  TO_DISPLAY_STRING,
} from "./runtimeHelpers";

export function generate(ast: any) {
  const context = createCodegenContext();
  const push = context.push;

  // 导入的逻辑
  getFunctionPreamble(ast, context);

  push("return ");

  const functionName = "render";
  const args = ["_ctx", "_cache"];
  const signature = args.join(", ");
  push(`function ${functionName}(${signature}) {`);
  push("return ");
  genNode(ast.codegenNode, context);

  push("}");

  return {
    code: context.code,
  };
}

function getFunctionPreamble(ast: any, context: any) {
  const { push, helper } = context;
  const vueBinging = "Vue";
  const aliasHelper = (s: string) => `${helperMapName[s]}: ${helper(s)}`;
  const helpers = ast.helpers;
  if (helpers.length) {
    push(
      `const { ${ast.helpers.map(aliasHelper).join(", ")} } = ${vueBinging}`,
    );
    push("\n");
  }
}

function genNode(node: any, context: any) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context);
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genSimpleExpression(node, context);
      break;
    case NodeTypes.ELEMENT:
      genElement(node, context);
      break;
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompound(node, context);
      break;
    default:
      break;
  }
}

function genCompound(node: any, context: any) {
  const { children } = node;
  const { push } = context;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (isString(child)) {
      push(child);
    } else {
      genNode(child, context);
    }
  }
}

function genElement(node: any, context: any) {
  const { push, helper } = context;
  const { tag, props, children } = node;
  push(`${helper(CREATE_ELEMENT_BLOCK)}(`);
  genNodeList(genNullable([tag, props, children]), context);

  push(")");
}

function genNodeList(nodes: any, context: any) {
  const { push } = context;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (isString(node)) {
      push(node);
    } else {
      genNode(node, context);
    }

    if (i < nodes.length - 1) {
      push(", ");
    }
  }
}

function genNullable(args: any) {
  return args.map((arg: any) => arg || "null");
}

function genSimpleExpression(node: any, context: any) {
  const { push } = context;
  push(`${node.content}`);
}

function genInterpolation(node: any, context: any) {
  const { push, helper } = context;
  push(`${helper(TO_DISPLAY_STRING)}(`);
  genNode(node.content, context);
  push(`)`);
}

function genText(node: any, context: any) {
  const { push } = context;
  push(`'${node.content}'`);
}

// 封装上下文对象
function createCodegenContext() {
  const context = {
    code: "",
    push(source: string) {
      context.code += source;
    },
    helper(key: any): string {
      return `_${helperMapName[key]}`;
    },
  };

  return context;
}
