import { readFile } from "node:fs";

readFile(new URL(import.meta.url), () => {
  // Hum abhi POLL phase ke andar hain
  setTimeout(() => console.log("setTimeout"), 0);
  setImmediate(() => console.log("setImmediate"));
});
