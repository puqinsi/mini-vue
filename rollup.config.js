import typescript from "@rollup/plugin-typescript";
import pkg from "./package.json";

export default {
  input: "./packages/vue/src/index.ts",
  output: [
    // 1. cjs -> commonjs
    {
      format: "cjs",
      file: pkg.main,
    },
    // 2. esm
    {
      format: "es",
      file: pkg.module,
    },
  ],
  plugins: [typescript()],
};
