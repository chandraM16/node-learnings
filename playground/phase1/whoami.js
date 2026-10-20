console.log("Process ID:", process.pid);
console.log("Node version:", process.version);
console.log("Platform:", process.platform, process.arch);
console.log("Kis folder mein chal raha hai:", process.cwd());
console.log(
  "Memory abhi:",
  Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
  "MB",
);
