const fs = require('fs');
let code = fs.readFileSync('daur-menu-backend/orders.js', 'utf8');

code = code.replace(
  /\.then\(data => console\.log\('Telegram sent:', data\.ok\)\)/g,
  `.then(data => console.log('Telegram sent:', data.ok, data))`
);

fs.writeFileSync('daur-menu-backend/orders.js', code);
console.log('Patched orders.js for logging');

