# Learning Progress

_Last updated: 2026-10-20 (Exercise 1.1 evaluated)_

## Current Phase
**Phase 1 — Node.js Foundations** → Lesson 1.1

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

## In Progress
- **Lesson 1.1 — What Node.js actually is** — exercise attempted 2026-10-20.
  Tasks done, **review questions skipped**; re-issued in simplified form (R1–R3).
  Not yet *Practiced* — waiting on comprehension answers.

## Needs Review
_(nothing yet)_

---

## Phase Tracker

| Phase | Title | State |
|-------|-------|-------|
| 1 | Node.js Foundations | **in progress** (1/15 lessons) |
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
| 1.1 What Node.js is (runtime anatomy) | Introduced | tasks done; review Qs re-issued simplified |
| 1.1a Globals: window/document/process/fetch/require | **Practiced** | 5/5 correct in Task 2 |
| 1.1b The process & PID | Introduced | gap found in Task 3, taught 2026-10-20 |
| 1.1c Why a process stays alive (handle refcount) | Introduced | partial answer in Task 5; M-002 |
| 1.1d CJS vs ESM detection | Introduced | surfaced early by Task 4; full lesson 1.10–1.12 |
| 1.2 Node vs browser JS | not started | |
| 1.3 V8 | not started | |
| 1.4 libuv | not started | |
| 1.5 Event loop part 1 | not started | |
| 1.6–1.15 | not started | see roadmap |

---

## Exercises Completed
_(none yet)_

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

1. **Async scheduling / event loop** (B1) — highest priority, Phase 1–2
2. **Sequential vs parallel async** (B2) — most common real perf bug
3. **async inside array callbacks** (B3) — *active misconception*, Phase 2
4. **DB transactions & connection pooling** (C1) — Phase 5
5. **Streams & memory** (C2) — Phase 3
6. **Idempotency / race conditions** (D1, D2) — Phase 5–6
7. **HTTP semantics & auth** (E1, E2) — Phase 4
8. **Modules & npm** (F1, F2) — Phase 1
9. **TypeScript** — Phase 2.5

## Revisit Queue (spaced repetition)
_Items pulled into later lessons to test retention._
- **Handle refcount → why servers stay alive** — re-ask during Lesson 1.5
  (event loop) and again in Phase 6 (graceful shutdown)
- **PID / one process = one JS thread** — re-ask when `cluster` arrives (Phase 3)
- **`require` undefined in ESM** — re-ask in Lesson 1.11

## Teaching Observations
- 2026-10-20: answers are very terse; skipped the written comprehension section
  entirely. Observation tasks get done, explanation tasks get avoided.
  **Adjustment:** fewer questions, more guided (fill-in-the-blank), and state
  explicitly that written answers are the gate to the next lesson. Watch whether
  this is reluctance to write or genuine difficulty — the distinction changes
  the teaching speed.

## Misconceptions Caught
- **M-001** — "`async` inside `forEach` makes it slower." `open`, Phase 2.
- **M-002** — "Process alive because interval not cleared." `corrected`
  (symptom vs mechanism: libuv handle refcount).
- **M-003** — *Mentor error*: claimed `.js` + `import` always errors. Wrong on
  Node 22.7+ without a `package.json`. Student was right. Verify before claiming.

---

## Milestones
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
1. Answer simplified review questions R1–R3 (comprehension gate for 1.1)
2. Lesson 1.2 — Node vs browser JavaScript
3. Lesson 1.3/1.4 — V8 and libuv properly (answers assessment A2)
4. Lesson 1.5 — Event loop part 1 (answers A1 and A3)
