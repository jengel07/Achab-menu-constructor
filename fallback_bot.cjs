import fs from 'fs';

let code = fs.readFileSync('daur-menu-backend/bot.js', 'utf8');

code = code.replace(/bot\.onText\(\/\^\\\/start REST_\(\.\+\)\$\/, async \(msg, match\) => \{/, 
`bot.onText(/^\\/start REST_(.+)$/, async (msg, match) => {`); // Just to ensure regex is clean

if (!code.includes("bot.onText(/^\\/start$/, ")) {
  const plainStartHandler = `
  // Обработка простого /start
  bot.onText(/^\\/start$/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Привет! Пожалуйста, начните процесс оплаты прямо из панели администратора (кнопка "Оплатить").');
  });
`;
  code = code.replace(/bot\.onText\(\/\\^\\\\\/start REST_\(\.\+\)\$\/, async \\(msg, match\\) => \\{/g, plainStartHandler + "\n  bot.onText(/^\\/start REST_(.+)$/, async (msg, match) => {");
}

fs.writeFileSync('daur-menu-backend/bot.js', code);
console.log('Added plain start fallback');

