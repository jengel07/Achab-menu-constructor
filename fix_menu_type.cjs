const fs = require('fs');
let file = fs.readFileSync('src/types/menu.ts', 'utf8');

file = file.replace(/vegan\?: boolean;/g, 'vegan?: boolean;\n  modifiers?: any[];');
fs.writeFileSync('src/types/menu.ts', file);
console.log('Added modifiers to MenuItem in src/types/menu.ts');
