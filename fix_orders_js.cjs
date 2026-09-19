const fs = require('fs');

let ordersCode = fs.readFileSync('daur-menu-backend/orders.js', 'utf8');

const searchStr = `      const emailText = orderText.replace(/<[^>]+>/g, '');`;
const replaceStr = `      // Send to Telegram
      if (restaurantData && restaurantData.telegramBotToken) {
        await sendTelegramNotification(restaurantData, 'order', orderText);
      }

      const emailText = orderText.replace(/<[^>]+>/g, '');`;

if (!ordersCode.includes("await sendTelegramNotification(restaurantData, 'order', orderText);")) {
  ordersCode = ordersCode.replace(searchStr, replaceStr);
  fs.writeFileSync('daur-menu-backend/orders.js', ordersCode);
  console.log('Fixed orders.js for new orders');
} else {
  console.log('Already fixed');
}

