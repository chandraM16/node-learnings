import { readFile } from "node:fs";

const file = new URL(import.meta.url).pathname;
const t0 = Date.now();

for (let i = 1; i <= 8; i++) {
  readFile(file, () => console.log(`read ${i} @ ${Date.now() - t0}ms`));
}
