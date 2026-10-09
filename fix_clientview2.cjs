const fs = require('fs');
let file = fs.readFileSync('src/views/ClientView.vue', 'utf8');

file = file.replace(/if \(modeMap\[savedModeStr\]\) store\.orderMode = modeMap\[savedModeStr\];/g, "if (modeMap[savedModeStr as keyof typeof modeMap]) store.orderMode = modeMap[savedModeStr as keyof typeof modeMap];");

fs.writeFileSync('src/views/ClientView.vue', file);
console.log('Fixed modeMap index');
