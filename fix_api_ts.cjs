const fs = require('fs');
let file = fs.readFileSync('src/api.ts', 'utf8');

file = file.replace(/generalSettings: Record<string, unknown>;/g, "generalSettings: Record<string, unknown>;\n      orderMode?: string;");

fs.writeFileSync('src/api.ts', file);
console.log('Fixed api.ts types');
