import { generate } from "../src/codegen";
import { basicParse } from "../src/parse";
import { transform } from "../src/transform";
import {
  transformCompound,
  transformElement,
  transformExpression,
} from "../src/transforms";

describe("codegen", () => {
  it("string", () => {
    const ast = basicParse("hi");

    transform(ast);

    const { code } = generate(ast);

    // 快照
    // 1. 抓取 bug
    // 2. 有意修改
    expect(code).toMatchSnapshot();
  });

  it("interpolation", () => {
    const ast = basicParse("{{message}}");

    transform(ast, {
      nodeTransforms: [transformExpression],
    });

    const { code } = generate(ast);

    expect(code).toMatchSnapshot();
  });

  it("element", () => {
    const ast = basicParse("<div></div>");

    transform(ast, {
      nodeTransforms: [transformElement],
    });

    const { code } = generate(ast);

    expect(code).toMatchSnapshot();
  });

  it("mix", () => {
    const ast: any = basicParse("<div>hi, {{message}}</div>");
    console.log("ast------", ast);
    transform(ast, {
      nodeTransforms: [
        transformExpression,
        transformElement,
        transformCompound,
      ],
    });
    console.log("transform------", ast);

    const { code } = generate(ast);
    console.log("code------", code);

    expect(code).toMatchSnapshot();
  });
});
