const t0 = Date.now();
let ticks = 0;
const fireTimes = [];

const iv = setInterval(() => {
  ticks++;
  fireTimes.push(Date.now() - t0);
}, 100);

// 500ms baad, 2 second ke liye thread block kar do
setTimeout(() => {
  const end = Date.now() + 2000;
  while (Date.now() < end) { /* pure CPU */ }
}, 500);

setTimeout(() => {
  clearInterval(iv);
  const elapsed = Date.now() - t0;
  console.log("Kul samay:", elapsed, "ms");
  console.log("100ms interval pe ticks hone CHAHIYE the:", Math.floor(elapsed / 100));
  console.log("Actually hue:", ticks);
  console.log("Khoye:", Math.floor(elapsed / 100) - ticks);
  console.log();
  console.log("Tick kab-kab fire hue (ms):", fireTimes.join(", "));
}, 3000);
