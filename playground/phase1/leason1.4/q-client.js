await new Promise((r) => setTimeout(r, 600)); // server block hone ka intezaar
console.log(
  "  [client] 10 requests ek saath bhej raha hoon (server JAMMED hai)",
);
await Promise.all(
  Array.from({ length: 10 }, (_, i) =>
    fetch(`http://127.0.0.1:9998/req-${i + 1}`),
  ),
);
console.log("  [client] saare 10 jawaab mil gaye");
