# Diagnostic Assessment — Baseline (2026-10-19)

Purpose: find the real starting point. Not a quiz to pass.
Rules: don't run the code, don't look things up. "I don't know" is a genuinely
useful answer — it is faster to teach a gap than to unteach a wrong model.

Answer inline under each question if you prefer writing here.

---

## Part A — Conceptual (mental models)

**A1.** Node runs your JavaScript on a single thread, yet a Node server can
handle thousands of simultaneous HTTP connections. How do you think that
works? Where does the concurrency actually come from?

> _answer:_

**A2.** Node.js is often described as "V8 + libuv". What do you think each of
those is responsible for? What does Node itself add on top?

> _answer:_

**A3.** This handler is in a running API server:

```js
app.get("/report", (req, res) => {
  const result = computeHugeReportSynchronously(); // ~4 seconds of pure JS
  res.json(result);
});
```

What happens to *other* users' requests during those 4 seconds, and why?
What would you do about it?

> _answer:_

---

## Part B — Code Prediction (no running it)

**B1.** Exact output order, and why:

```js
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => console.log("3"));

process.nextTick(() => console.log("4"));

setImmediate(() => console.log("5"));

(async () => {
  console.log("6");
  await null;
  console.log("7");
})();

console.log("8");
```

> _answer:_

**B2.** Each `fetchUser` call takes ~200ms. Roughly how long does this take for
50 ids, and why? If you wanted it faster, what would you change — and what new
problem would that introduce?

```js
const users = [];
for (const id of ids) {
  users.push(await fetchUser(id));
}
```

> _answer:_

**B3.** What does this print, and is anything wrong with it?

```js
async function main() {
  try {
    [1, 2, 3].forEach(async (n) => {
      if (n === 2) throw new Error("boom");
      console.log("ok", n);
    });
  } catch (err) {
    console.log("caught:", err.message);
  }
  console.log("done");
}
main();
```

> _answer:_

---

## Part C — Debugging

**C1.** This runs in production against PostgreSQL. There is a serious bug.
What is it, and what will actually happen under load?

```js
const pool = new Pool({ max: 10 });

async function transferFunds(fromId, toId, amount) {
  await pool.query("BEGIN");
  await pool.query("UPDATE accounts SET balance = balance - $1 WHERE id = $2", [amount, fromId]);
  await pool.query("UPDATE accounts SET balance = balance + $1 WHERE id = $2", [amount, toId]);
  await pool.query("COMMIT");
}
```

> _answer:_

**C2.** This endpoint serves a 2 GB CSV export. It works in testing and takes
down the server in production. Why? What's the fix called?

```js
app.get("/export", async (req, res) => {
  const data = await fs.promises.readFile("/data/export.csv", "utf8");
  res.send(data);
});
```

> _answer:_

---

## Part D — Design / Architecture

**D1.** A payment endpoint `POST /payments`. The mobile client sometimes
retries on network timeout, and users sometimes double-tap. How would you make
sure the customer is never charged twice? Be as concrete as you can.

> _answer:_

**D2.** Two requests arrive at the same millisecond to decrement stock for the
last remaining item (`quantity = 1`). Both read `quantity`, both see 1, both
write 0 and both succeed. What is this problem called, and what mechanisms do
you know to prevent it?

> _answer:_

---

## Part E — HTTP & API

**E1.** Answer briefly:
- Which HTTP status for: validation failure / not authenticated / authenticated
  but not allowed / conflict with current state?
- Which of POST, PUT, PATCH, DELETE are idempotent, and why does idempotency matter?

> _answer:_

**E2.** Session cookies vs JWTs for authenticating an API. Give one real
advantage of each, and one real problem with each.

> _answer:_

---

## Part F — Modules & Tooling

**F1.** Difference between:
```js
const x = require("./x");   // vs
import x from "./x";
```
Not just syntax — anything you know about how they behave differently.

> _answer:_

**F2.** Briefly:
- What is `package-lock.json` for, and why commit it?
- `dependencies` vs `devDependencies` — what actually breaks if you get it wrong?
- What does `^1.4.2` allow?

> _answer:_

---

## Scoring intent (for the mentor, not a grade)
- Part A → does a runtime mental model exist at all?
- Part B → async scheduling precision; the single best predictor of Node skill
- Part C → production instincts
- Part D → concurrency/distributed-systems instincts
- Part E → backend fundamentals
- Part F → tooling literacy
