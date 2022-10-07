import { defineConfig } from "vitest/config";
import path from "path";
import AutoImport from "unplugin-auto-import/vite";

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: [
      {
        find: /@mini-vue\/(\w*)/,
        replacement: path.resolve(__dirname, "packages") + "/$1/src",
      },
    ],
  },
  plugins: [
    AutoImport({
      imports: ["vitest"],
      dts: true, // generate TypeScript declaration
    }),
  ],
});
