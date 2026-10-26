let n = 0;

setTimeout(() => console.log("TIMER CHAL GAYA (n =", n, ")"), 0);

function recurse() {
  if (++n < 1_000_000) process.nextTick(recurse);
  else console.log("nextTick loop khatam, n =", n);
}
recurse();
