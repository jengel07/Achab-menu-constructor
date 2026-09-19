const fs = require('fs');
let code = fs.readFileSync('docker-compose.yml', 'utf8');

code = code.replace(/environment:\s*\n[\s\S]*?FRONTEND_URL:[^\n]*\n/, 
`env_file:
      - ./daur-menu-backend/.env
    environment:
      DATABASE_URL: "postgresql://myuser:mypassword@db:5432/mydb?schema=public"
      DIRECT_URL: "postgresql://myuser:mypassword@db:5432/mydb?schema=public"
      JWT_SECRET: "my_super_secret_jwt_key_123"
      PORT: 3000
      FRONTEND_URL: "\${VITE_API_URL}"
      TELEGRAM_BOT_TOKEN: "\${TELEGRAM_BOT_TOKEN:-}"
      TELEGRAM_CHAT_ID: "\${TELEGRAM_CHAT_ID:-}"
`);

fs.writeFileSync('docker-compose.yml', code);
console.log('Updated docker-compose to use env_file');

