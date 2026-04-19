import { cpSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { distDir, rootDir } from "./utils.mjs";

mkdirSync(distDir, { recursive: true });

const filesToCopy = [
    "src/manifest.json",
    "src/options.html",
    "src/icons/icon_16.png",
    "src/icons/icon_32.png",
    "src/icons/icon_48.png",
    "src/icons/icon_128.png"
];

for (const relativePath of filesToCopy) {
    cpSync(resolve(rootDir, relativePath), resolve(distDir, relativePath.replace(/.*\//, "")));
}
