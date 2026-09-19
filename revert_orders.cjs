const fs = require('fs');

let code = fs.readFileSync('daur-menu-backend/orders.js', 'utf8');

// 1. Revert order creation notification
const orderSearch = `      // Send to Telegram
      if (restaurantData && restaurantData.telegramBotToken) {
        await sendTelegramNotification(restaurantData, 'order', orderText);
      }`;
const orderReplace = `      if (settings.notifType === 'telegram' && settings.telegramWebhook) {
        let url = settings.telegramWebhook;
        
        if (url.includes('api.telegram.org') && url.includes('sendMessage')) {
          const separator = url.includes('?') ? '&' : '?';
          url = \`\${url}\${separator}text=\${encodeURIComponent(orderText)}&parse_mode=HTML\`;
          
          fetch(url)
            .then(r => r.json())
            .then(data => console.log('Telegram sent:', data.ok))
            .catch(e => console.error('Telegram error:', e));
        } else {
          fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: newOrder.orderNumber,
              type, customerName, customerPhone, address, tableNumber,
              total, text: orderText
            })
          }).catch(e => console.error('Webhook error:', e));
        }
      }`;
code = code.replace(orderSearch, orderReplace);

// 2. Revert feedback notification
const feedbackSearch = `      if (order.restaurant && order.restaurant.telegramBotToken) {
        const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
        const textMsg = \`📝 <b>Новый отзыв на заказ #\${order.orderNumber}</b>\\n\\nОценка: \${stars}\\nКомментарий: <i>\${feedback || 'Без текста'}</i>\`;
        await sendTelegramNotification(order.restaurant, 'review', textMsg);
      }`;
const feedbackReplace = `      if (settings.notifType === 'telegram' && settings.telegramWebhook) {
        let url = settings.telegramWebhook;
        
        const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
        const textMsg = \`📝 <b>Новый отзыв на заказ #\${order.orderNumber}</b>\\n\\nОценка: \${stars}\\nКомментарий: <i>\${feedback || 'Без текста'}</i>\`;
        
        if (url.includes('api.telegram.org') && url.includes('sendMessage')) {
          const separator = url.includes('?') ? '&' : '?';
          url = \`\${url}\${separator}text=\${encodeURIComponent(textMsg)}&parse_mode=HTML\`;
          
          fetch(url)
            .then(r => r.json())
            .then(data => console.log('Telegram feedback sent:', data.ok))
            .catch(e => console.error('Telegram error:', e));
        } else {
          fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'feedback',
              orderId: order.orderNumber,
              rating,
              feedback
            })
          }).catch(e => console.error('Webhook error:', e));
        }
      }`;
code = code.replace(feedbackSearch, feedbackReplace);

// 3. Remove import
code = code.replace(`import { sendTelegramNotification } from './telegram.js';\n`, '');

fs.writeFileSync('daur-menu-backend/orders.js', code);
console.log('Reverted orders.js');

