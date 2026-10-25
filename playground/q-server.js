import { createServer } from "node:http";

const t0 = Date.now();
const log = (m) => console.log(`[server @${String(Date.now() - t0).padStart(4)}ms] ${m}`);
let handled = 0;

const server = createServer((req, res) => {
  handled++;
  log(`handler #${handled} chala  (url ${req.url})`);
  res.end("ok");
  if (handled === 10) { log("saari 10 ho gayi, exit"); process.exit(0); }
});

server.listen(9998, () => {
  log("listening, ab JS thread 2 second JAM");
  const end = Date.now() + 2000;
  while (Date.now() < end) {}
  log("JS thread FREE — dekho ab kya aata hai");
});

setTimeout(() => { log(`timeout: sirf ${handled} requests aayi`); process.exit(1); }, 8000);
