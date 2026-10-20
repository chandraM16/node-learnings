// Ek typical "cache" jo bahut saare real codebases mein milta hai.
const recentUsers = [];

function handleRequest(userId) {
  const user = { id: userId, name: `User ${userId}`, data: new Array(500).fill("x") };
  recentUsers.push(user);          // <-- kabhi hata hi nahi rahe
  return user.name;
}

const mb = () => Math.round(process.memoryUsage().heapUsed / 1024 / 1024);

console.log("Shuru mein heap:", mb(), "MB");
for (let i = 1; i <= 300_000; i++) {
  handleRequest(i);
  if (i % 100_000 === 0) console.log(`${i.toLocaleString()} requests ke baad:`, mb(), "MB");
}
console.log("recentUsers ab itna bada hai:", recentUsers.length.toLocaleString(), "items");
