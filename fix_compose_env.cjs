const fs = require('fs');
let code = fs.readFileSync('docker-compose.yml', 'utf8');

code = code.replace(/\s*TELEGRAM_BOT_TOKEN: "\$\{TELEGRAM_BOT_TOKEN:-\}"\n/, '\n');
code = code.replace(/\s*TELEGRAM_CHAT_ID: "\$\{TELEGRAM_CHAT_ID:-\}"\n/, '\n');

fs.writeFileSync('docker-compose.yml', code);
console.log('Fixed docker-compose.yml environment overriding');

