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
