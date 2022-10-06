import { generate } from "./codegen";
import { basicParse } from "./parse";
import { transform } from "./transform";
import {
  transformCompound,
  transformElement,
  transformExpression,
} from "./transforms";

export function baseCompile(template: any) {
  const ast: any = basicParse(template);

  transform(ast, {
    nodeTransforms: [transformExpression, transformElement, transformCompound],
  });

  return generate(ast);
}
