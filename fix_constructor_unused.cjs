const fs = require('fs');
let file = fs.readFileSync('src/Constructor.vue', 'utf8');

file = file.replace(/Smartphone,/g, '');
file = file.replace(/const savePaymentSettings = \(\) => \{[\s\S]*?\}\s*catch[\s\S]*?\}\r?\n\};\r?\n/g, '');

fs.writeFileSync('src/Constructor.vue', file);
console.log('Removed unused vars from Constructor');
