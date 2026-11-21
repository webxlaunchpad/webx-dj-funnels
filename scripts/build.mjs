// Builds the funnel's browser side into public/: index.html, app.js, app.css and hashed assets.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "public");
fs.rmSync(path.join(out, "assets"), { recursive: true, force: true });
const r = await esbuild.build({
  entryPoints: { app: "client/main.tsx", "app-css": "client/styles.css" },
  absWorkingDir: root, outdir: "public", bundle: true, format: "esm", minify: true, target: "es2020", jsx: "automatic",
  loader: { ".jpg": "file", ".png": "file", ".webp": "file", ".svg": "file", ".mp4": "file" },
  assetNames: "assets/[name]-[hash]", entryNames: "[name]-[hash]", publicPath: "/", metafile: true,
  define: { "process.env.NODE_ENV": '"production"' }, logLevel: "warning",
});
const outs = Object.keys(r.metafile.outputs).map((f) => path.basename(f));
const js = outs.find((f) => /^app-[A-Z0-9]+\.js$/i.test(f)); const css = outs.find((f) => /^app-css-[A-Z0-9]+\.css$/i.test(f));
for (const f of fs.readdirSync(out)) if (/^app(-css)?-[A-Z0-9]+\.(js|css)$/i.test(f) && f !== js && f !== css) fs.rmSync(path.join(out, f));
const html = fs.readFileSync(path.join(root, "client/index.html"), "utf8").replace("%JS%", `/${js}`).replace("%CSS%", `/${css}`);
fs.writeFileSync(path.join(out, "index.html"), html);
console.log("built", js, css);
