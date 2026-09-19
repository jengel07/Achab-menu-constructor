const fs = require('fs');
let code = fs.readFileSync('docker-compose.yml', 'utf8');

const appBlockOld = `  app:
    build: .
    container_name: daur_menu_app
    restart: always
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "postgresql://myuser:mypassword@db:5432/mydb?schema=public"
      DIRECT_URL: "postgresql://myuser:mypassword@db:5432/mydb?schema=public"
      JWT_SECRET: "my_super_secret_jwt_key_123"
      PORT: 3000
      FRONTEND_URL: "\${VITE_API_URL}"`;

const appBlockNew = `  app:
    build: .
    container_name: daur_menu_app
    restart: always
    ports:
      - "3000:3000"
    env_file:
      - ./daur-menu-backend/.env
    environment:
      DATABASE_URL: "postgresql://myuser:mypassword@db:5432/mydb?schema=public"
      DIRECT_URL: "postgresql://myuser:mypassword@db:5432/mydb?schema=public"
      JWT_SECRET: "my_super_secret_jwt_key_123"
      PORT: 3000
      FRONTEND_URL: "\${VITE_API_URL}"
      TELEGRAM_BOT_TOKEN: "\${TELEGRAM_BOT_TOKEN:-}"
      TELEGRAM_CHAT_ID: "\${TELEGRAM_CHAT_ID:-}"`;

code = code.replace(appBlockOld, appBlockNew);

fs.writeFileSync('docker-compose.yml', code);
console.log('Fixed docker-compose cleanly');

