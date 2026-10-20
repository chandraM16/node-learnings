# Roadmap — Node.js 0 → Production NestJS

Eleven phases (Phase 2.5 added for TypeScript). Each phase lists its lessons
(the unit of teaching) and the
project/milestone that proves it. Order is deliberate: **nothing in NestJS is
taught before the plain-Node concept it abstracts.**

Estimated depth, not a schedule. We move when `progress.md` says Practiced,
not when a date arrives.

---

## Phase 1 — Node.js Foundations
*Goal: know what you are actually running code on.*

1. What Node.js is: runtime vs language vs framework; the process model
2. Node vs browser JS: globals, no DOM, filesystem/network access, module systems
3. V8: compilation pipeline, JIT, heap/stack (conceptual, deepened in Phase 8)
4. libuv: thread pool, OS async I/O, why it exists
5. The event loop part 1: call stack, phases, microtask queue, `nextTick`
6. Timers: `setTimeout`/`setInterval`/`setImmediate`, why timers are inexact
7. I/O and the thread pool: which operations are truly async, which are faked
8. `process`: argv, env, exit codes, signals, stdio, `process.on` events
9. Environment variables & configuration-as-input (first taste of 12-factor)
10. CommonJS: `require`, module wrapper, caching, circular deps
11. ES Modules: `import`, static analysis, live bindings, top-level await
12. Module resolution, dual-package hazard, `require(esm)` in Node 22
13. npm & `package.json`: fields that matter, scripts, exports map
14. Lockfiles, semver, `npm ci` vs `install`, dependency hygiene, supply chain
15. Node CLI & flags: `--watch`, `--env-file`, `--inspect`, `NODE_OPTIONS`

**Milestone — Project 1:** a real CLI tool (not a toy): arg parsing, env config,
exit codes, signal handling, stdout/stderr discipline, packaged as a bin.

**Knowledge check 1:** concurrency without threads; V8 vs libuv vs Node; why
CPU-bound JS blocks everything.

---

## Phase 2 — Asynchronous Node.js (deep)
*Goal: predict async output reliably; stop guessing.*

1. Callbacks & the callback contract (error-first), callback hell mechanics
2. Promises: states, the `then` contract, chaining, how it's really a state machine
3. Microtask scheduling: why promises always beat timers
4. `process.nextTick` vs microtasks vs macrotasks — exact ordering rules
5. `async`/`await` as syntax over promises; what each `await` actually schedules
6. Error propagation: sync throw vs rejection, `try/catch` boundaries,
   unhandled rejections, `uncaughtException`, when to crash
7. Sequential vs parallel: the single most common performance bug
8. `Promise.all` / `allSettled` / `race` / `any` — semantics and failure modes
9. Concurrency control: bounded parallelism, why unbounded `Promise.all` is a bug
10. Cancellation: `AbortController`, `AbortSignal`, timeouts, signal propagation
11. Async iterators & `for await`
12. Async generators: producer/consumer, lazy pipelines, backpressure intro
13. EventEmitter vs promises; `once()`, leak warnings
14. `AsyncLocalStorage` intro (request context — revisited in Phase 6/8)

**Heavy use of prediction exercises.** Predict → explain → run → reconcile.

**Knowledge check 2:** ordering puzzles, rejection handling, parallelism tradeoffs.

---

## Phase 2.5 — TypeScript for Node Backend
*Goal: TypeScript as a correctness tool for server code, not as decoration.*

Added 2026-10-19 on request. Placed here deliberately: Phases 1–2 are about
*runtime behavior*, where types add noise to prediction exercises. From Phase 3
onward the code is big enough that types start paying for themselves.

1. Why TypeScript exists: what class of bug it removes, what it cannot do
2. The compile-time/runtime boundary — **the single most important TS idea for
   backend**: types vanish at runtime, so they never validate external input
3. Setup for Node: `tsconfig` that matters, ESM + TS, `tsx`/`node --experimental-strip-types`,
   build vs run-from-source, source maps for real stack traces
4. Core types, inference, and when annotation actually helps
5. `interface` vs `type`; structural typing (why TS isn't Java)
6. Unions, literal types, discriminated unions — modeling states so illegal
   states don't compile
7. Narrowing, type guards, `unknown` vs `any` (and why `any` is a silent hole)
8. Generics: when they earn their place; constraints; generic functions over
   generic classes
9. Utility types: `Partial`, `Pick`, `Omit`, `Record`, `Readonly`, template literals
10. Typing async code: `Promise<T>`, awaited types, typed error handling,
    why `catch (e)` is `unknown`
11. `strict` mode flags one by one: `strictNullChecks`, `noUncheckedIndexedAccess`,
    `exactOptionalPropertyTypes` — what each actually catches
12. Runtime validation + static types together: Zod, `z.infer`, parse-don't-validate
13. Typing Node built-ins, `@types/*`, declaration files, module augmentation
14. Decorators & metadata (the mechanism NestJS is built on — taught here, used in Phase 9)
15. TS project organization: path aliases, project references, build output
16. Common TS anti-patterns in backend codebases: `as` abuse, `any` leaks,
    over-generic code, types that lie about runtime reality

**Milestone:** convert the Phase 1 CLI (Project 1) to strict TypeScript, and
add Zod validation at its input boundary. Same behavior, now type-safe.

From this phase onward: **all lessons, exercises and projects are TypeScript.**

---

## Phase 3 — Node.js Core APIs
*Goal: fluency with the standard library, and what it does under the hood.*

1. `fs` / `fs/promises`: sync vs async vs streaming, when sync is acceptable
2. Paths & the cross-platform trap; `node:url`, file URLs, `import.meta`
3. `EventEmitter` internals
4. Buffers: binary data, encodings, allocation, `Buffer.allocUnsafe` risk
5. Streams I: the four types, the mental model (pipes, not arrays)
6. Streams II: backpressure — the concept most Node devs get wrong
7. Streams III: `pipeline`, error handling, cleanup, async iteration over streams
8. Streams IV: transform streams, object mode, custom streams
9. `node:http` server: request/response as streams, keep-alive, headers
10. `node:http` client, `fetch`, agents, connection reuse, timeouts
11. `https` & TLS basics
12. `crypto`: hashing vs HMAC vs encryption; password hashing; random values;
    timing-safe comparison
13. `zlib` / compression, and why you often shouldn't do it in-process
14. `os`, `dns`, `net` (TCP), what a socket really is
15. `child_process`: spawn/exec/fork, stdio, shell injection risk
16. `worker_threads`: when they help, when they don't, message passing cost
17. `cluster`: how it shares a port, what it does not solve
18. Timers & `perf_hooks` for measurement

**Milestone:** a streaming file-processing tool handling a file larger than RAM,
with correct backpressure and cleanup.

---

## Phase 4 — HTTP & Backend Development (no framework)
*Goal: build a real API with `node:http` so frameworks become legible.*

1. HTTP/1.1 fundamentals: message format, methods, semantics, idempotency
2. Status codes that matter, and the ones everyone misuses
3. Headers, content negotiation, caching headers, ETags
4. The request lifecycle end to end: socket → parse → handler → response
5. Routing from scratch: matching, params, the data structures involved
6. Middleware from scratch: build the composition pattern, understand `next()`
7. Body parsing: JSON limits, streaming bodies, DoS via large payloads
8. Validation at the boundary (Zod), parse-don't-validate, typed DTOs
9. Serialization, response shaping, avoiding accidental data leaks
10. Error handling architecture: error taxonomy, operational vs programmer
    errors, consistent error responses, never leaking internals
11. Cookies, sessions, and what "stateless" actually costs
12. Authentication: password hashing (argon2/bcrypt), sessions vs JWT —
    honest tradeoffs, refresh/rotation, token revocation
13. Authorization: RBAC, ABAC, permission checks at the right layer
14. Security: OWASP essentials, CORS (properly), CSRF, security headers,
    injection, SSRF, rate limiting, timing attacks
15. File uploads: multipart, streaming to disk/S3, limits, content sniffing
16. API design: resources, pagination (offset vs cursor), filtering, sorting,
    versioning, consistency
17. Observability of an HTTP service: request IDs, access logs, timing

**Milestone — Project 2:** REST API in plain Node + TypeScript. Routing,
middleware, validation, auth, errors, pagination — no Express, no Nest.

**Knowledge check 3:** HTTP semantics, auth tradeoffs, attack surface.

---

## Phase 5 — PostgreSQL from Node.js
*Goal: treat the database as a system you reason about, not a black box.*

1. Protocol & drivers: `pg`, what a connection actually is
2. Connection lifecycle, handshake cost, why pooling is mandatory
3. Pools: sizing, saturation, queueing, leaks, pool starvation deadlocks
4. Queries: parameterized statements, prepared statements, type parsing
5. Transactions: BEGIN/COMMIT/ROLLBACK, client-bound transactions, the classic
   "transaction on a pool" bug
6. Isolation levels: read committed vs repeatable read vs serializable;
   anomalies; retry-on-serialization-failure
7. Locks: row locks, `FOR UPDATE`, `SKIP LOCKED`, advisory locks, deadlocks
8. Concurrency patterns: optimistic vs pessimistic locking, idempotent writes
9. Query performance: `EXPLAIN ANALYZE`, indexes, selectivity, index-only scans
10. N+1 problems: how ORMs cause them, how to detect and fix
11. Query builders vs ORMs vs raw SQL: real tradeoffs (Prisma / Drizzle / Kysely)
12. Migrations: forward-only, zero-downtime schema changes, expand/contract
13. Repository pattern & data access layering; where SQL should live
14. Error handling: PG error codes, constraint violations as domain signals
15. Timeouts: statement timeout, connection timeout, cancellation
16. Bulk operations, COPY, batching, pagination on large tables
17. `LISTEN`/`NOTIFY` and its limits

**Milestone — Project 3:** PostgreSQL-backed production-style API with pooling,
transactions, migrations, indexes, and a documented concurrency decision.

---

## Phase 6 — Production Node.js
*Goal: run a service you can be on-call for.*

1. Configuration: schema-validated env, config precedence, secrets, no secrets in code
2. Structured logging: levels, JSON logs, correlation IDs, redaction (pino)
3. Request context propagation with `AsyncLocalStorage`
4. Error strategy in production: what to retry, what to surface, what to page on
5. Observability: logs vs metrics vs traces; the three pillars honestly assessed
6. Metrics: RED/USE, histograms, Prometheus, cardinality traps
7. Distributed tracing: OpenTelemetry, spans, context propagation
8. Health checks: liveness vs readiness vs startup — and why conflating them hurts
9. Graceful shutdown: SIGTERM, draining connections, in-flight requests,
   closing pools, Kubernetes timing
10. Timeouts everywhere: client, server, DB, external calls; budget propagation
11. Retries: idempotency requirement, exponential backoff, jitter, retry storms
12. Circuit breakers & bulkheads; failing fast as a feature
13. Rate limiting: algorithms (token bucket, sliding window), distributed limiting
14. Caching: cache-aside, write-through, TTLs, stampedes, invalidation strategy
15. Redis: data structures, when it's the right tool, failure behavior,
    what happens when Redis goes down
16. Background jobs & queues: BullMQ, job lifecycle, retries, DLQs
17. Workers: separate processes, scaling, crash recovery, visibility
18. Idempotency keys & exactly-once-as-a-lie
19. Distributed locks: Redis locks, correctness caveats, better alternatives
20. WebSockets: the protocol, scaling, sticky sessions, pub/sub fan-out
21. Scaling: vertical, cluster, horizontal; statelessness as a requirement
22. Load balancing, connection draining, deployment strategies
23. Docker: images, layers, multi-stage builds, signals/PID 1, non-root
24. Deployment concepts: 12-factor, blue/green, canary, rollback

**Milestone — Project 5:** queue + Redis + workers with retries, idempotency,
DLQ, and a documented failure-mode analysis.
**Milestone — Project 6:** real-time WebSocket app that survives 2+ instances.

---

## Phase 7 — Testing Node.js
*Goal: tests that create confidence, not coverage theater.*

1. Testing philosophy: what to test, the pyramid vs the honeycomb
2. Unit tests: pure logic, seams, fast feedback (`node:test` / Vitest)
3. Test doubles: stub/mock/spy/fake — precise definitions and misuse
4. Dependency injection for testability (sets up NestJS DI naturally)
5. Integration tests with a real PostgreSQL; schema per test, truncation vs txn rollback
6. API/HTTP testing end to end
7. Test isolation, determinism, fixing flaky tests
8. Testing async code: fake timers, waiting without sleeping
9. Testing failure: injected faults, timeouts, DB down, dependency failure
10. Contract testing between services
11. E2E tests and their real cost
12. CI: what belongs in the pipeline

---

## Phase 8 — Advanced Node.js
*Goal: explain and fix behavior nobody else on the team understands.*

1. Event loop internals: libuv phase-by-phase, poll timing, handles vs requests
2. V8 internals: hidden classes, inline caches, deopt, why monomorphism matters
3. Memory: heap spaces, new/old generation, resident set
4. Garbage collection: scavenge vs mark-compact, GC pauses, measuring them
5. Memory leaks: the common five causes, finding them with heap snapshots
6. CPU profiling: flamegraphs, `--cpu-prof`, Clinic/0x
7. Diagnostics: `--inspect`, diagnostic reports, `diagnostics_channel`
8. Backpressure as a system property, across streams/queues/HTTP
9. Streams internals: highWaterMark, buffering, the real cost of object mode
10. Worker threads in depth: SharedArrayBuffer, Atomics, transferables
11. Child processes & cluster in depth; process supervision
12. `AsyncLocalStorage` internals & performance cost
13. High-throughput service design: allocation, serialization, JSON cost
14. Distributed systems for Node devs: CAP in practice, consistency models,
    clocks, at-least-once delivery, partial failure
15. Node architecture patterns & anti-patterns

---

## Phase 9 — NestJS from First Principles
*Goal: understand Nest as an answer to Phase 4–7 pain.*

1. Why NestJS exists: what plain-Node Project 2 hurt at; what Nest trades away
2. Architecture overview: platform adapters over Express/Fastify over node:http
3. TypeScript decorators & metadata reflection — the actual mechanism
4. IoC and dependency injection: the concept, then Nest's container
5. Providers: tokens, instantiation, lifetime, the dependency graph
6. Modules: encapsulation, imports/exports, circular modules
7. Controllers & routing; how a request reaches your method
8. The full Nest request lifecycle (middleware → guards → interceptors →
   pipes → handler → interceptors → filters) and why that order
9. Pipes & validation: `class-validator`/`class-transformer` vs Zod
10. DTOs vs entities vs domain models
11. Guards: authn/authz placement, vs middleware, vs interceptors
12. Interceptors: cross-cutting concerns, RxJS in Nest, response mapping
13. Exception filters & a coherent error contract
14. Middleware in Nest, and when to drop to the adapter
15. Custom decorators & metadata-driven behavior
16. Configuration module, validation, typed config
17. Lifecycle hooks; graceful shutdown in Nest
18. Dynamic modules, `forRoot`/`forRootAsync`, async providers, factories
19. Scopes: singleton vs request-scoped vs transient — and the performance cost
20. Testing Nest: unit with the testing module, overriding providers, E2E

---

## Phase 10 — Production NestJS & Architecture
*Goal: ship and operate a large service; choose architecture by tradeoff.*

1. Project structure for a real codebase (feature modules, not type folders)
2. Database integration: Prisma vs TypeORM vs Drizzle in Nest; transactions
   across layers; the unit-of-work problem
3. Auth: JWT access/refresh, sessions, rotation, revocation, RBAC + permissions
4. Validation, error handling, logging, config — the Nest-idiomatic versions
5. Caching & Redis in Nest; cache interceptors and their traps
6. Queues with BullMQ; workers as separate Nest apps
7. Events: in-process event emitter, `CQRS` module, when each is appropriate
8. Scheduling, cron, and why cron in multiple instances breaks
9. WebSockets/gateways at scale
10. File uploads and streaming in Nest
11. API documentation: OpenAPI/Swagger generated from types
12. Testing strategy for a large Nest app
13. Performance: Fastify adapter, serialization cost, N+1 in resolvers
14. Security hardening checklist
15. Docker, multi-stage builds, graceful shutdown in containers, health probes
16. Monitoring, metrics, tracing in Nest

### Architecture (taught with tradeoffs, never as dogma)
17. Layered architecture; where logic actually belongs
18. Modular monolith — and when it beats microservices
19. Clean & hexagonal architecture; ports/adapters; the cost of indirection
20. DDD concepts: entities, value objects, aggregates, bounded contexts
21. Dependency inversion in practice
22. Repository & service layer done honestly (and the anemic-model trap)
23. CQRS: when read/write separation pays for itself
24. Event-driven architecture; eventual consistency
25. Microservices: communication, discovery, messaging, the failure surface
26. Outbox pattern, sagas, distributed transactions, idempotency at the edges
27. Decision frameworks: how senior engineers actually choose

**Milestone — Project 7:** production-grade NestJS API.
**Milestone — Project 8:** large modular NestJS backend with real boundaries.

---

## Final Project
A production-style backend combining: NestJS, PostgreSQL, Redis, auth +
authorization, queues, background workers, caching, real-time events, testing,
structured logging, observability, Docker, production configuration, graceful
shutdown, and a defensible architecture — with a written architecture decision
record explaining the tradeoffs chosen.

It should look like something handed to a professional backend engineer on day
one of a real job.
