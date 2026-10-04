const fs = require('fs');

let vue = fs.readFileSync('src/views/ClientView.vue', 'utf8');
vue = vue.replace(/:disabled="isWaiterLocked"/g, '');
fs.writeFileSync('src/views/ClientView.vue', vue);
