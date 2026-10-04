const fs = require('fs');

let vue = fs.readFileSync('src/views/ClientView.vue', 'utf8');

vue = vue.replace(
  /event\.key === 'generalSettings'/g,
  "event.key === 'generalSettings' ||\n      event.key === 'menu_order_mode' ||\n      !event.key // For manually dispatched storage events without a key"
);

fs.writeFileSync('src/views/ClientView.vue', vue);
