import path from "path";
import { defineConfig } from "vite";
const fname = "diff-wrapper";
export default defineConfig({
  base: "./",
  publicDir: false,
  build: {
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: fname,
      formats: ["es", "cjs", "umd"],
      fileName: (format) => `${fname}.${format}.js`,
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
  },
});
