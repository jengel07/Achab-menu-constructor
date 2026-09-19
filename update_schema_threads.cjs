const fs = require('fs');
let schema = fs.readFileSync('daur-menu-backend/prisma/schema.prisma', 'utf8');

const regex = /telegramBotToken String\?\s+ordersChatId\s+String\?\s+waitersChatId\s+String\?\s+reviewsChatId\s+String\?/;
if (regex.test(schema)) {
  schema = schema.replace(regex, 'ordersThreadId String?\n  waitersThreadId String?\n  reviewsThreadId String?');
} else {
  schema = schema.replace('banners    PromotionBanner[]', 'banners    PromotionBanner[]\n  ordersThreadId String?\n  waitersThreadId String?\n  reviewsThreadId String?');
}

fs.writeFileSync('daur-menu-backend/prisma/schema.prisma', schema);
console.log('Schema updated with thread IDs');

