import { NodeTypes } from "../ast";
import { CREATE_ELEMENT_BLOCK } from "../runtimeHelpers";

export function transformText(node: any) {
  if (node.type === NodeTypes.TEXT) {
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
    context.helper(CREATE_ELEMENT_BLOCK);
  }
}
