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

---

## libuv
**Lesson 1.4 · 2026-10-24/25**

V8 runs JavaScript but cannot touch the outside world. **libuv** is the C library
that talks to the OS for Node. It provides the **event loop**, async network I/O,
async file I/O, DNS, child processes, signals, timers, the **thread pool**, and
the **active-handle counter** that decides when the process exits (see "Why a
Node process stays alive").

It also hides a nasty portability problem — every OS does async I/O differently:

| OS | Mechanism |
|---|---|
| Linux | `epoll` |
| macOS / BSD | `kqueue` |
| Windows | **IOCP** (a fundamentally different design) |

One libuv API over all three. This is why code written on macOS runs in a Linux
container unchanged.

### Where concurrency actually comes from (answers assessment A1)
The common wrong answer: *"Node secretly uses lots of threads."* **It does not.**

Old server model: one thread per request, and the thread **sits blocked** waiting
for the DB. 1000 requests = 1000 threads ≈ 1 GB of stacks, mostly doing nothing.

Node's model:
```
request arrives → hand the socket to the OS: "tell me when this is readable"
                → move on immediately, take the next request
                → OS: "fd 847 has data"
                → run that socket's callback
```

**Nobody waited.** The kernel's `epoll`/`kqueue` can watch thousands of sockets
in a single call and report which are ready. **That bookkeeping is the kernel's
job, not a thread's.**

> **Mental model:** old model = one waiter standing beside each customer until
> their food is ready. Node = **one waiter plus an order board**: take every
> order, pin it up, deliver whatever is ready. The waiter never stands still.
>
> *Simple words mein: concurrency threads se nahi aati — "intezaar mat karo" se
> aati hai.*

**Measured** — 50 concurrent requests against a local server with a 200 ms delay
each, on **one** JS thread:
```
First done  @ 244 ms
Last done   @ 251 ms
Total       @ 251 ms      (sequential would be ~10 s)
```

### The two completely separate paths
```
┌──────────────────────────────────────────────┐
│  Your JavaScript — ONE thread, always        │
├──────────────────────────────────────────────┤
│  libuv                                       │
│   Network I/O ──→ OS (epoll/kqueue/IOCP)     │  ← NO threads, scales to 1000s
│   File I/O    ──→ ┌──────────────┐           │
│   dns.lookup  ──→ │ Thread Pool  │           │  ← default only 4
│   zlib        ──→ │  4 threads   │           │
│   some crypto ──→ └──────────────┘           │
└──────────────────────────────────────────────┘
```
Network has a good async OS API. File I/O historically does not; `getaddrinfo`
(DNS) is blocking; some crypto is pure CPU. Those go to a **thread pool**.

| Operation | Path | Limit |
|---|---|---|
| TCP/HTTP server & client, sockets | **OS event notification** | thousands |
| all `fs` operations | **thread pool** | **4** |
| `dns.lookup()` (so also `fetch`/`pg` connecting by hostname) | **thread pool** | **4** |
| `zlib` (gzip/brotli) | **thread pool** | **4** |
| `crypto.pbkdf2`, `scrypt`, `randomBytes`, bcrypt | **thread pool** | **4** |
| `dns.resolve()` (c-ares) | OS/network | thousands |
| your plain JS (loops, `JSON.parse`) | **main thread** | 1 |

### Measured: the thread pool wall
8 concurrent `pbkdf2` calls (thread pool work):
```
default pool (4)              UV_THREADPOOL_SIZE=8
Task 1 @  88ms                Task 7 @ 104ms
Task 3 @  90ms                Task 8 @ 105ms
Task 2 @  90ms                Task 3 @ 105ms
Task 4 @ 101ms  ← first 4     Task 2 @ 109ms
Task 7 @ 184ms                Task 4 @ 117ms
Task 6 @ 188ms                Task 1 @ 117ms
Task 5 @ 189ms                Task 5 @ 124ms
Task 8 @ 197ms  ← next 4      Task 6 @ 126ms  ← all 8, one batch
```
**Same code, half the time**, from one env var. Meanwhile the 50-request network
test was unaffected by the pool size — **proof the two paths are separate.**

**Important:** the thread pool does **not** make your JavaScript parallel. The
pool runs C++ work (reading a file, hashing); the **callback comes back to the
single JS thread**.

> **"Node is single-threaded" — the full truth:** *Node's JavaScript* is
> single-threaded, always. *Node the process* is not: main thread + 4 pool
> threads + V8 background threads (GC, compilation) ≈ 10 threads you never asked
> for.

### Tuning
```bash
UV_THREADPOOL_SIZE=16 node app.js
```
**Must be set before the process starts** — the pool is created on first use.
`process.env.UV_THREADPOOL_SIZE = 16` inside the code **does nothing**.
Don't inflate it blindly: those threads compete for the same cores
(8 on this machine), so 64 threads makes everything slower.

### How this bites in production
1. **Hidden login capacity.** `bcrypt`/`pbkdf2` use the pool → **at most 4
   password verifications at a time**, regardless of core count. 100 concurrent
   logins → 96 queued, and **CPU graphs look idle.**
2. **The DNS trap.** `dns.lookup()` uses the pool. A service making many outbound
   HTTP calls resolves hostnames constantly → **pool saturates** → now `fs` and
   `zlib` stall too. Looks like "the network is slow"; it is your own thread pool.
3. **Pool saturation is invisible in normal metrics** — CPU idle, memory fine, DB
   fast, requests still slow. Knowing the pool *exists* is the whole diagnosis.

**Gotchas:** "Node is multi-threaded internally, that's why it's fast" ✗
(network concurrency is the **kernel**) · "the pool parallelises my JS" ✗ ·
setting `UV_THREADPOOL_SIZE` in code ✗ · raising it without regard to core
count ✗ · trying to offload CPU-bound **JS** to the pool ✗ (that needs
`worker_threads`, Phase 3).

### A socket is a kernel object — Node only holds a number
*(clarified 2026-10-25)*

**There is no "Node socket" separate from the "kernel socket". There is one
socket, and it lives in the kernel.** Node holds a **file descriptor** — an
integer:
```
[server] listening. socket ka file descriptor = 12
```
The JS `server` object is a thin wrapper around `12`. All real socket state —
buffers, TCP state machine, connection queue — is **kernel memory**.
`epoll`/`kqueue` watch the same fds, so Node and the kernel are looking at **one
object from two sides**.

> **Mental model:** the fd is a **cloakroom token**. The coat is with the kernel;
> Node holds the token. Asking "what happened on fd 12?" asks about *that one*
> coat.

`listen(8888)` is three kernel calls:
```
socket()   → kernel creates the socket, returns fd 12
bind(12)   → "this socket owns port 8888"
listen(12) → "accept connections on it, queue them"
```

### One port, many connections — there are TWO kinds of socket
*(2026-10-25)*

A single port handles thousands of connections. The mechanism: **the listening
socket is not the connection socket.**

Measured — 4 clients against one port:
```
LISTENING socket: fd=12  port=9997
(data never flows on this socket — it only "listens" for connections)

  new CONNECTION socket: fd=15 | client: 127.0.0.1:52443 | server: 127.0.0.1:9997
  new CONNECTION socket: fd=16 | client: 127.0.0.1:52444 | server: 127.0.0.1:9997
  new CONNECTION socket: fd=15 | client: 127.0.0.1:52445 | server: 127.0.0.1:9997
  new CONNECTION socket: fd=14 | client: 127.0.0.1:52446 | server: 127.0.0.1:9997
```

1. **The listening socket (`fd 12`)** sits on port 9997 and does exactly one job:
   report *"someone wants to connect."* **Your data never touches it.**
2. **Each connection gets its own brand-new socket and fd** (15, 16, 14...).
   Data flows there. (fd 15 reappears because an earlier connection closed and
   the kernel recycles the number.)

**How the kernel tells connections apart — the 4-tuple:**
```
(client IP, client port, server IP, server port)
 127.0.0.1   52443      127.0.0.1   9997     ← connection #1
 127.0.0.1   52444      127.0.0.1   9997     ← connection #2
```
The server half is identical for all of them; **the client's port differs every
time**, so each connection is uniquely identifiable. That is why one port can
hold hundreds of thousands of connections.

**So `accept()` is the step that was missing from my model:**
```
fd 12 readable  →  "a connection is waiting"
                →  Node: accept(12)  →  kernel returns a NEW fd 15
                →  Node registers fd 15: "tell me when data arrives on it"
                →  data arrives  →  read(15) → llhttp → my handler
```

> **Precision:** on a listening socket Node asks to be told about a **connection**,
> not a *request*. Requests only exist after `accept()`, and only once bytes have
> been read and parsed.

### What the kernel does vs what Node does
Proof — the server's JS thread was **frozen for 3 seconds** while a client
connected and sent a request:
```
[server @3ms]    listening, fd = 12
[server @3ms]    JS thread JAMMED for 3s...
  [client @802ms] connect + request sent (server's JS is frozen)
[server @3004ms] JS thread free
[server @3006ms] JS handler ran — only NOW did I see the request
  [client @2799ms] got: 200
```
No `ECONNREFUSED`. The connection was established and the request buffered
**with zero JavaScript running.**

| Kernel's job | Node's job (userspace) |
|---|---|
| TCP handshake (SYN/SYN-ACK/ACK) | `read(fd)` from the receive buffer |
| **Accept queue / backlog** | `llhttp` parses bytes → request object |
| Packets → ordered byte stream, dedup | **TLS decrypt via OpenSSL** (*not* kernel) |
| **Receive buffer** (data waits here) | your JS handler |
| Send buffer, retransmits, ACKs | `write(fd)` into the send buffer |
| Flow + congestion control (window) | |
| FIN/FIN-ACK, `TIME_WAIT` | |
| TCP keepalive | |

> **The boundary:** the kernel handles **bytes**; Node handles **meaning**. The
> kernel has no idea what HTTP is.

**Consequence:** a blocked server does not look *down*, it looks *slow*. The
kernel happily accepts connections, so monitoring sees **timeouts, not
connection-refused** — the most confusing failure mode to debug.

### libuv holds the callback — the kernel never does
*(correction, 2026-10-25)*

**I believed:** *"Node tells the OS kernel about the async operation and gives it
the callback; when the kernel finishes, it hands the callback to the main
thread."*

**Wrong — the kernel has no idea JavaScript exists.** Its entire vocabulary is:
*"fd 15 is readable"*, *"fd 16 is writable"*, *"this operation completed."*
Numbers and statuses. Nothing else.

**The callback lives in libuv:**
```
Node:   "tell me when fd 15 is readable"   → kernel   (registered in epoll/kqueue)
        and stores the callback in libuv's own tables

kernel: "fd 15 ready"                       → libuv    (that is all it says)

libuv:  looks up its table → finds fd 15's callback
        → the event loop runs it on the main thread
```

> **Rule:** the kernel reports **readiness**. **libuv** remembers which
> JavaScript that readiness belongs to. The kernel never calls into JS.

### Completion time ≠ callback run time
A second thing hidden in the same correction: **a callback does not run the
moment its work finishes.** Completion only makes it *eligible*. It actually runs
when **(a)** the main thread is free and **(b)** the event loop reaches the right
phase.

So the real sequence is: *work completes → callback is queued → event loop runs
it later.* Where "later" can be microseconds or (if the thread is blocked)
seconds. **Deciding that order is the event loop's entire job — Lesson 1.5.**

### Queued work is delayed, not lost
10 clients request during a 2-second block:
```
[server @2002ms] JS thread FREE
[server @2005ms] handler #1  (/req-1)
[server @2009ms] handler #2  (/req-2)
...
[server @2012ms] handler #10 (/req-10)
```
**All 10 arrive**, and all 10 run within ~7 ms of the thread freeing.

> **"One thread" ≠ "one request".** One at a time (✅ true: #1 completes, then
> #2 — never parallel) is not the same as only one (❌ false: all 10 are
> delivered). One thread limits **how much runs at once**, not **how much can be
> held**.

So a 2-second block means **2 seconds of added latency for everyone queued**, not
lost data — and they all land together (**thundering herd**), which is exactly
the latency-spike shape seen on dashboards after a block.

**The real limit:** the accept queue is finite (Node's default backlog **511**):
```js
server.listen(8888, "0.0.0.0", 511);   // third arg = backlog
```
Block long enough and the queue fills — then the **kernel** starts dropping new
connections, and *that* is where real loss begins.

### The real ceiling is file descriptors, not ports
*(2026-10-25)*

A server holding **10,000 concurrent connections** on port 8080 has
**10,001 socket fds open**: 10,000 connection sockets + 1 listening socket.

```bash
ulimit -n        # this machine: 1048576 (containers are often 1024)
```

Hit the limit and Node reports:
```
Error: EMFILE: too many open files
```

Two things that make this nastier than it looks:

**1. You crash before reaching the number.** With `ulimit -n 1024` the failure
comes around ~1015 connections, because fds are not only sockets: stdin/stdout/
stderr (0, 1, 2), the listening socket, every DB pool connection, open log files
and config files all consume fds from the same budget. **The usable ceiling is
always lower than the limit**, by an amount specific to your process.

**2. The server does not go down — it goes half-dead.**
- the connections already established keep working perfectly
- new connections are refused
- CPU normal, memory normal, DB fast, and a health check riding an existing
  connection **still passes**

Monitoring says "healthy", users say "the site won't load". A **partial failure**
like this is harder to diagnose than an outright crash.

> **The same structural lesson as the heap — now seen twice:**
>
> | | Heap (`--max-old-space-size`) | File descriptors (`ulimit -n`) |
> |---|---|---|
> | Set / raise the limit | makes the failure **visible** | buys immediate relief |
> | Find the leak | **the actual fix** | **the actual fix** |
>
> Raising a limit postpones a crash; it never cures one. If sockets or DB
> connections are leaking, `EMFILE` will come back. Do both, in that order.

### The complete request lifecycle — my model, corrected
*(I wrote this out myself on 2026-10-25; 6 of 8 points were right. Marked below,
then the corrected version in full.)*

**Startup**
1. ✅ `node app.js` → a process starts
2. ✅ the kernel creates a socket and gives Node its fd; Node says "tell me when
   something arrives" — *sharpening: on a listening socket that means a
   **connection**, not a request*
3. ✅ the kernel watches the port

**One request**
1. 🟡 "the kernel tells Node, and Node runs my JS on the main thread" — true, but
   **two steps were missing**: `accept()` (new fd), then `read()` + `llhttp`
   parsing, *before* any JS runs
2. ❌ "for a file read or any async operation, Node tells the **kernel** and gives
   it the callback" — **two errors**: the callback goes to **libuv**, not the
   kernel; and `fs` does **not** go to the kernel at all — it goes to the
   **thread pool**
3. ❌ "when the kernel finishes, it hands the callback to the main thread" — the
   kernel only reports readiness; **libuv** finds the callback and the **event
   loop** decides when it runs

**Many requests**
1. ✅ if the thread is blocked, requests queue in the kernel
2. ✅ if the thread is free, **all** of them are delivered and run one after
   another, very fast — *(this corrected my earlier M-004 myself)*

---

**The corrected flow, end to end:**

```
STARTUP
  node app.js                        → OS creates the process
  socket() / bind() / listen()       → kernel makes the listening socket, returns fd 12
  register fd 12 with epoll/kqueue   → "tell me when a connection waits"

A CONNECTION ARRIVES
  kernel completes the TCP handshake            ← no JavaScript involved
  kernel queues it in the accept backlog (511)
  kernel: "fd 12 readable"            → libuv
  Node: accept(12)                    → kernel returns a NEW fd 15
  Node registers fd 15                → "tell me when data arrives"

A REQUEST ARRIVES ON THAT CONNECTION
  kernel receives packets, orders them, buffers the bytes
  kernel: "fd 15 readable"            → libuv
  Node: read(15)                      → pull bytes out of the kernel buffer
  llhttp parses them                  → method, path, headers        (C++, main thread)
  [TLS? OpenSSL decrypts here        → userspace, NOT the kernel]
  MY HANDLER RUNS                                                    (main thread)

MY HANDLER STARTS ASYNC WORK — and the path depends on what it is
  DB query / API call / sending the response
      → register the socket with the kernel, store the callback in libuv
      → main thread is FREE                           ← no thread used at all
  fs / dns.lookup / zlib / crypto
      → hand it to the THREAD POOL (4 threads), store the callback in libuv
      → a pool thread does an ordinary BLOCKING read
      → main thread is FREE                           ← a thread *was* used
      → if all 4 are busy, the work does not even START

THE WORK FINISHES
  kernel or pool thread → "done"      → libuv
  libuv looks up the callback for it
  the callback is QUEUED — it does not run yet
  the event loop runs it when the main thread is free and the phase is right
  → back into my JavaScript

RESPONDING
  res.end(...)   → write(15) into the kernel send buffer
  the kernel handles transmission, ACKs and retransmits from here on
```

**The one sentence that holds it together:** *the main thread never waits — it
registers the work, hands the callback to libuv, and moves on. Whether a thread
was consumed depends entirely on which of the two paths the work took.*

---

### CPU-bound vs I/O-bound work *inside* the thread pool
**Exercise 1.4 · 2026-10-26**

The pool holds two very different kinds of work, and they scale differently.

**CPU-bound in the pool** (`pbkdf2`, `bcrypt`, `scrypt`, `zlib`): measured with
8 × `pbkdf2(300k iterations)` on an **8-core** machine:
```
pool=1   431ms
pool=2   242ms
pool=4   126ms
pool=8    97ms     ← flatlines at core count
pool=16   96ms
pool=32   97ms
```
Past `cores`, extra threads just time-share the same CPUs — same work, same
time, plus context-switch overhead.

**I/O-bound in the pool** (`fs`, `dns.lookup`): these *wait* rather than compute,
so a pool larger than the core count still helps.

> **Rule:** raising `UV_THREADPOOL_SIZE` helps work that **waits** (disk, DNS).
> Work that **burns CPU** is capped by **cores**, not by pool size.
> *Simple words mein: CPU bottleneck hai toh zyada threads se kuch nahi hota —
> zyada machines chahiye, ya kam kaam.*

### A bottleneck you cannot see is not a bottleneck you don't have
8 × `fs.readFile` on a **small** file, pool=4 vs pool=1:
```
pool=4 → all 8 done @ 1ms
pool=1 → all 8 done @ 1ms      ← no difference at all
```
The batching mechanism is fully present; each read just takes ~0.1ms, so 8
sequential reads still finish in 1ms. Same test with a **50 MB** file × 16:
```
pool=1  207ms
pool=2   61ms
pool=4   37ms
pool=8   33ms
```
> **"No difference" usually means the test was too small**, not that the
> mechanism is absent. The most common mistake in performance testing is a load
> too light to activate the bottleneck.

### Measuring correctly comes before measuring at all
A one-line instrumentation bug — resetting the baseline inside the callback
(`let t0` … `t0 = Date.now()` in the handler) — turned clean batch timings into
noise:
```
buggy: 60, 2, 0, 0, 61, 3, 0, 2          ← looks random, batches invisible
fixed: 62, 63, 64, 64, 122, 125, 126, 127 ← two obvious batches
```
Same program, same runtime; only the measurement differed. The buggy version
reports "time since the previous callback", not "time since start".

> **Ask first: is the thing I am measuring the thing I think I am measuring?**
> Wrong timestamps, wrong metric windows, wrong dashboard aggregation — this is
> a daily production failure mode, not a beginner mistake.

`const` would have made this bug impossible. Default to `const`; it prevents
errors, it is not a style preference.

### The DNS trap (worked example)
Symptom set: CPU 20%, memory fine, the external payment API reports 50ms on its
own dashboard, but our calls take 3s — **and an unrelated file-upload feature is
also slow.**

The unrelated feature slowing down is the decisive clue: payment calls and file
uploads share exactly one resource — **the thread pool**. Each outbound call does
a `dns.lookup()` (thread pool); under load those saturate all 4 threads, and
`fs` work then starves behind them.

Fixes, in order of leverage:
1. **Keep-alive agent** — by default each outbound request makes a new
   connection → new DNS + TCP + TLS. Reusing connections removes most lookups:
   ```js
   import { Agent } from "undici";
   const agent = new Agent({ keepAliveTimeout: 60_000, connections: 50 });
   ```
2. **Cache DNS** — Node does **not** cache `dns.lookup` results (surprising).
   Use something like `cacheable-lookup`.
3. **Raise `UV_THREADPOOL_SIZE`** — valid here, because DNS *waits*.

### Capacity math for a hashing endpoint
`bcrypt` at ~100ms per hash, 8 cores:
```
default pool (4):  4 × (1/0.1s) =  40 logins/sec
cores ceiling:     8 × (1/0.1s) =  80 logins/sec   ← hard limit
required:                          200 logins/sec
```
Raising the pool gets 40 → 80 and **no further**. Options that actually work:

| Approach | What it buys | Cost / caveat |
|---|---|---|
| Lower bcrypt cost factor | cost 12→10 = 4× faster (≈320/s) | **cost *is* the security**; decide with the security team, not for perf alone |
| **Horizontal scaling** | 3–4 machines → 200/s comfortably | the real production answer; works because login is **stateless** |
| Hash less often | token/session after one verify; per-request token checks are ~1000× cheaper | if clients send passwords per request, that is a **design bug**, not a capacity problem |
| Rate limiting (per account + per IP) | stops brute force **and** protects CPU | a bcrypt endpoint is a **CPU DoS vector** — 1000 wrong passwords burn your cores |
| Bulkhead (separate auth service) | a login spike stops taking down the whole API | adds no capacity; limits blast radius |

**Does not work:** `worker_threads`. Same 8 cores. The shortage is **CPU**, not
threads. (This is the most common wrong answer when worker threads come up —
Phase 3.)

## Event Loop
_pending — Lesson 1.5. The piece that decides **in what order** the ready work
from libuv actually runs._

## process & globals
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

- **"A blocked server receives only one of the queued requests."**
  I reasoned: one thread → one request. Wrong — **all** queued requests are
  delivered; they just run one at a time. One thread caps *concurrency*, not
  *how much work can be held*. 10 queued requests all ran within 7 ms of the
  thread freeing. Block = **delay for everyone**, not data loss (loss only
  starts when the 511-deep accept queue overflows).
- **"The kernel's socket and Node's socket are two different things."**
  There is **one** socket, in the kernel. Node holds only an **fd** (an
  integer). Token vs coat.
- **"Node gives the callback to the OS kernel, and the kernel runs it."**
  The kernel knows nothing about JavaScript — it only reports *"fd N is ready"*.
  **libuv** stores the callback and the **event loop** decides when it runs.
  Also: a callback does not run when the work *completes*, only when the thread
  is free and the loop reaches the right phase.
- **"Any async operation is handed to the OS kernel."**
  Only **network** I/O works that way. `fs`, `dns.lookup`, `zlib` and some
  `crypto` go to the **4-thread pool**, where an ordinary **blocking** call is
  made on a pool thread. It feels async because *my* thread isn't blocked — but
  a thread somewhere was, which is exactly why the pool saturates and the kernel
  path never does.
- **"A blocked server loses the requests that arrive during the block."**
  They are delayed, not lost — all of them land at once when the thread frees
  (thundering herd). Real loss starts only when the 511-deep accept queue
  overflows, or when fds run out (`EMFILE`).
