import { pbkdf2 } from "node:crypto";

// pbkdf2 = password hashing. Pure CPU kaam, par Node ise thread pool pe bhejta hai.
const t0 = Date.now();

for (let i = 1; i <= 8; i++) {
  pbkdf2("password", "salt", 300_000, 64, "sha512", () => {
    console.log(`Task ${i} khatam @ ${Date.now() - t0}ms`);
  });
}
