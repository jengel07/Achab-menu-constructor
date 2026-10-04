const fs = require('fs');

let vue = fs.readFileSync('src/views/ClientView.vue', 'utf8');

vue = vue.replace(
  /@update:searchQuery="val => searchQuery = val"/g,
  '@update:searchQuery="val => searchQuery = val"\n          @call-waiter="openCallWaiterModalFromCart"'
);

fs.writeFileSync('src/views/ClientView.vue', vue);

