import { NodeTypes } from "../ast";

export function transformText(node: any) {
  if (node.type === NodeTypes.TEXT) {
    node.content = node.content + "mini-vue";
  }
}
