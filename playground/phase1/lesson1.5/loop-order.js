console.log("1. sync: script shuru");

setTimeout(() => console.log("6. timers phase: setTimeout 0"), 0);
setImmediate(() => console.log("7. check phase: setImmediate"));

Promise.resolve().then(() => console.log("5. microtask: promise"));
process.nextTick(() => console.log("4. nextTick"));

queueMicrotask(() => console.log("5b. microtask: queueMicrotask"));

console.log("2. sync: script ke beech");
console.log("3. sync: script khatam");
