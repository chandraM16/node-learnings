# Exercise 1.1 — Node.js actually hai kya?

Phase 1, Lesson 1.1 · issued 2026-10-19 · status: **pending**

Rule: **pehle predict, phir run.** Prediction likhe bina chalaoge toh exercise
ka aadha fayda chala jaata hai — galat model tabhi pakda jaata hai jab usne
commit kiya ho.

---

## Task 1 — Runtime ke parts

```bash
node -p "process.versions"
```

Jo 5 entries sabse interesting lagin, likho aur guess karo woh kis kaam ki hain:

> _answer:_

---

## Task 2 — Globals: predict, phir run

| Command | Meri prediction | Actual |
|---|---|---|
| `node -p "typeof window"` | | |
| `node -p "typeof document"` | | |
| `node -p "typeof process"` | | |
| `node -p "typeof fetch"` | | |
| `node -p "typeof require"` | | |

Koi prediction galat nikli? Kyun galat thi?

> _answer:_

---

## Task 3 — `playground/whoami.js`

```js
console.log("Process ID:", process.pid);
console.log("Node version:", process.version);
console.log("Platform:", process.platform, process.arch);
console.log("Kis folder mein chal raha hai:", process.cwd());
console.log("Memory abhi:", Math.round(process.memoryUsage().heapUsed / 1024 / 1024), "MB");
```

Do baar chalao. `process.pid` badla? **Kyun?**

> _answer:_

---

## Task 4 — `playground/read-self.js`

```js
import { readFile } from "node:fs/promises";

const myOwnSource = await readFile(new URL(import.meta.url), "utf8");

console.log("Main khud", myOwnSource.length, "characters lamba hoon");
console.log("Meri pehli line:", myOwnSource.split("\n")[0]);
```

`.js` extension ke saath chalane pe kya error aaya? Poora error text paste karo —
us error ko padhna Lesson 1.11 (ES Modules) ka entry point hai.

> _error:_

Ye code browser mein kyun nahi chal sakta?

> _answer:_

---

## Task 5 — `playground/alive.js` ⭐ sabse important

```js
let seconds = 0;

setInterval(() => {
  seconds++;
  console.log(`Main ${seconds} second se zinda hoon. PID ${process.pid}`);
}, 1000);

console.log("Script ki aakhri line chal gayi. Kya process ab band hoga?");
```

Script ki aakhri line chal chuki hai, phir bhi process zinda hai. **Kyun?**
Node ko kaise pata ki abhi band nahi hona?

> _answer:_

---

## Review Questions

1. JavaScript vs Node.js vs Express — ek-ek line.
   > _answer:_

2. V8 ka kaam kya hai, aur V8 **akela** kya nahi kar sakta?
   > _answer:_

3. React app aur Node server ke lifetime mein sabse bada farak?
   > _answer:_

4. `document` Node mein kyun nahi hai — technical limitation ya design choice?
   > _answer:_

5. Node server 3 din se chal raha hai, memory dheere-dheere badh rahi hai.
   Chinta kyun honi chahiye, jabki React mein ye kabhi problem nahi tha?
   > _answer:_
