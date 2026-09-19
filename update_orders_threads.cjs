const fs = require('fs');
let code = fs.readFileSync('daur-menu-backend/orders.js', 'utf8');

const orderSearch = `      if (settings.notifType === 'telegram' && settings.telegramWebhook) {
        let url = settings.telegramWebhook;
        
        if (url.includes('api.telegram.org') && url.includes('sendMessage')) {
          const separator = url.includes('?') ? '&' : '?';
          url = \`\${url}\${separator}text=\${encodeURIComponent(orderText)}&parse_mode=HTML\`;
          
          fetch(url)`;
          
const orderReplace = `      if (settings.notifType === 'telegram' && settings.telegramWebhook) {
        let url = settings.telegramWebhook;
        
        if (url.includes('api.telegram.org') && url.includes('sendMessage')) {
          const urlObj = new URL(url);
          urlObj.searchParams.set('text', orderText);
          urlObj.searchParams.set('parse_mode', 'HTML');
          
          if (restaurantData && restaurantData.ordersThreadId) {
            urlObj.searchParams.set('message_thread_id', restaurantData.ordersThreadId);
          }
          
          url = urlObj.toString();
          
          fetch(url)`;
          
code = code.replace(orderSearch, orderReplace);

const feedbackSearch = `      if (settings.notifType === 'telegram' && settings.telegramWebhook) {
        let url = settings.telegramWebhook;
        
        const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
        const textMsg = \`📝 <b>Новый отзыв на заказ #\${order.orderNumber}</b>\\n\\nОценка: \${stars}\\nКомментарий: <i>\${feedback || 'Без текста'}</i>\`;
        
        if (url.includes('api.telegram.org') && url.includes('sendMessage')) {
          const separator = url.includes('?') ? '&' : '?';
          url = \`\${url}\${separator}text=\${encodeURIComponent(textMsg)}&parse_mode=HTML\`;
          
          fetch(url)`;

const feedbackReplace = `      if (settings.notifType === 'telegram' && settings.telegramWebhook) {
        let url = settings.telegramWebhook;
        
        const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
        const textMsg = \`📝 <b>Новый отзыв на заказ #\${order.orderNumber}</b>\\n\\nОценка: \${stars}\\nКомментарий: <i>\${feedback || 'Без текста'}</i>\`;
        
        if (url.includes('api.telegram.org') && url.includes('sendMessage')) {
          const urlObj = new URL(url);
          urlObj.searchParams.set('text', textMsg);
          urlObj.searchParams.set('parse_mode', 'HTML');
          
          if (order.restaurant && order.restaurant.reviewsThreadId) {
            urlObj.searchParams.set('message_thread_id', order.restaurant.reviewsThreadId);
          }
          
          url = urlObj.toString();
          
          fetch(url)`;

code = code.replace(feedbackSearch, feedbackReplace);

fs.writeFileSync('daur-menu-backend/orders.js', code);
console.log('orders.js updated with Thread IDs');

