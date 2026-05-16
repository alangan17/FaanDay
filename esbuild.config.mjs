import esbuild from "esbuild";
import { builtinModules } from "node:module";

const isWatch = process.argv.includes("--watch");

const context = await esbuild.context({
  banner: {
    js: "/* THIS FILE IS GENERATED FROM src/main.ts. Do not edit main.js directly. */",
  },
  bundle: true,
  entryPoints: ["src/main.ts"],
  external: ["obsidian", "electron", "@codemirror/autocomplete", "@codemirror/collab", "@codemirror/commands", "@codemirror/language", "@codemirror/lint", "@codemirror/search", "@codemirror/state", "@codemirror/view", "@lezer/common", "@lezer/highlight", "@lezer/lr", ...builtinModules],
  format: "cjs",
  logLevel: "info",
  outfile: "main.js",
  platform: "browser",
  sourcemap: false,
  target: "es2022",
  treeShaking: true,
});

if (isWatch) {
  await context.watch();
  console.log("Watching for changes...");
} else {
  await context.rebuild();
  await context.dispose();
}
