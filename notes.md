# Notes — Node.js & Backend Knowledge Base

My own understanding, not lesson transcripts. Organized by topic so it stays
useful as a reference.

Conventions used here:
- **Mental model** — the picture to think with
- **Rule** — something to rely on
- **Gotcha** — where intuition fails
- **Why** — the reason it exists / behaves that way

---

## Environment
- Node **v22.21.1** (LTS), npm 10.9.4, PostgreSQL 17.9, macOS.
- Docker not installed yet (needed from Phase 6).
- Node-version-dependent behavior will be flagged where it matters.

---

# Node.js

## Runtime
### What Node.js is
**Lesson 1.1 · 2026-10-19**

Three things people conflate:
- **Language** = JavaScript (the ECMAScript spec: syntax, objects, promises)
- **Runtime** = the program that *executes* the language and gives it access to
  the outside world: Node.js, Chrome, Deno, Bun
- **Framework** = structure layered on top: Express, NestJS, React

**Key realisation:** the ECMAScript spec contains *nothing* about files,
networks, or ports. JavaScript by itself cannot touch the outside world.
Everything useful comes from the runtime.

> **Mental model:** V8 is an engine. An engine alone goes nowhere. Node.js is the
> whole car built around that engine. The browser is a *different* car with the
> same engine — different body, different capabilities.
> *Simple words mein: language same, gaadi alag.*

**Node.js is a C++ program** that embeds V8 + libuv + several C libraries, and
exposes them to JavaScript. Proof — `node -p "process.versions"` on v22.21.1:

| Component | Job |
|---|---|
| `v8` 12.4 | parse/compile/run JS, manage heap + garbage collection |
| `uv` 1.51 (**libuv**) | event loop, thread pool, OS async I/O (epoll/kqueue/IOCP) |
| `openssl` 3.5 | TLS, HTTPS, the `crypto` module |
| `llhttp` 9.3 | HTTP parser — raw socket bytes → request objects |
| `undici` 6.22 | modern HTTP client; built-in `fetch()` is built on it |
| `ada` | URL parsing |
| `ares` | async DNS |
| `zlib`/`brotli`/`zstd` | compression |
| `amaro` | **TypeScript type-stripping** — Node 22 can run `.ts` directly |
| `sqlite` | built-in SQLite (new-ish in Node 22) |

Layer stack:

```
Your code (app.ts)
Node JS stdlib (fs, http, stream, path)     ← JavaScript
Bindings layer                              ← C++ bridge
V8  |  libuv (+ openssl, llhttp, ...)       ← C++ / C
Operating System
```

**Why Node exists (2009):** the dominant server model was one OS thread per
request. Threads cost ~1 MB of stack each and spend most of their life *waiting*
on disk/DB. Ryan Dahl's bet: one thread, never wait, use callbacks on completion.

**Gotcha — "Node is single-threaded" is only half true.** *Your JavaScript* runs
on one thread. The *Node process* has several (libuv thread pool, GC, etc.).
Deferred to Lesson 1.4.

### The biggest shift from frontend to backend
| | Browser (React) | Node (server) |
|---|---|---|
| Lifetime | dies on refresh | runs for weeks |
| Memory | per user, fresh each load | **shared by all users, never reset** |
| Slow code | hurts that one user | **hurts every user at once** |
| Global state | harmless-ish | leaks, grows, crashes the box at 3am |

*Simple words mein: frontend mein har user ka apna ghar. Backend mein sab ek hi
ghar mein rehte hain.*

**Common mistakes:** Node is a language ✗ · Node is a framework ✗ ·
Node = Express ✗ · Node version = JS version ✗ · npm packages are
interchangeable between browser and server ✗

### The process (Lesson 1.1 exercise, 2026-10-20)
`node app.js` → the OS creates a **new process**: its own memory/address space
and a unique **PID**. Script ends → process dies → PID returned to the OS.
Running the same file 3 times gave PID 81195, 81196, 81197.

> **Mental model:** the script is a *recipe*; the process is *one act of cooking
> it*. Three runs = three separate meals.

Why this is the base of everything later:
- All server memory lives inside that one process. Process dies → state gone.
- Variables survive between requests because the **process** stays alive.
- One process = one JS thread = one core. Using 8 cores needs multiple
  processes → `cluster` (Phase 3).
- Deploy = kill old process, start new one. In-flight requests → **graceful
  shutdown** (Phase 6).
- Crash = process gone; something must restart it (PM2 / systemd / Kubernetes).

### Why a Node process stays alive (ref-counted handles)
libuv keeps a **counter of active handles and requests**: every timer, open
socket, listening server, pending file op adds 1; completion subtracts 1.
**After each loop turn, if the count is zero, the process exits by itself.**
Nothing "stops" it — there is simply nothing left to do.

Measured:
| script | pending work | result |
|---|---|---|
| `console.log` only | none | exits in 0.02s |
| `setTimeout(fn, 1000)` | 1 timer handle | runs 1.02s, then exits |
| `setTimeout` + `t.unref()` | handle not counted | exits in 0.03s, **timer never fires** |

`unref()` = "this handle may run, but don't count it when deciding to exit."

**This is why a server runs for weeks:** `listen(3000)` leaves a listening
socket handle in the count, permanently.

**Gotcha:** "I didn't clear the interval" is the *symptom*. "Active handle count
never reached zero" is the *mechanism*. When a process refuses to exit in
production, the useful question is **which handle is still referenced**.

## Node vs Browser JavaScript
**Lesson 1.2 · 2026-10-20**

Same language, **different contract**. The reason is not capability — it is **trust**.

> A browser runs code from *strangers*, unasked: you open a site and it executes
> immediately. So the browser is a **jail** — no files, no sockets, no OS.
> Node runs code *you wrote or chose to install*, on *your* server, deliberately.
> No jail needed; touching files and ports is the whole job.
>
> *Simple words mein: browser JavaScript ko OS se bachata hai. Node JavaScript
> ko OS deta hai.*

**The flip side:** `npm install` puts a stranger's code on your machine **with
your full privileges**. Browser code can never do that. This is why supply-chain
attacks are a backend problem (Lesson 1.14).

### Who has what (measured on Node v22.21.1)
| | APIs |
|---|---|
| **Node only** | `fs`, `net`, `http` (server), `child_process`, `worker_threads`, `os`, `process`, `cluster` |
| **Browser only** | `document`, `window`, `localStorage`, `sessionStorage`, `alert`, `history`, `XMLHttpRequest` |
| **Both** (Web Standards adopted by Node) | `fetch`, `URL`, `URLSearchParams`, `AbortController`, `TextEncoder`, `structuredClone`, `queueMicrotask`, `EventTarget`, `Blob`, `FormData`, `Headers`, `Request`, `Response`, `WebSocket`, `ReadableStream`/`WritableStream`/`TransformStream`, `crypto`, `performance`, `console`, `navigator` |

Browser-only APIs are absent because there is **no screen, no user, no tab** —
not because of a technical limit (`jsdom` can simulate a DOM for tests).

Surprise: `window` is absent but **`navigator` exists** —
`navigator.hardwareConcurrency` gives CPU count (8 on this machine), useful for
sizing a `cluster`.

`globalThis` works in both (`window` in browsers, `global` in Node).

### CORS is a browser rule, not a server rule
```js
fetch("https://api.github.com/...")   // Node:    always allowed
                                       // Browser: only if the server sends CORS headers
```
**Why:** the browser attaches **the user's cookies automatically**. Without the
same-origin policy, `evil.com` could call `yourbank.com/transfer` with your live
session. Node has no cookies, no user, no ambient authority — **nothing to
protect**, so no CORS.

> **Consequence:** a CORS error in your React app is fixed **on the backend**,
> never in the frontend. (Implemented in Phase 4.)

### Two separate walls between browser and database
A `validateEmail(email)` pure function **can** be shared browser/server.
The same function doing a DB existence check **cannot**:
1. **Impossible** — the browser cannot open a raw TCP socket, so `pg` cannot run there
2. **Wrong even if possible** — DB credentials would ship to every user

Correct shape: browser → `POST /check-email` → server → DB. The server *is* the
wall.

### Blast radius of a malicious dependency
| | Compromised npm package |
|---|---|
| **On a server** | whole machine, every user's data, DB credentials, internal network — **all at once** |
| **In a browser** | only that page, that one user, while the tab is open (still real: token theft, **Magecart** card skimming) |

Both bad. The server one is far worse.

**Gotchas:** looking for `window` in Node (use `globalThis`) · wanting
`localStorage` on a server (server state → Redis/DB) · thinking Node's file
access is about *power* rather than *trust* · treating `npm install` as harmless.

---

## V8
**Lesson 1.3 · 2026-10-20**

V8 does exactly three things: **compile JS → run it → manage memory.** Each has
a production consequence.

### Not an interpreter — a tiered JIT
1. **Parse** → syntax tree
2. **Ignition** → **bytecode**, starts running immediately (fast start, average speed)
3. **Profiler** watches which functions are hot and what types flow through them
4. Hot functions → **Maglev/TurboFan** compile them to **optimized machine code**,
   specialised to the *observed* types
5. If an assumption breaks (numbers, then suddenly a string) → **deoptimize**

This exists because JS has no static types: V8 must **guess** what the code does,
and rewards correct guesses.

**Measured — the same function, same input, 6 rounds:**
```
Round 1: 21.66 ms     ← cold, bytecode
Round 2:  3.39 ms
Round 3:  3.17 ms     ← optimized, ~7x faster
Round 6:  3.25 ms
```

**Production meaning:**
- **Benchmarks lie without warm-up.** Measuring the first iteration is worthless.
- **The first requests after a deploy are slower** — fresh process = cold V8.
  A new instance should not be given full traffic instantly.
- That small latency spike on the deploy graph is normal, and now explained.

### Heap and its hard limit
```bash
node -p "require('node:v8').getHeapStatistics().heap_size_limit"
```
| config | limit |
|---|---|
| default (this machine) | **4144 MB** |
| `--max-old-space-size=256` | 304 MB |
| `--max-old-space-size=128` | 176 MB |

(The reported limit exceeds the flag because it includes the young generation.)

### Heap OOM is fatal, not catchable
Filling the heap **inside a `try/catch`**:
```
<--- Last few GCs --->
[58958] 177 ms: Mark-Compact 255.8 (266.7) -> 255.1 (266.7) MB ...
FATAL ERROR: Reached heap limit — JavaScript heap out of memory
```
The `catch` never ran; the line after it never printed. **The process just died.**

> **Rule:** heap exhaustion is **not** a JS exception. It cannot be caught,
> handled, or recovered from. This is why a slow leak is so dangerous — no
> warning, then instant death, taking every in-flight request with it.

### Garbage collection
Generational, based on the fact that **most objects die young** (objects made in
a request handler are garbage once the response is sent):
- **Young generation** — **Scavenge**: frequent, cheap, promotes survivors
- **Old generation** — **Mark-Compact**: rare, **expensive** (seen in the OOM output)

> **GC is stop-the-world.** During a major GC, *your JavaScript stops.* So high
> memory use is not only a memory problem — it is a **latency** problem. More
> garbage → more pauses → worse p99. (Measured in Phase 8.)

### The classic production mistake: container limit ≠ heap limit
```
Kubernetes memory limit: 512Mi      ← kills the process here
Node heap limit:         4144 MB    ← Node thinks it has 4 GB
```
Node grows past the container limit → **`SIGKILL` → `OOMKilled`**. No JS error,
no stack trace, no logs — just a restarting pod.

**Fix:** keep the heap limit **below** the container limit (Node's total RSS is
larger than the heap: buffers, stacks, native memory):
```bash
node --max-old-space-size=384 app.js                      # for a 512Mi container
node --max-old-space-size=768 --heapsnapshot-near-heap-limit=2 app.js
```
The second flag **writes a heap snapshot automatically** as the limit nears —
turning an invisible kill into something diagnosable.

> **Order of operations:** setting the limit makes the failure **visible**;
> finding the leak is the **actual fix**. Do both, in that order.
> Raising the limit alone just postpones the crash.

**Gotchas:** "JS is slow because it's interpreted" ✗ (slowness is usually
algorithms or I/O) · benchmarking without warm-up ✗ · trying to `try/catch` an
OOM ✗ · `--max-old-space-size` is a **ceiling**, not an allocation ✗

### CPU-bound JS blocks *everything* (not just requests)
One handler doing 2 seconds of pure CPU, with a 100 ms health-check interval
running alongside:
```
[health] tick 1 @ 102ms
[health] tick 2 @ 203ms
[request] PDF start @ 252ms
[request] PDF ready @ 2252ms     ← 2 full seconds of nothing
[health] tick 3 @ 2252ms
Total ticks: 10                   ← should have been 20
```
Missed ticks are **lost forever** — Node does not replay them.

So blocking does not only delay other requests. It silently kills:
- `/health` → the orchestrator concludes the service is dead and **restarts a
  merely busy pod**
- every timer, retry, keep-alive
- metrics collection (gaps in the graphs)

**Two independent failures when 20 such requests arrive together:**
1. **Serialization** — they queue, they do not parallelise. The last one waits ~40s.
2. **Memory** — 20 × 50 MB ≈ 1 GB resident at once (queued request data is held
   in memory while it waits) → heap limit → fatal OOM.

And they **feed each other**: slower requests → longer queue → more memory →
more GC → GC pauses the thread → slower still. This is a **death spiral**, and
it is how real outages actually unfold.

**Correct shape:** CPU work does not belong on the main thread.
`worker_threads` (Phase 3), or better — enqueue it, let a separate worker
process do it, return `202 Accepted` (Phase 6 / Project 5) — plus a
**concurrency limit** so 20 never run at once.

### V8 — still to cover
_Hidden classes, inline caches, monomorphism, deopt in detail, heap snapshots,
CPU profiling: Phase 8._

### libuv
_pending — Lesson 1.4. So far: provides the event loop, the thread pool, and
OS-level async I/O. Written originally for Node. Also owns the **active handle
counter** that decides when the process exits (see "Why a Node process stays
alive")._

### Event Loop
_pending_

### process & globals
_pending_

## Modules
### CommonJS
_pending_

### ES Modules
_pending_

### Resolution & interop
**Early finding (Lesson 1.1 exercise, Node 22.21.1):**

Node decides CJS vs ESM for each file **without reading the code**, using:
1. the file extension (`.mjs` = ESM, `.cjs` = CJS), then
2. the `type` field of the nearest `package.json`.

Only if neither gives a signal does **automatic module syntax detection**
(default since Node **22.7**) kick in: Node tries CJS, hits the syntax error,
and silently re-runs the file as ESM.

So `import` + top-level `await` in a bare `.js` file **works** in an empty
folder, but the same file with `{"type":"commonjs"}` nearby fails:
```
SyntaxError: Cannot use import statement outside a module
```
Real projects always have a `package.json`, so this error is common in practice.

**`require` exists only in CommonJS:**
| context | `typeof require` |
|---|---|
| `.js` with `{"type":"module"}` | `undefined` |
| `.js` with `{"type":"commonjs"}` / `node -p` | `function` |

`node -p` runs in a CommonJS context — which is why `typeof require` printed
`function` in the exercise.
_Full treatment: Lessons 1.10–1.12._

## npm & Dependencies
_pending_

---

# Async Programming
## Callbacks
_pending_

## Promises
_pending_

## Microtasks & scheduling
_pending_

## async/await
_pending_

## Error propagation
_pending_

## Concurrency patterns
_pending_

## Cancellation
_pending_

---

# Core APIs
## Buffers
_pending_

## Streams
_pending_

## File system
_pending_

## Crypto
_pending_

## Processes & threads
_pending_

---

# HTTP & APIs
_pending_

# PostgreSQL
_pending_

# Production Engineering
_pending_

# Testing
_pending_

# Advanced Node
_pending_

# NestJS
_pending_

# Architecture
_pending_

---

## Things I Previously Misunderstood
_Corrections live here so they stick. See also `mistakes.md`._
_(none yet)_
