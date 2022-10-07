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
        children: [],
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

  describe("mix content", () => {
    it("happy path", () => {
      // root
      const ast = basicParse("<div>hi, {{message}}</div>");

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.ELEMENT,
        tag: "div",
        children: [
          {
            type: NodeTypes.TEXT,
            content: "hi, ",
          },
          {
            type: NodeTypes.INTERPOLATION,
            content: {
              type: NodeTypes.SIMPLE_EXPRESSION,
              content: "message",
            },
          },
        ],
      });
    });

    it("nested element", () => {
      // root
      const ast = basicParse("<div> <p>hi,</p>{{message}}</div>");

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.ELEMENT,
        tag: "div",
        children: [
          {
            type: NodeTypes.ELEMENT,
            tag: "p",
            children: [
              {
                type: NodeTypes.TEXT,
                content: "hi,",
              },
            ],
          },
          {
            type: NodeTypes.INTERPOLATION,
            content: {
              type: NodeTypes.SIMPLE_EXPRESSION,
              content: "message",
            },
          },
        ],
      });
    });

    it("should throw Error when lack end tag", () => {
      expect(() => basicParse("<div><span></div>")).toThrow(
        `缺少结束标签:span`,
      );
    });
  });
});
