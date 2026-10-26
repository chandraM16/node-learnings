// Do timers, dono 0ms. Har timer ke andar ek microtask queue karte hain.
setTimeout(() => {
  console.log("timer 1 shuru");
  Promise.resolve().then(() => console.log("   timer 1 ka microtask"));
  console.log("timer 1 khatam");
}, 0);

setTimeout(() => {
  console.log("timer 2 shuru");
  Promise.resolve().then(() => console.log("   timer 2 ka microtask"));
  console.log("timer 2 khatam");
}, 0);
