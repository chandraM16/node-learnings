import { createServer, connect } from "node:net";

const server = createServer((socket) => {
  console.log(
    `  naya CONNECTION socket: fd=${socket._handle?.fd}` +
      `  | client side: ${socket.remoteAddress}:${socket.remotePort}` +
      `  | server side: ${socket.localAddress}:${socket.localPort}`,
  );
});

server.listen(9997, "127.0.0.1", async () => {
  console.log(`LISTENING socket: fd=${server._handle?.fd}  port=9997`);
  console.log(
    `(is socket pe data kabhi nahi behta — ye sirf connections "sunta" hai)\n`,
  );

  // 4 clients, ek hi port pe
  for (let i = 1; i <= 4; i++) {
    await new Promise((res) => {
      const c = connect(9997, "127.0.0.1", () => {
        c.end();
        res();
      });
    });
  }

  setTimeout(() => {
    server.close();
    process.exit(0);
  }, 100);
});
