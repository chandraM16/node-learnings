import { createServer } from "node:http";

const t0 = Date.now();
const log = (m) => console.log(`[server @${Date.now() - t0}ms] ${m}`);

const server = createServer((req, res) => {
  log(`JS handler chala — ab maine request DEKHI`);
  res.end("ok");
});

server.listen(9999, () => {
  log(`listening. socket ka file descriptor = ${server._handle?.fd}`);
  log(`ab main JS thread ko 3 second ke liye JAM karta hoon...`);

  const end = Date.now() + 3000;
  while (Date.now() < end) {}          // event loop poori tarah blocked

  log(`JS thread free ho gaya`);
});
