const fs = require('fs');
let code = fs.readFileSync('daur-menu-backend/telegram.js', 'utf8');

code = code.replace(/\\\`/g, '`').replace(/\\\$/g, '$');

fs.writeFileSync('daur-menu-backend/telegram.js', code);
console.log('Fixed telegram.js syntax error');

