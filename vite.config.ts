import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [dts()],
  build: {
    sourcemap: true,
    minify: "terser",
    terserOptions: {
      module: true,
      compress: {
        arguments: true,
        booleans_as_integers: true,
        drop_console: true,
        passes: 3,
        unsafe: true,
        unsafe_arrows: true,
        unsafe_comps: true,
        unsafe_Function: true,
        unsafe_math: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
      },
    },
    lib: {
      name: "cssuniconrn",
      entry: "src/index.ts",
      formats: ["es", "cjs", "umd"],
    },
  },
});
