const fs = require('fs');

let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

code = code.replace(/import \{ sendPaymentNotification \} from '\.\/telegramNotify\.js';/g, "import './bot.js';\nimport { notifyPaymentApproved } from './bot.js';");

fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Fixed imports');
