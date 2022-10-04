import { NodeTypes } from "../src/ast";
import { basicParse } from "../src/parse";
import { transform } from "../src/transform";

describe("transform", () => {
  it("happy path", () => {
    const ast = basicParse("<div>hi,{{message}}</div>");

    const plugin = (node: any) => {
      if (node.type === NodeTypes.TEXT) {
        node.content = node.content + "mini-vue";
      }
    };

    transform(ast, {
      nodeTransforms: [plugin],
    });

    const nodeText = ast.children[0].children[0];
    expect(nodeText.content).toBe("hi,mini-vue");
  });
});
