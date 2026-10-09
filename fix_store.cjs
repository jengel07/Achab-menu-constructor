const fs = require('fs');
let file = fs.readFileSync('src/store/menuStore.ts', 'utf8');

file = file.replace(/loadFromServer,/g, 'loadFromServer,\n    syncToServer,');
fs.writeFileSync('src/store/menuStore.ts', file);
console.log('Exported syncToServer from menuStore.ts');
