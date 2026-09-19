const fs = require('fs');
const path = 'daur-menu-backend/index.js';
let code = fs.readFileSync(path, 'utf8');

const regex = /const restaurant = await db\.restaurant\.findUnique\(\{\s*where: \{ id: restaurantId \}\s*\}\);[\s\S]*?if \(global\.io\)/m;

const newTelegramLogic = `
    const menu = await db.menu.findFirst({ where: { restaurantId } });
    const info = menu?.info ? JSON.parse(menu.info) : {};
    const settings = info.orderSettings || {};

    if (settings.notifType === 'telegram' && settings.telegramWebhook) {
      let url = settings.telegramWebhook;
      
      const message = \`🔔 <b>Вызов официанта!</b>\\nСтол №\${tableNumber}\\nЗапрос: \${callType}\`;
      
      if (url.includes('api.telegram.org') && url.includes('sendMessage')) {
        const urlObj = new URL(url);
        urlObj.searchParams.set('text', message);
        urlObj.searchParams.set('parse_mode', 'HTML');
        
        fetch(urlObj.toString(), { method: 'GET' })
          .then(res => res.json())
          .then(data => console.log('Telegram waiter call sent:', data.ok))
          .catch(e => console.error('Telegram error:', e));
      }
    }

    if (global.io)`;

if (code.match(regex)) {
  code = code.replace(regex, newTelegramLogic);
  fs.writeFileSync(path, code);
  console.log('Fixed telegram logic.');
} else {
  console.log('Could not find telegram logic to replace.');
}

