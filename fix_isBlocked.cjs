const fs = require('fs');
let indexCode = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

indexCode = indexCode.replace(/isBlocked:\s*true,/g, '');

fs.writeFileSync('daur-menu-backend/index.js', indexCode);

