const fs = require('fs');
let file = fs.readFileSync('src/components/MenuEditor.vue', 'utf8');

file = file.replace(/@save="mods => \{ editingItem\.modifiers = mods; showModifiersModal = false; \}"/g, "@save=\"mods => { if(editingItem) editingItem.modifiers = mods; showModifiersModal = false; }\"");

fs.writeFileSync('src/components/MenuEditor.vue', file);
console.log('Fixed MenuEditor editingItem null check');
