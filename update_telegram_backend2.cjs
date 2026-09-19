const fs = require('fs');

// --- UPDATE orders.js ---
let ordersCode = fs.readFileSync('daur-menu-backend/orders.js', 'utf8');

if (!ordersCode.includes("import { sendTelegramNotification } from './telegram.js';")) {
  ordersCode = "import { sendTelegramNotification } from './telegram.js';\n" + ordersCode;
}

// Replace order telegram logic
const orderSearch = `      // Отправка по Email (или HTML-версия Telegram, если это text)`;
const orderReplace = `      // Отправка Telegram
      if (restaurantData && restaurantData.telegramBotToken) {
        await sendTelegramNotification(restaurantData, 'order', orderText);
      }

      // Отправка по Email`;
ordersCode = ordersCode.replace(orderSearch, orderReplace);

// Remove old telegramWebhook logic for orders
const webhookRegex1 = /if \(settings\.notifType === 'telegram' && settings\.telegramWebhook\) \{[\s\S]*?\}\s*\}/;
ordersCode = ordersCode.replace(webhookRegex1, '');


// Replace feedback telegram logic
const feedbackRegex = /if \(settings\.notifType === 'telegram' && settings\.telegramWebhook\) \{[\s\S]*?body: JSON\.stringify\(\{\s*event: 'feedback',[\s\S]*?\}\)\s*\}\)\.catch[\s\S]*?\}\s*\}/;
const feedbackReplace = `      if (order.restaurant && order.restaurant.telegramBotToken) {
        const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
        const textMsg = \`📝 <b>Новый отзыв на заказ #\${order.orderNumber}</b>\\n\\nОценка: \${stars}\\nКомментарий: <i>\${feedback || 'Без текста'}</i>\`;
        await sendTelegramNotification(order.restaurant, 'review', textMsg);
      }`;
ordersCode = ordersCode.replace(feedbackRegex, feedbackReplace);

fs.writeFileSync('daur-menu-backend/orders.js', ordersCode);
console.log('Updated orders.js');


// --- UPDATE index.js ---
let indexCode = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

if (!indexCode.includes("import { sendTelegramNotification } from './telegram.js';")) {
  indexCode = indexCode.replace("import ordersRouter from './orders.js';", "import ordersRouter from './orders.js';\nimport { sendTelegramNotification } from './telegram.js';");
}

const waiterRegex = /if \(settings\.notifType === 'telegram' && settings\.telegramWebhook\) \{[\s\S]*?\}\s*\}/;
const waiterReplace = `    const restaurantData = await db.restaurant.findUnique({ where: { id: restaurantId } });
    if (restaurantData && restaurantData.telegramBotToken) {
      const message = \`🔔 <b>Вызов официанта!</b>\\nСтол №\${tableNumber}\\nЗапрос: \${callType}\`;
      await sendTelegramNotification(restaurantData, 'waiter', message);
    }`;

indexCode = indexCode.replace(waiterRegex, waiterReplace);
fs.writeFileSync('daur-menu-backend/index.js', indexCode);
console.log('Updated index.js');

