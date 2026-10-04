import fs from 'fs';

let vue = fs.readFileSync('src/views/ClientView.vue', 'utf8');

vue = vue.replace(
  `tableNumber: urlParams.get('table') || savedForm.tableNumber || '',`,
  `tableNumber: new URLSearchParams(window.location.search).get('table') || savedForm.tableNumber || '',`
);

fs.writeFileSync('src/views/ClientView.vue', vue);

