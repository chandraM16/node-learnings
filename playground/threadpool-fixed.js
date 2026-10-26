import { pbkdf2 } from "node:crypto";

const t0 = Date.now();          // ek hi baseline, kabhi nahi badalta

for (let i = 1; i <= 8; i++) {
  pbkdf2("password", "salt", 300_000, 64, "sha512", () => {
    console.log(`Task ${i} khatam @ ${Date.now() - t0}ms`);
  });
}
