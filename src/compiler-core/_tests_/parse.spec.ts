import { NodeTypes } from "../src/ast";
import { basicParse } from "../src/parse";

describe("Parse", () => {
  describe("interpolation", () => {
    test("simple", () => {
      // root
      const ast = basicParse("{{ message}}");

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: "message",
        },
      });
    });
  });

  describe("element", () => {
    it("simple div", () => {
      // root
      const ast = basicParse("<div></div>");

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.ELEMENT,
        tag: "div",
      });
    });
  });
});
