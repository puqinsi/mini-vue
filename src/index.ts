// 公共出口
export * from "./runtime-dom";

import { baseCompile } from "./compiler-core/src";
import * as runtimeDom from "./runtime-dom";
import { registerRuntimeCompiler } from "./runtime-dom";

// 包装 compile 模块，返回 render
function compileToFunction(template: any) {
  const { code } = baseCompile(template);
  const render = new Function("Vue", code)(runtimeDom);
  // 利用闭包，返回的 render 可以访问 runtimeDom 的方法。
  return render;
}

// 给 runtime 模块的 compiler 赋值
registerRuntimeCompiler(compileToFunction);
