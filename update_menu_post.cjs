const fs = require('fs');
let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

const searchStr = 'if (Object.keys(menuUpdateData).length > 0) {';
const replaceStr = `      // Extract telegram settings from info.orderSettings if they exist
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

code = code.replace(searchStr, replaceStr);
fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Updated /api/menu/:restaurantId');

