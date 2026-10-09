const fs = require('fs');
let file = fs.readFileSync('src/components/MenuEditor.vue', 'utf8');

file = file.replace(/v-if="showModifiersModal"/g, 'v-if="showModifiersModal && editingItem"');
fs.writeFileSync('src/components/MenuEditor.vue', file);
console.log('Fixed MenuEditor.vue v-if');
