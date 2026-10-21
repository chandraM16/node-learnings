function work(n) {
  let total = 0;
  for (let i = 0; i < n; i++) total += Math.sqrt(i);
  return total;
}

for (let round = 1; round <= 6; round++) {
  const t = performance.now();
  work(5_000_000);
  console.log(`Round ${round}: ${(performance.now() - t).toFixed(2)} ms`);
}
