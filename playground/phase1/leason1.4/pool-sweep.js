import { pbkdf2 } from "node:crypto";

const t0 = Date.now();
let done = 0;
const N = 8;

for (let i = 1; i <= N; i++) {
  pbkdf2("password", "salt", 300_000, 64, "sha512", () => {
    if (++done === N) {
      console.log(`pool=${process.env.UV_THREADPOOL_SIZE ?? "4 (default)"}  →  saare ${N} tasks: ${Date.now() - t0}ms`);
    }
  });
}
