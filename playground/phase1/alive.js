let seconds = 0;

setInterval(() => {
  seconds++;
  console.log(`Main ${seconds} second se zinda hoon. PID ${process.pid}`);
}, 1000);

console.log("Script ki aakhri line chal gayi. Kya process ab band hoga?");
