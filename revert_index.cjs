const fs = require('fs');

let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

// 1. Revert GET
code = code.replace(`    const restaurant = await db.restaurant.findUnique({ where: { id: req.params.restaurantId } });\n    const menuRecord = await db.menu.findFirst({`, `    const menuRecord = await db.menu.findFirst({`);

const getSearch = `    const parsedInfo = menuRecord?.info ? JSON.parse(menuRecord.info) : {};
    parsedInfo.orderSettings = parsedInfo.orderSettings || {};
    if (restaurant) {
      parsedInfo.orderSettings.telegramBotToken = restaurant.telegramBotToken || '';
      parsedInfo.orderSettings.ordersChatId = restaurant.ordersChatId || '';
      parsedInfo.orderSettings.waitersChatId = restaurant.waitersChatId || '';
      parsedInfo.orderSettings.reviewsChatId = restaurant.reviewsChatId || '';
    }

    res.json({
      restaurantInfo: {
        ...parsedInfo,
        id: req.params.restaurantId
      },`;
const getReplace = `    res.json({
      restaurantInfo: {
        ...(menuRecord?.info ? JSON.parse(menuRecord.info) : {}),
        id: req.params.restaurantId
      },`;
code = code.replace(getSearch, getReplace);


// 2. Revert POST
const postSearch = `      // Extract telegram settings from info.orderSettings if they exist
      if (info && info.orderSettings) {
        await tx.restaurant.update({
          where: { id: restaurantId },
          data: {
            telegramBotToken: info.orderSettings.telegramBotToken !== undefined ? info.orderSettings.telegramBotToken : undefined,
            ordersChatId: info.orderSettings.ordersChatId !== undefined ? info.orderSettings.ordersChatId : undefined,
            waitersChatId: info.orderSettings.waitersChatId !== undefined ? info.orderSettings.waitersChatId : undefined,
            reviewsChatId: info.orderSettings.reviewsChatId !== undefined ? info.orderSettings.reviewsChatId : undefined
          }
        });
      }

      if (Object.keys(menuUpdateData).length > 0) {`;
const postReplace = `      if (Object.keys(menuUpdateData).length > 0) {`;
code = code.replace(postSearch, postReplace);


// 3. Revert call-waiter
const waiterSearch = `    const restaurantData = await db.restaurant.findUnique({ where: { id: restaurantId } });
    if (restaurantData && restaurantData.telegramBotToken) {
      const message = \`🔔 <b>Вызов официанта!</b>\\nСтол №\${tableNumber}\\nЗапрос: \${callType}\`;
      await sendTelegramNotification(restaurantData, 'waiter', message);
    }`;

const waiterReplace = `    const menu = await db.menu.findFirst({ where: { restaurantId } });
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
    }`;

code = code.replace(waiterSearch, waiterReplace);

// 4. Remove sendTelegramNotification import
code = code.replace(`import { sendTelegramNotification } from './telegram.js';\n`, '');

fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Reverted index.js');

