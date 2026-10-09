const fs = require('fs');
let file = fs.readFileSync('src/views/ClientView.vue', 'utf8');

file = file.replace(/const mods = item\.selectedModifiers\.map\(\(m\)/g, "const mods = item.selectedModifiers.map((m: any)");

fs.writeFileSync('src/views/ClientView.vue', file);
console.log('Fixed implicit any');
