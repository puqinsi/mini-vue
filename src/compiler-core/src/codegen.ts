export function generate(ast: any) {
  const context = createCodegenContext(ast);
  const push = context.push;

  push("return ");

  const functionName = "render";
  const args = ["_ctx", "_cache"];
  const signature = args.join(", ");
  push(`function ${functionName}(${signature}) {`);

  genNode(ast.codegenNode, context);

  push("}");

  return {
    code: context.code,
  };
}

function genNode(node: any, { push }: any) {
  push(`return '${node.content}'`);
}

// 封装上下文对象
function createCodegenContext(ast: any) {
  const context = {
    code: "",
    push(source: string) {
      context.code += source;
    },
  };

  return context;
}
