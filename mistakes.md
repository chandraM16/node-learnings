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
