import { buildSync } from "esbuild";

// debug页面
buildSync({
  entryPoints: ["./src/client.js"],
  bundle: true,
  outfile: "./dist/client.js_raw",
  target: "es2020",
  platform: "browser",
  charset: "utf8",
});

// 主进程
buildSync({
  entryPoints: ["./src/main.js"],
  bundle: true,
  outfile: "./dist/main.js",
  target: "node16",
  platform: "node",
  format: "cjs",
  charset: "utf8",
  external: ["electron"],
  loader: {
    ".js_raw": "text",
    ".html": "text",
  },
});

console.log("build ok");
