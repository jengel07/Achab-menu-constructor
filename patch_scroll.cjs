const fs = require('fs');
let code = fs.readFileSync('src/views/ClientView.vue', 'utf8');

code = code.replace(
  'max-height: calc(100vh - 100px); overflow-y: auto; background: transparent; display: flex; flex-direction: column; gap: 8px; scrollbar-width: none;',
  'max-height: calc(100dvh - 100px); overflow-y: auto; background: transparent; display: flex; flex-direction: column; gap: 8px; scrollbar-width: none; padding-bottom: 80px;'
);

fs.writeFileSync('src/views/ClientView.vue', code);
console.log('Patched expanded-panel padding in ClientView.vue');

