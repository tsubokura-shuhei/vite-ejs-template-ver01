import { defineConfig } from "vite";
import { ViteEjsPlugin } from "vite-plugin-ejs";
import sassGlobImports from "vite-plugin-sass-glob-import";

import { globSync } from "glob";
import path from "node:path";
import { fileURLToPath } from "node:url";

const jsFiles = Object.fromEntries(
  globSync("src/**/*.js", {
    ignore: ["node_modules/**", "**/modules/**", "**/dist/**"],
  }).map((file) => [
    path.basename(file, path.extname(file)), // フォルダ構造を除外し、ファイル名のみ取得
    fileURLToPath(new URL(file, import.meta.url)),
  ])
);

const scssFiles = Object.fromEntries(
  globSync("src/assets/scss/**/*.scss", {
    ignore: ["src/assets/scss/**/_*.scss"],
  }).map((file) => [
    path
      .relative("src/assets/scss/", file)
      .replace(/\\/g, "/")
      .replace(/\.[^/.]+$/, ""),
    fileURLToPath(new URL(file, import.meta.url)),
  ])
);

const htmlFiles = Object.fromEntries(
  globSync("src/**/*.html", { ignore: ["node_modules/**", "**/dist/**"] }).map(
    (file) => [
      path
        .relative("src", file)
        .replace(/\\/g, "/")
        .replace(/\.[^/.]+$/, ""),
      fileURLToPath(new URL(file, import.meta.url)),
    ]
  )
);

// SCSS ファイルを取得（フォルダ構造を無視してファイル名のみ取得）
// const scssFiles2 = Object.fromEntries(
//   globSync("components/scss/*.scss").map((file) => [
//     path.basename(file, path.extname(file)), // ファイル名のみ取得（フォルダ構造を排除）
//     fileURLToPath(new URL(file, import.meta.url)), // 絶対パス
//   ])
// );

const inputObject = { ...scssFiles, ...jsFiles, ...htmlFiles };

export default defineConfig({
  root: "./src",
  build: {
    outDir: "dist",
    cssCodeSplit: true,
    modulePreload: false,
    rollupOptions: {
      input: inputObject,
      output: {
        entryFileNames: "assets/js/[name].js", // フォルダを作成しない
        chunkFileNames: "assets/js/[name].js", // チャンクも同様
        assetFileNames: (assetInfo) => {
          if (/\.(gif|jpeg|jpg|png|svg|webp)$/.test(assetInfo.name)) {
            return "assets/[name].[ext]";
          }
          if (/\.(css)$/.test(assetInfo.name)) {
            return "assets/css/[name].[ext]";
          }
          return "assets/[name].[ext]";
        },
      },
    },
  },
  server: {
    port: 3000,
  },
  plugins: [ViteEjsPlugin(), sassGlobImports()],
});
