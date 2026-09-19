import fs from 'fs';

let code = fs.readFileSync('daur-menu-backend/bot.js', 'utf8');

code = code.replace(/import TelegramBot from 'node-telegram-bot-api';/, "import { createRequire } from 'module';\nconst require = createRequire(import.meta.url);\nconst TelegramBot = require('node-telegram-bot-api');");

fs.writeFileSync('daur-menu-backend/bot.js', code);
console.log('Fixed bot import');

