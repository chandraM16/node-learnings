import { createServer } from "node:http";

// Ek local server jo har request ko 200ms "slow" banata hai (jaise ek slow DB)
const server = createServer((req, res) => {
  setTimeout(() => res.end("ok"), 200);
});

server.listen(0, async () => {
  const port = server.address().port;
  const t0 = Date.now();

  // 50 requests, ek saath
  const times = await Promise.all(
    Array.from({ length: 50 }, async (_, i) => {
      await fetch(`http://127.0.0.1:${port}/`);
      return Date.now() - t0;
    })
  );

  console.log("Pehli khatam  @", Math.min(...times), "ms");
  console.log("Aakhri khatam @", Math.max(...times), "ms");
  console.log("Total 50 requests:", Date.now() - t0, "ms");
  console.log("Agar 4-4 ke batch mein hote toh lagta:", Math.ceil(50 / 4) * 200, "ms");
  server.close();
});
