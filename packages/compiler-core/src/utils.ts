import { NodeTypes } from "./ast";

export function isCompoundTypes(node: any) {
  return node.type === NodeTypes.TEXT || node.type === NodeTypes.INTERPOLATION;
}
