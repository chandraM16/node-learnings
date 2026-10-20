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

### V8
_pending — Lesson 1.3. So far: compiles and runs JS, owns the heap and GC;
cannot do I/O._

### libuv
_pending — Lesson 1.4. So far: provides the event loop, the thread pool, and
OS-level async I/O. Written originally for Node._

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
