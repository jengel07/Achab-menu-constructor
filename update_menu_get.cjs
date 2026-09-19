const fs = require('fs');
let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

const searchStr = `    try {
    const menuRecord = await db.menu.findFirst({`;
const replaceStr = `    try {
    const restaurant = await db.restaurant.findUnique({ where: { id: req.params.restaurantId } });
    const menuRecord = await db.menu.findFirst({`;

code = code.replace(searchStr, replaceStr);

const searchStr2 = `    res.json({
      restaurantInfo: {
        ...(menuRecord?.info ? JSON.parse(menuRecord.info) : {}),
        id: req.params.restaurantId
      },`;
const replaceStr2 = `    const parsedInfo = menuRecord?.info ? JSON.parse(menuRecord.info) : {};
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

code = code.replace(searchStr2, replaceStr2);

fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Updated GET /api/menu/:restaurantId');

