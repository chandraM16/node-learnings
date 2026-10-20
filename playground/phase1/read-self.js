import { readFile } from "node:fs/promises";

// import.meta.url = is file ka apna path (ESM mein __filename ka replacement)
const myOwnSource = await readFile(new URL(import.meta.url), "utf8");
console.log(myOwnSource);
console.log(new URL(import.meta.url))

console.log("Main khud", myOwnSource.length, "characters lamba hoon");
console.log("Meri pehli line:", myOwnSource.split("\n")[0]);
