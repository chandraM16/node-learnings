// "Health check" jo har 100ms pe chalni chahiye
let ticks = 0;
const health = setInterval(() => {
  ticks++;
  console.log(`  [health check] tick ${ticks} @ ${Date.now() - t0}ms`);
}, 100);

const t0 = Date.now();

// Ek "PDF generate" request — pure CPU, 2 second
function generatePdf() {
  const end = Date.now() + 2000;
  let x = 0;
  while (Date.now() < end) x += Math.sqrt(Math.random());
  return x;
}

setTimeout(() => {
  console.log(`[request] PDF banana shuru @ ${Date.now() - t0}ms`);
  generatePdf();
  console.log(`[request] PDF ready @ ${Date.now() - t0}ms`);
}, 250);

setTimeout(() => {
  console.log(`[health] interval band, total ticks: ${ticks}`);
  clearInterval(health);
}, 3000);
