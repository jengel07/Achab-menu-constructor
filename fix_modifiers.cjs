const fs = require('fs');
let file = fs.readFileSync('src/components/ModifiersEditor.vue', 'utf8');

file = file.replace(/const removeOption = \(gIdx: number, oIdx: number\) =>/g, 'const removeOption = (gIdx: any, oIdx: any) =>');
file = file.replace(/const addOption = \(gIdx: number\) =>/g, 'const addOption = (gIdx: any) =>');
file = file.replace(/const removeGroup = \(idx: number\) =>/g, 'const removeGroup = (idx: any) =>');

fs.writeFileSync('src/components/ModifiersEditor.vue', file);
console.log('Fixed ModifiersEditor.vue typing');
