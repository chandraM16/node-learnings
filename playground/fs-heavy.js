import { readFile } from "node:fs";

const t0 = Date.now();
let done = 0;
const N = 16;

for (let i = 1; i <= N; i++) {
  readFile("/tmp/big.bin", () => {
    if (++done === N) {
      console.log(`pool=${process.env.UV_THREADPOOL_SIZE ?? "4 (default)"}  →  ${N}x 50MB reads: ${Date.now() - t0}ms`);
    }
  });
}
