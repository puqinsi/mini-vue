import { createVNodeCall, NodeTypes } from "../ast";
import { isCompoundTypes } from "../utils";

export function transformText(node: any) {
  if (node.type === NodeTypes.TEXT) {
    // TODO "mini-vue"
    node.content = node.content + "mini-vue";
  }
}

export function transformExpression(node: any) {
  if (node.type === NodeTypes.INTERPOLATION) {
    processExpression(node.content);
  }
}
function processExpression(node: any) {
  node.content = `_ctx.${node.content}`;
}

export function transformElement(node: any, context: any) {
  if (node.type === NodeTypes.ELEMENT) {
    return () => {
      // 中间处理层
      // tag
      const vnodeTag = `'${node.tag}'`;

      // props
      let vnodeProps;

      // children
      // TODO children[0] 是否符合所有测试（children 中 text 插值 和 element 混合情况）
      const vnodeChildren = node.children[0];

      node.codegenNode = createVNodeCall(
        context,
        vnodeTag,
        vnodeProps,
        vnodeChildren,
      );
    };
  }
}

export function transformCompound(node: any) {
  if (node.type === NodeTypes.ELEMENT) {
    return () => {
      const { children } = node;
      let currentContainer;

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (isCompoundTypes(child)) {
          for (let j = i + 1; j < children.length; j++) {
            const next = children[j];

            if (isCompoundTypes(next)) {
              if (!currentContainer) {
                currentContainer = children[i] = {
                  type: NodeTypes.COMPOUND_EXPRESSION,
                  children: [child],
                };
              }

              currentContainer.children.push(" + ");
              currentContainer.children.push(next);
              children.splice(j, 1);
              j--;
            } else {
              currentContainer = undefined;
              break;
            }
          }
        }
      }
    };
  }
}
