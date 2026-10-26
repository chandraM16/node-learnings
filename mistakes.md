# Misconceptions Caught & Corrected

Har entry: maine kya socha tha, sach kya hai, aur **kyun** galat tha.
Ye file isliye hai ki galat mental model dobara wapas na aaye.

Status: `open` = abhi tak properly corrected nahi, `corrected` = samajh aa gaya,
`verified` = baad mein spaced-repetition check mein sahi nikla.

---

## M-001 — "`async` inside `forEach` makes it slower"
- **Date:** 2026-10-19 (diagnostic assessment, question B3)
- **Status:** `open` — correction scheduled for Phase 2 (async deep dive)

**Maine kya kaha:** "forEach ke andar async use kiya hai toh woh jyada time lega."

**Instinct accha tha** — `async` + `forEach` dekh ke "yahan kuch galat hai" lagna
sahi reaction hai. Lekin **reason galat hai**, aur asli problem iske bilkul
ulta hai.

**Asli problem (Phase 2 mein detail se):** `forEach` async callbacks ka
*intezaar hi nahi karta*. Woh promise ko ignore kar deta hai. Matlab:
- time zyada nahi lagta — balki code *jaldi* "finish" ho jaata hai jabki kaam
  abhi baaki hai
- callback ke andar ka `throw` bahar ke `try/catch` tak pahunchta hi nahi
- woh error ek **unhandled promise rejection** ban jaata hai, jo Node mein by
  default process ko crash karti hai

Yani ye slowness ka bug nahi hai — ye **silent data loss + swallowed error** ka
bug hai, jo production mein slowness se kahin zyada khatarnak hai.

**Kyun yaad rakhna:** array methods (`forEach`, `map`, `filter`, `reduce`) aur
`async` ka combination Node codebases mein top-5 real bugs mein aata hai.

**Revisit:** Phase 2, lesson "Sequential vs parallel" + "Error propagation".

---

## M-002 — "Process zinda hai kyunki interval clear nahi kiya"
- **Date:** 2026-10-20 (Exercise 1.1, Task 5)
- **Status:** `corrected` — needs a spaced-repetition check later

**Maine kya kaha:** "apn code mai setTimeout ko clear nahi kr rhe."

**Observation sahi thi, mechanism missing tha.** "Clear nahi kiya" symptom hai.
Asli jawaab: **libuv active handles/requests ka counter rakhta hai.** Har timer,
socket, listening server us counter mein +1 hai. Har loop turn ke baad agar
counter zero ho gaya toh process khud exit kar jaata hai.

Proof: `setTimeout` + `.unref()` = timer chalta hai par counter mein nahi ginta
→ process 0.03s mein nikal gaya, timer fire hua hi nahi.

**Kyun important:** production mein jab process exit nahi karega, tab sawaal
"kya clear nahi kiya" nahi hoga — sawaal hoga **"kaunsa handle abhi tak
referenced hai?"**

**Revisit:** Phase 1 Lesson 1.5 (event loop), Phase 6 (graceful shutdown).

---

## M-003 — Mentor ki galti: "`.js` mein `import` likhoge toh error aayega"
- **Date:** 2026-10-20 (Lesson 1.1, Task 4)
- **Status:** `corrected`

**Ye student ki galti nahi, meri thi.** Maine bina verify kiye claim kiya ki
`read-self.js` chalane pe `SyntaxError` aayega. **Chandan ne sahi report kiya
ki error nahi aaya.**

Reason: Node **22.7+** mein automatic module syntax detection default on hai,
aur `playground/` mein koi `package.json` nahi tha. Signal na milne par Node ne
file ko ESM maan ke chala diya.

`{"type":"commonjs"}` wale folder mein wahi file expected error deti hai.

**Lesson (mere liye):** version-dependent behavior **claim karne se pehle chalao**.
CLAUDE.md §3 rule 10 yahi kehta hai.

---

## M-004 — "Ek thread hai, toh thread free hone pe ek hi request milegi"
- **Date:** 2026-10-25 (Lesson 1.4 follow-up)
- **Status:** `corrected` — needs a spaced-repetition check in Lesson 1.5

**Maine kya kaha:** 10 clients ne block ke dauraan request bheji → "woh kernel
mein rahengi aur thread free hone pr **ek hi** request milegi."

**Pehla hissa sahi** (kernel mein padi rehti hain), **doosra galat.**

Do cheezein mila di:
- *"ek waqt mein ek chalti hai"* — ✅ sahi
- *"sirf ek deliver hoti hai"* — ❌ galat

Thread free hone pe Node kernel se poochhta hai "kaun-kaun taiyaar hai", aur
kernel **saare 10** bata deta hai. Measured: 10 handlers thread free hone ke
**7ms** ke andar chal gaye.

**Asli natija:** block = **sabko latency**, data loss nahi. Loss tabhi shuru hota
hai jab accept queue (default backlog 511) bhar jaaye.

**Yaad rakhne wali line:** ek thread ye tay karta hai **ek waqt mein kitna
chalega**, ye nahi ki **kitna rakha ja sakta hai**.

---

## M-005 — "Kernel ka socket aur Node ka socket alag hote hain"
- **Date:** 2026-10-25 (Lesson 1.4 follow-up)
- **Status:** `corrected`

**Maine poochha:** "OS kernel jo sockets pe nazar rakhta hai woh Node ke socket
se alag hai, right?"

**Nahi — ek hi socket hai, aur woh kernel ke andar hai.** Node ke paas sirf ek
**file descriptor** (number, e.g. `12`) hota hai. JS ka `server` object us number
ka wrapper hai; buffers aur TCP state sab kernel ki memory mein.

`epoll`/`kqueue` bhi unhi fd numbers pe nazar rakhta hai — matlab **ek object,
do taraf se dekha ja raha hai.**

**Mental model:** fd = cloakroom token. Coat kernel ke paas, token Node ke paas.

---

## M-006 — "Callback kernel ko dete hain, aur kernel usko chalata hai"
- **Date:** 2026-10-25 (apna mental model likhte waqt)
- **Status:** `corrected` — Lesson 1.5 mein spaced-rep check

**Maine kya kaha:** "async operation OS kernel ko batata hai aur usko callback
deta hai... jab kernel operation khatam karta hai toh woh callback main thread ko
deta hai run karne ke liye."

**Kernel ko JavaScript ka wajood hi nahi pata.** Uski poori bhasha: *"fd 15
readable"*, *"fd 16 writable"*, *"ye operation complete"*. Numbers aur status, bas.

Callback **libuv** ke paas rehta hai, apni table mein. Kernel sirf readiness
batata hai; libuv dekhta hai ki us readiness ka JavaScript kaunsa hai; **event
loop** tay karta hai ki woh kab chalega.

**Aur isi ke andar ek doosri baat chhupi thi:** callback us waqt nahi chalta jab
kaam poora hota hai. Poora hone pe woh sirf **eligible** banta hai — chalta tab
hai jab (a) main thread free ho aur (b) event loop sahi phase pe pahunche.

**Revisit:** Lesson 1.5 — order decide karna event loop ka poora kaam hai.

---

## M-007 — "Koi bhi async operation kernel ko jaata hai"
- **Date:** 2026-10-25 (apna mental model likhte waqt)
- **Status:** `corrected` — **re-test zaroori**, ye Lesson 1.5 ke liye load-bearing hai

**Maine kya kaha:** "file read karni hai ya **koi bhi** async operation, woh OS
kernel ko batata hai."

**File read kernel ko async nahi jaata.** Do bilkul alag raaste hain:

| Kaam | Raasta | Thread lagti hai? |
|---|---|---|
| network (DB, API, response) | kernel — epoll/kqueue | **nahi** |
| `fs`, `dns.lookup`, `zlib`, `crypto` | **thread pool (4)** | **haan** |

`fs.readFile` mein libuv pool se ek thread uthata hai aur **woh thread normal
blocking read karti hai** — purane model jaisa hi. "Async" isliye lagta hai ki
*meri* thread block nahi hui, par **kahin ek thread block hui thi.**

**Yahi wajah hai** ki pool bharta hai aur kernel wala raasta kabhi nahi bharta.
Pool bhara ho toh kaam **shuru bhi nahi hota**, line mein lagta hai.

**Revisit:** Lesson 1.5, phir Phase 3 (streams, `worker_threads`), phir Phase 4
(bcrypt/auth capacity).

---

## M-008 — "Missed timer ticks baad mein chal jaayenge"
- **Date:** 2026-10-25 (warm-up W2, after a 5-day gap)
- **Status:** `corrected` — needs a spaced-rep check in Lesson 1.5/1.6

**Maine kya kaha:** "jab main thread free ho jayegi tab woh health/request chalegi."

**Ye over-generalization thi, aur achhe reason se.** (Ye entry pehle galti se
M-006 number ki gayi thi — woh number fork session ne already le liya tha.
Ab M-008 hai.) M-004 mein seekha tha ki
*queued work delayed hota hai, lost nahi* — 10 clients block ke dauraan aaye aur
saare 10 handlers thread free hone ke 7ms mein chal gaye. Woh sahi hai.
Main ne wahi rule timers pe bhi laga diya. **Timers exception hain.**

**Measured** (3s run, 100ms interval, 2s block beech mein):
```
Ticks hone chahiye the: 30
Actually hue:            9
Khoye:                  21
Fire times (ms): 101, 202, 303, 404, 2501, 2602, 2703, 2807, 2908
```
404ms ke baad **seedha 2501** — ek hi tick, 20 ka burst nahi. 21 ticks gaye.

**Farak kyun:**
| | Pending connection | Missed tick |
|---|---|---|
| Kya hai | **data**, kernel queue mein padi | ek **samay** jo guzar gaya |
| Kahan rakhi hai | kernel memory mein, physically | kahin nahi |
| Unblock pe | **sab deliver** | **ek baar**, phir reschedule |

> **Timer ek deadline hai, queue nahi. Data jama hoti hai; samay jama nahi hota.**

`setInterval(fn, 100)` = "**kam se kam** 100ms baad", not "har 100ms pe exactly once".

**Production mein:**
- `setInterval` se **kabhi ginti mat karo** (`seconds++` jhooth bolega) — samay
  ke liye `Date.now()`.
- Interval pe chalne wala koi bhi kaam chup-chaap skip ho sakta hai: metrics
  push, cache refresh, cleanup, heartbeat. **Koi error nahi, koi log nahi.**
  Isliye important periodic kaam queue + scheduler pe jaata hai (Phase 6).

**Revisit:** Lesson 1.5 (event loop timers phase), Lesson 1.6 (timers),
Phase 6 (scheduling, cron in multiple instances).

---

## Note — W1 pe ek sharpening (galti nahi)
"Process **kill** nahi hoti" → sahi shabd: "process **exit** nahi karti".
Koi usse maar nahi raha; woh khud nikalna nahi chahti kyunki handle counter
zero nahi hua. Ye farak Phase 6 mein bada hota hai, jahan `SIGTERM` (request)
aur `SIGKILL` (zabardasti) do alag cheezein hain.

---

## M-009 — "Pool badhane se CPU-bound kaam bhi tez ho jaayega"
- **Date:** 2026-10-26 (Exercise 1.4, Tasks 1 & 4)
- **Status:** `corrected` — re-check in Phase 3 (`worker_threads`)
- **Related:** [[M-007]] ne do raaste alag kiye the; ye entry batati hai ki
  **pool wale raaste ke andar bhi** do tarah ka kaam hota hai.

**Maine kya kaha:** Task 1 mein `=16` vs `=8` ka comparison skip kiya, aur Task 4
mein likha "`UV_THREADPOOL_SIZE` badhana kaafi hoga".

**Measured (8-core machine, 8 x pbkdf2 300k iterations):**
```
pool=1  431ms      pool=8   97ms   <- yahan flat ho gaya
pool=2  242ms      pool=16  96ms
pool=4  126ms      pool=32  97ms
```
8 pe graph flat — aur 8 = is machine ke cores.

> **Rule:** pool badhane se fayda **sirf us kaam mein** hota hai jo *intezaar*
> karta hai (disk, DNS). Jo kaam *CPU khaata hai*, uski limit **cores** hain,
> pool size nahi.

16 threads 8 cores pe = har thread aadhi speed. Kaam utna, time utna, upar se
context-switching ka kharcha.

**Task 4 ki capacity (bcrypt ~100ms, 8 cores):**
```
default pool (4):  40 logins/sec
cores ka ceiling:  80 logins/sec   <- isse aage pool se kuch nahi
chahiye:          200 logins/sec
```
Asli raaste: **horizontal scaling** (login stateless hai), bcrypt cost factor
(par cost hi security hai — security team ke saath faisla), **hashing kam baar**
karna (token/session, kyunki per-request password bhejna design bug hai),
rate limiting (brute force + CPU DoS dono se bachav), bulkhead (nuksaan rokna).

**`worker_threads` bhi kaam NAHI karega** — wahi 8 cores. Threads ki kami
problem nahi thi, CPU ki kami thi.

**Kyun yaad rakhna:** "dheema hai -> zyada threads/workers daal do" ek reflex
ban jaata hai. Pehla sawaal hamesha: **bottleneck CPU hai ya wait?**

---

## M-010 — Measurement bug: baseline callback ke andar reset kar diya
- **Date:** 2026-10-26 (Exercise 1.4, Task 1)
- **Status:** `corrected`

`const t0` ko `let t0` kiya aur callback ke andar `t0 = Date.now()` daal diya.
Matlab "shuru se kitna time" ki jagah **"pichhle callback se kitna time"** naapne
laga.

```
buggy: 60, 2, 0, 0, 61, 3, 0, 2            <- batches gayab, noise jaisa dikha
fixed: 62, 63, 64, 64, 122, 125, 126, 127  <- do saaf batches
```

Same program, same runtime — sirf measurement alag. Aur isi wajah se Task 1/2 ke
jawaab **theory se** aaye, observation se nahi.

> **Pehla sawaal hamesha:** jo main naap raha hoon, woh wahi hai jo main sochta
> hoon ki naap raha hoon? Galat timestamp, galat metric window, galat dashboard
> aggregation — ye production mein roz hota hai, beginner mistake nahi hai.

`const` hota toh ye bug ho hi nahi sakta tha. **`const` default rakho** — woh
galtiyan rokta hai, style ki baat nahi hai.

**Saath wala sabak (Task 2):** "farak nahi dikha" ka matlab "mechanism nahi hai"
nahi hota. Chhoti file pe 8 `readFile`, pool=1 aur pool=4 — **dono 1ms**.
Wahi test 50MB x 16 pe: `207 -> 61 -> 37 -> 33ms`. **Mechanism wahi tha, test
chhota tha** — bottleneck activate hi nahi hua. Performance testing ki sabse aam
galti.

**Revisit:** Phase 8 (profiling), Phase 6 (metrics).
