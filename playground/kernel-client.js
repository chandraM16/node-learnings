const t0 = Date.now();
const log = (m) => console.log(`  [client @${Date.now() - t0}ms] ${m}`);

// Server ko block hone ka mauka do
await new Promise((r) => setTimeout(r, 800));

log("connect + request bhej raha hoon (server ka JS abhi JAMMED hai)");
const res = await fetch("http://127.0.0.1:9999/");
log(`jawaab mila: ${res.status}`);
