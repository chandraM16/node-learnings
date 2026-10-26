# Learning Progress

_Last updated: 2026-10-26 (Exercise 1.4 evaluated; M-009, M-010 logged; mistakes.md renumbered after a cross-session collision)_

## Current Phase
**Phase 1 — Node.js Foundations** → next: Lesson 1.5 (Event loop, part 1)

### Baseline (assessment 2026-10-19)
Answered honestly; 11 of 12 "pta nahi". Confirmed **genuine zero** on:
runtime model, V8/libuv, event loop, async scheduling, production debugging,
DB transactions, concurrency control, HTTP semantics, auth tradeoffs, modules,
npm/tooling. One partial answer (B3) showed a misconception — see `mistakes.md`.

**This is a good baseline**, not a bad one: nothing incorrect to unteach.
Decision: start at Phase 1 Lesson 1, skip nothing. JS/React fluency assumed.

Language: Hinglish. TypeScript added as Phase 2.5.

---

## Status Legend
- **Introduced** — taught, not yet exercised
- **Practiced** — exercises completed successfully
- **Mastered** — can explain unprompted and apply independently; survived a
  later spaced-repetition check

---

## Completed
- Diagnostic assessment (2026-10-19) — baseline established
- **Lesson 1.1 — What Node.js is** (runtime anatomy, process/PID, handle refcount)
- **Lesson 1.2 — Node vs browser JavaScript** (trust model, CORS, blast radius)
- **Lesson 1.3 — V8** (tiered JIT, heap limits, fatal OOM, GC, CPU blocking)
- **Lesson 1.4 — libuv** (two I/O paths, thread pool, kernel/userspace boundary,
  sockets as fds, one port ↔ many connections) — taught 2026-10-24/25, partly in
  a forked session

## In Progress
- **Lesson 1.5 — Event loop, part 1** — not started. Teed up three times now;
  the open question is: *completion ≠ callback run time, so in what **order**
  does ready work actually run?*
- **Exercise 1.4 Tasks 1–4 + warm-ups W1/W2 remain unanswered** — thread-pool
  sizing, the `fs.readFile` batching prediction, the DNS-trap debugging task,
  and the bcrypt capacity design task. Tasks 3–4 test exactly what he has now
  shown he understands, so they are worth collecting rather than dropping.

## Needs Review
_(nothing yet)_

---

## Phase Tracker

| Phase | Title | State |
|-------|-------|-------|
| 1 | Node.js Foundations | **in progress** (4/15 lessons taught) |
| 2 | Asynchronous Node.js | not started |
| 2.5 | TypeScript for Node Backend | not started |
| 3 | Node.js Core APIs | not started |
| 4 | HTTP & Backend (no framework) | not started |
| 5 | PostgreSQL + Node.js | not started |
| 6 | Production Node.js | not started |
| 7 | Testing | not started |
| 8 | Advanced Node.js | not started |
| 9 | NestJS from First Principles | not started |
| 10 | Production NestJS & Architecture | not started |

---

## Topic Detail
_Populated as topics are taught. Format: topic — state — note._

### Phase 1 — Node.js Foundations
| Topic | State | Note |
|-------|-------|------|
| 1.1 What Node.js is (runtime anatomy) | **Practiced** | R1–R5 answered 2026-10-20, 4/5 solid |
| 1.1a Globals: window/document/process/fetch/require | **Practiced** | 5/5 in Task 2 |
| 1.1b The process & PID | **Practiced** | gap in Task 3, taught, then used correctly in R5 |
| 1.1c Why a process stays alive (handle refcount) | **Mastered** | recalled correctly after a 5-day gap (W1, 2026-10-25), unprompted and in the right vocabulary |
| 1.1d CJS vs ESM detection | Introduced | surfaced early; full lesson 1.10–1.12 |
| 1.2 Node vs browser JS | **Practiced** | 6/6 predictions; CORS + sandbox blast radius taught after |
| 1.2a Trust model (why fs exists in Node, not browser) | **Practiced** | reasoned it independently in Task 3/4 |
| 1.2b CORS as a browser-only rule | Introduced | could not run browser test; **revisit in Phase 4** |
| 1.3 V8 — tiered JIT & warm-up | **Practiced** | measured 8.32x cold/hot ratio himself |
| 1.3a Heap limits & fatal OOM | **Practiced** | strong Task 3 answer, incl. "raising the limit isn't the fix" |
| 1.3b GC (generational, stop-the-world) | Introduced | not yet exercised; Phase 8 depth |
| 1.3c CPU-bound blocking the loop | **Practiced** | W2: correctly derived blocked loop → no health response → orchestrator restarts a healthy pod |
| 1.3d Missed timer ticks are lost, not replayed | Introduced | **M-008** — over-generalized M-004; corrected with measurement |
| 1.4 libuv — role & OS portability (epoll/kqueue/IOCP) | Introduced | |
| 1.4a **Concurrency comes from the kernel, not threads** (A1) | **Practiced** | explained the register-and-move-on model back, unprompted |
| 1.4b Two paths: OS notification vs thread pool | **Practiced** | wrong on 2026-10-25 (collapsed `fs` into "kernel"); **re-tested by Exercise 1.4 Task 3 on 2026-10-26 and applied correctly, unaided** |
| 1.4c Thread pool size 4, saturation, `UV_THREADPOOL_SIZE` | **Practiced** | reproduced the batching himself (after an instrumentation fix) |
| 1.4d "Node is single-threaded" — the full truth | **Practiced** | applied it correctly: "ek ke baad ek execute hogi" |
| 1.4e A socket is a kernel object; Node holds an fd | **Practiced** | M-005 corrected, then used it to reason about fd counts |
| 1.4f Kernel's job vs Node's job | Introduced | missed the `read()`+llhttp step, and **put the callback in the kernel instead of libuv** — corrected |
| 1.4g Queued work is delayed, not lost | **Practiced** | self-corrected M-004 without being re-taught |
| 1.4h One port ↔ many connections (listening vs connection socket, 4-tuple) | **Practiced** | answered 10,001 fds + `EMFILE` correctly |
| 1.4i fd limits, `EMFILE` as a *partial* failure | Introduced | **revisit in Phase 6** |
| 1.4j CPU-bound vs I/O-bound work *inside* the pool | Introduced | **M-009** — swept pool 1→32; gains flatline at core count (8) |
| 1.4k Capacity math (threads, cores, ceiling) | Introduced | got 40 logins/s right; missed the 80/s cores ceiling |
| 1.4l The DNS trap (shared-pool starvation) | **Practiced** | **derived the whole chain unaided** — strongest answer to date |
| 1.4m Measurement hygiene | Introduced | **M-010** — his own baseline bug hid the batches he was measuring |
| 1.5 Event loop part 1 | not started | **next** |
| 1.6–1.15 | not started | see roadmap |

---

## Exercises Completed
| Exercise | Result |
|---|---|
| 1.1 — What Node.js is | Tasks done; review Qs initially skipped, then 4/5 solid on retry |
| 1.2 — Node vs browser | **6/6** predictions correct (predicted before running); Tasks 3–4 reasoned well |
| 1.3 — V8 | Tasks 1–2 correct; **Task 3 strong** (production-grade answer); Task 4 half |
| 1.4 — libuv | **Complete.** First wrote out his entire mental model unprompted (8 points): **6 correct, 2 corrected** (callback ownership, `fs` vs network path), then answered the fd follow-up (10,001 + `EMFILE`) correctly. W1 correct after a 5-day gap; W2 half (M-008). Tasks: 1 half, 2 mechanism-only, **3 full marks**, 4 half (M-009). Found an instrumentation bug in his own file (M-010) |

## Projects

| # | Project | State |
|---|---------|-------|
| 1 | Node.js CLI tool | not started |
| 2 | REST API in plain Node | not started |
| 3 | PostgreSQL-backed API | not started |
| 4 | Auth + authorization system | not started |
| 5 | Background jobs + Redis + queues | not started |
| 6 | Real-time WebSockets app | not started |
| 7 | Production-grade NestJS API | not started |
| 8 | Large modular NestJS backend | not started |
| F | Final production backend | not started |

---

## Weak Areas
Everything is unlearned rather than weak at this point. Priority order derived
from the assessment (these are the gaps that hurt a backend engineer most):

1. **Async scheduling / event loop** (B1) — highest priority, **Lesson 1.5 next**.
   libuv half is now solid; what remains is *ordering*.
2. **Sequential vs parallel async** (B2) — most common real perf bug
3. **async inside array callbacks** (B3) — *active misconception*, Phase 2
4. **DB transactions & connection pooling** (C1) — Phase 5
5. **Streams & memory** (C2) — Phase 3
6. **Idempotency / race conditions** (D1, D2) — Phase 5–6
7. **HTTP semantics & auth** (E1, E2) — Phase 4
8. **Modules & npm** (F1, F2) — Phase 1
9. **TypeScript** — Phase 2.5
10. **Reasoning at the right level of abstraction** — 2026-10-20: on Exercise 1.3
    Task 4 he answered a systems question with V8-internals detail. Knowing
    *which layer a question lives at* is itself a skill; keep asking "yeh sawaal
    kis layer ka hai?"
11. **Memory as a capacity constraint** — got the queuing failure but not the
    concurrent-memory failure, despite nailing the memory question just before.
12. **CPU-bound vs wait-bound bottlenecks** (M-009) — the single most useful
    diagnostic question in backend performance work; recurs at `worker_threads`,
    scaling, and queue sizing.
13. **Measurement hygiene** (M-010) — answers tend to come from theory rather
    than from running the experiment, and a broken instrument went unnoticed.
    Keep asking what he actually observed, with numbers.
12. **Which work goes to the thread pool vs the kernel** — 2026-10-25: assumed
    "any async operation → OS kernel". `fs`/`dns.lookup`/`zlib`/`crypto` go to
    the 4-thread pool instead. Load-bearing for Lesson 1.5; re-test there.

## Revisit Queue (spaced repetition)
_Items pulled into later lessons to test retention._
- **Handle refcount → why servers stay alive** — re-ask during Lesson 1.5
  (event loop) and again in Phase 6 (graceful shutdown)
- **PID / one process = one JS thread** — re-ask when `cluster` arrives (Phase 3)
- **`require` undefined in ESM** — re-ask in Lesson 1.11
- **CPU-bound work blocks timers/health checks, and missed ticks are lost** —
  re-ask in Lesson 1.5 and when `worker_threads` arrives (Phase 3)
- **Container limit vs heap limit (`OOMKilled`)** — re-ask in Phase 6 (Docker)
- **GC is stop-the-world → a latency problem, not just memory** — re-ask Phase 8
- **CORS is a browser rule** — re-ask when we implement CORS in Phase 4
- **Callback lives in libuv, not the kernel; kernel only reports readiness** —
  re-ask in Lesson 1.5
- **`fs` goes to the thread pool, network goes to the kernel** — re-ask when
  streams (Phase 3) and `worker_threads` arrive
- **fd exhaustion / EMFILE as a *partial* failure** — re-ask in Phase 6, next to
  graceful shutdown and connection limits
- **"Raise the limit" vs "fix the leak"** — the same structural lesson now seen
  twice (heap, fds). Re-ask in Phase 8 as a general principle.
- **M-004: queued connections are delayed, not lost** — re-ask in Lesson 1.5,
  and again when backlog/`listen()` comes up in Phase 4
- **M-008: but missed timer ticks ARE lost** — ask these two together, since the
  pair is the real lesson. Re-ask in Lesson 1.6 and Phase 6 (scheduling)
- **`setInterval` must never be used to count time** — re-ask in Lesson 1.6
- **Callbacks are held by libuv, not the kernel (M-006)** — **ask at the start
  of Lesson 1.5**; the whole lesson depends on it
- **Pool work blocks a real thread (M-007)** — re-ask in Phase 3
- **CPU-bound vs wait-bound: more threads only helps the latter (M-009)** —
  re-ask in Phase 3 (`worker_threads`) and Phase 6 (scaling)
- **Verify the instrument before trusting the measurement (M-010)** — re-ask in
  Phase 8 (profiling) and Phase 6 (metrics)
- **Keep-alive agents / DNS caching for outbound calls** — re-ask in Phase 6
- **Thread pool is 4 by default; `fs`/`dns.lookup`/`zlib`/`crypto` share it** —
  re-ask when `worker_threads` arrives (Phase 3) and at bcrypt/auth (Phase 4)
- **Thread pool does not parallelise JavaScript** — re-ask in Phase 3
- **A blocked server looks slow, not down** — re-ask at health checks (Phase 6)

## Teaching Observations
- 2026-10-20 (early): answers very terse; skipped the written comprehension
  section entirely. **Adjustment applied:** fewer, more guided questions, and
  made clear that written answers gate the next lesson.
- 2026-10-20 (later): **the adjustment worked and then some.** He answered the
  original five questions, predicted before running (6/6 on 1.2), and produced a
  genuinely senior-level answer on the `OOMKilled` debugging task — including
  "raising `--max-old-space-size` is not the fix", which most engineers miss.
  **Conclusion: this was reluctance to write, not difficulty.** Difficulty is
  now being increased: denser lessons, less hand-holding, design and debugging
  tasks over observation tasks.
- 2026-10-24/25: **he forked the session to ask his own two questions about
  libuv** rather than waiting to be taught. That is the single best signal so
  far — curiosity-driven, and it produced the sharpest material in the notes
  (sockets as kernel objects, kernel-vs-Node division of labour, queued work
  being delayed rather than lost). **Encourage this.** Two misconceptions
  surfaced and were corrected in the process (M-004, M-005), which is exactly
  what asking questions is supposed to do.
- 2026-10-25: retention after a 5-day gap is **good** — W1 recalled with the
  right mechanism and vocabulary (promoted 1.1c to Mastered). W2's error was an
  *over-generalization of a correctly learned rule*, which is a much better class
  of mistake than a blank. **Teaching note:** when a rule has an exception, teach
  the pair together (queued data vs elapsed time), or the student will correctly
  learn the rule and then mis-apply it.
- 2026-10-26: Exercise 1.4 complete. **Task 3 was genuinely excellent** — he
  chained external API to `dns.lookup` to shared pool to an unrelated feature
  starving, unaided, and saw why the *unrelated* symptom was the decisive clue.
  That is diagnostic reasoning, not recall.
  Weaker pattern, now seen twice: **he reasons from theory and skips the
  measurement.** Task 1's `=16` comparison was skipped, Task 2's answer was
  mechanism-only, and his own test file had a baseline bug that hid the result.
  **Adjustment:** exercises must now report *observed numbers*, and "what I
  expected vs what I saw" is part of every answer.
  Also: he asked me to supply Task 4's remaining approaches instead of
  attempting them. Answered this time (the capacity ceiling needed teaching
  anyway), but next time require one attempt first.
- Housekeeping: a numbering collision happened in `mistakes.md` because the fork
  and this session both appended entries. **Check existing entry numbers before
  appending.**
- Pattern to keep watching: he reasons well about *sharing* and about *memory*
  in isolation, but does not yet combine constraints (memory × concurrency).
  Also tends to drop to the lowest available abstraction level when unsure.
  Both are normal at this stage; both are now in Weak Areas.
- 2026-10-25: **big shift in learning style — he now writes out his own mental
  model unprompted** and asks to be corrected ("agar main galat hoon to batana"),
  and he spontaneously fixed an earlier misconception (M-004) without being
  re-taught. This is the most valuable habit a learner can have; **encourage and
  rely on it.** Prefer "explain the model back to me" over multiple-choice-style
  questions from here on.
- Also notable: he asks *forward* questions ("ek port multiple connections handle
  kar sakta hai?") that land exactly on the next missing piece. Leave room for
  them instead of front-loading everything.
- Caveat: hands-on exercise tasks are still being skipped in favour of
  discussion. Discussion is going well, but Phase 1 ends with a CLI project —
  **keep nudging toward writing code**, per CLAUDE.md rule 12.

## Misconceptions Caught
- **M-001** — "`async` inside `forEach` makes it slower." `open`, Phase 2.
- **M-002** — "Process alive because interval not cleared." `corrected`
  (symptom vs mechanism: libuv handle refcount).
- **M-003** — *Mentor error*: claimed `.js` + `import` always errors. Wrong on
  Node 22.7+ without a `package.json`. Student was right. Verify before claiming.
- **M-004** — "Ek thread hai toh thread free hone pe ek hi request milegi."
  First half right (they wait in the kernel), second half wrong (all 10 get
  delivered). `corrected` — **needs a spaced-rep check in Lesson 1.5**.
- **M-005** — "Kernel ka socket aur Node ka socket alag hote hain." `corrected`.
- **M-006** — "Callback kernel ko dete hain, kernel usko chalata hai."
  `corrected` (from the fork). Callbacks live in **libuv**; the kernel only
  reports readiness on fds. **Load-bearing for Lesson 1.5.**
- **M-007** — "Koi bhi async operation kernel ko jaata hai." `corrected` (fork).
  `fs`/`dns.lookup`/`zlib`/`crypto` take a **pool thread that really blocks**.
- **M-008** — "Missed timer ticks baad mein chal jaayenge." `corrected`.
  **Caused by correctly learning M-004 and over-applying it** — timers are the
  exception: a timer is a deadline, not a queue. (Originally mis-numbered M-006;
  the fork had already used that number.)
- **M-009** — "Pool badhane se CPU-bound kaam bhi tez hoga." `corrected`.
  Pool gains stop at core count. **Re-check in Phase 3** — "slow, add workers"
  is the same reflex there.
- **M-010** — Instrumentation bug (baseline reset inside the callback) hid the
  very behaviour the exercise measured. `corrected`. Companion lesson: "no
  difference observed" is not "mechanism absent" — the test was too small.
- **M-006** — "Callback kernel ko dete hain aur kernel usko chalata hai."
  Callback libuv ke paas hai; kernel sirf readiness batata hai. Also surfaced:
  completion ≠ callback run time. `corrected` — **spaced-rep in Lesson 1.5**.
- **M-007** — "Koi bhi async operation kernel ko jaata hai." `fs`/`dns.lookup`/
  `zlib`/`crypto` thread pool pe jaate hain, jahan ek pool thread **blocking**
  call karti hai. `corrected` — **load-bearing for 1.5, must re-test**.

---

## Milestones
- [x] Can explain what Node.js *is* — runtime vs language vs framework, and why
      `fs` exists on the server but not in the browser (2026-10-20)
- [x] **Can explain where Node's concurrency comes from** — the kernel, not
      threads (assessment A1, answered 2026-10-24/25)
- [ ] Can explain the event loop accurately, including phase ordering
- [ ] Can predict output of non-trivial async code reliably
- [ ] Built a CLI tool with proper signal/exit-code handling
- [ ] Built an HTTP API with zero frameworks
- [ ] Can reason about streams and backpressure
- [ ] Can design a PostgreSQL access layer with correct transaction handling
- [ ] Can diagnose a memory leak from a heap snapshot
- [ ] Can profile and fix a CPU bottleneck
- [ ] Can explain every stage of the NestJS request lifecycle
- [ ] Can justify an architecture choice with tradeoffs, not fashion
- [ ] Shipped the final production-style backend

---

## Next Up
1. **Lesson 1.5 — Event loop, part 1** (phases, microtasks, `nextTick`)
   — open with spaced-rep checks on M-006 (callbacks live in libuv),
   M-004 vs M-008 (queued data is delayed, elapsed time is lost), and M-009
2. Lesson 1.6 — Timers (`setTimeout`/`setInterval`/`setImmediate`, timer drift)
3. Lesson 1.7 — I/O and the thread pool, revisited with the event loop in place
