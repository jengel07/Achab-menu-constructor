const fs = require('fs');

let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

// 1. Update GET
const getSearch = `    const menuRecord = await db.menu.findFirst({`;
const getReplace = `    const restaurant = await db.restaurant.findUnique({ where: { id: req.params.restaurantId } });
    const menuRecord = await db.menu.findFirst({`;
code = code.replace(getSearch, getReplace);

const getResponseSearch = `    res.json({
      restaurantInfo: {
        ...(menuRecord?.info ? JSON.parse(menuRecord.info) : {}),
        id: req.params.restaurantId
      },`;
const getResponseReplace = `    const parsedInfo = menuRecord?.info ? JSON.parse(menuRecord.info) : {};
    parsedInfo.orderSettings = parsedInfo.orderSettings || {};
    if (restaurant) {
      parsedInfo.orderSettings.ordersThreadId = restaurant.ordersThreadId || '';
      parsedInfo.orderSettings.waitersThreadId = restaurant.waitersThreadId || '';
      parsedInfo.orderSettings.reviewsThreadId = restaurant.reviewsThreadId || '';
    }

    res.json({
      restaurantInfo: {
        ...parsedInfo,
        id: req.params.restaurantId
      },`;
code = code.replace(getResponseSearch, getResponseReplace);

// 2. Update POST
const postSearch = `      if (Object.keys(menuUpdateData).length > 0) {`;
const postReplace = `      if (info && info.orderSettings) {
        await tx.restaurant.update({
          where: { id: restaurantId },
          data: {
            ordersThreadId: info.orderSettings.ordersThreadId !== undefined ? info.orderSettings.ordersThreadId : undefined,
            waitersThreadId: info.orderSettings.waitersThreadId !== undefined ? info.orderSettings.waitersThreadId : undefined,
            reviewsThreadId: info.orderSettings.reviewsThreadId !== undefined ? info.orderSettings.reviewsThreadId : undefined
          }
        });
      }

      if (Object.keys(menuUpdateData).length > 0) {`;
code = code.replace(postSearch, postReplace);

// 3. Update call-waiter endpoint
const waiterSearch = `    if (settings.notifType === 'telegram' && settings.telegramWebhook) {
      let url = settings.telegramWebhook;
      
      const message = \`🔔 <b>Вызов официанта!</b>\\nСтол №\${tableNumber}\\nЗапрос: \${callType}\`;
      
      if (url.includes('api.telegram.org') && url.includes('sendMessage')) {
        const urlObj = new URL(url);
        urlObj.searchParams.set('text', message);
        urlObj.searchParams.set('parse_mode', 'HTML');
        
        fetch(urlObj.toString(), { method: 'GET' })`;

const waiterReplace = `    const restaurantData = await db.restaurant.findUnique({ where: { id: restaurantId } });
    if (settings.notifType === 'telegram' && settings.telegramWebhook) {
      let url = settings.telegramWebhook;
      
      const message = \`🔔 <b>Вызов официанта!</b>\\nСтол №\${tableNumber}\\nЗапрос: \${callType}\`;
      
      if (url.includes('api.telegram.org') && url.includes('sendMessage')) {
        const urlObj = new URL(url);
        urlObj.searchParams.set('text', message);
        urlObj.searchParams.set('parse_mode', 'HTML');
        
        if (restaurantData && restaurantData.waitersThreadId) {
          urlObj.searchParams.set('message_thread_id', restaurantData.waitersThreadId);
        }
        
        fetch(urlObj.toString(), { method: 'GET' })`;

code = code.replace(waiterSearch, waiterReplace);

fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('index.js updated with Thread IDs');

