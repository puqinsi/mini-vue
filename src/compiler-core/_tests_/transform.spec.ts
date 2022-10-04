import { NodeTypes } from "../src/ast";
import { basicParse } from "../src/parse";
import { transform } from "../src/transform";
import { transformText } from "../src/transforms/transformText";

describe("transform", () => {
  it("happy path", () => {
    const ast = basicParse("<div>hi,{{message}}</div>");

    transform(ast, {
      nodeTransforms: [transformText],
    });

    const nodeText = ast.children[0].children[0];
    expect(nodeText.content).toBe("hi,mini-vue");
  });
});
