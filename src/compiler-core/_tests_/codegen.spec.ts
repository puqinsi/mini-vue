import { generate } from "../src/codegen";
import { basicParse } from "../src/parse";
import { transform } from "../src/transform";
import { transformExpression } from "../src/transforms/transformExpression";

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
    console.log(ast);
    const { code } = generate(ast);

    expect(code).toMatchSnapshot();
  });
});
