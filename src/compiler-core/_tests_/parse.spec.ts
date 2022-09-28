import { NodeTypes } from "../src/ast";
import { basicParse } from "../src/parse";

describe("Parse", () => {
  describe("interpolation", () => {
    test("simple interpolation", () => {
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

  describe("text", () => {
    it("simple text", () => {
      // root
      const ast = basicParse("some content");

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.TEXT,
        content: "some content",
      });
    });
  });

  // TODO
  describe("mix content", () => {
    it.skip("simple mix", () => {
      // root
      const ast = basicParse("<div> hi,{{message}} </div>");

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.ELEMENT,
        tag: "div",
        content: [
          {
            type: NodeTypes.TEXT,
            content: "hi,",
          },
          {
            type: NodeTypes.INTERPOLATION,
            content: {
              type: NodeTypes.SIMPLE_EXPRESSION,
              context: "message",
            },
          },
        ],
      });
    });
  });
});
