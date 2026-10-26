const t = setTimeout(() => console.log("C: ye KABHI nahi chalega"), 1000);
t.unref();                       // handle ko "mat gino" bol diya
console.log("C: aakhri line chal gayi");
