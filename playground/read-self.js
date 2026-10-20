import { readFile } from "node:fs/promises";
const src = await readFile(new URL(import.meta.url), "utf8");
console.log("length:", src.length);
