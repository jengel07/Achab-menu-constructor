const fs = require('fs');
let code = fs.readFileSync('docker-compose.yml', 'utf8');

code = code.replace(/(\s*app:[\s\S]*?FRONTEND_URL:[^\n]*\n)/,
`$1      TELEGRAM_BOT_TOKEN: "\${TELEGRAM_BOT_TOKEN:-}"
      TELEGRAM_CHAT_ID: "\${TELEGRAM_CHAT_ID:-}"
`);

if (!code.includes('env_file:')) {
  code = code.replace(/(\s*app:[\s\S]*?restart:[^\n]*\n)/, 
`$1    env_file:
      - ./daur-menu-backend/.env
`);
}

fs.writeFileSync('docker-compose.yml', code);
console.log('Fixed docker-compose regex');

