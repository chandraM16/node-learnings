Promise.resolve().then(() => console.log("promise A"));
process.nextTick(() => console.log("nextTick A"));
Promise.resolve().then(() => console.log("promise B"));
process.nextTick(() => console.log("nextTick B"));
