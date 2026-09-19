import fs from 'fs';

let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

// 1. Replace telegramNotify with bot
code = code.replace(/import \{ sendPaymentNotification \} from '\.\/telegramNotify\.js';\n/, "import './bot.js';\nimport { notifyPaymentApproved } from './bot.js';\n");

// 2. Remove /api/my-restaurant-billing/request
const requestRegex = /app\.post\('\/api\/my-restaurant-billing\/request'[\s\S]*?\}\);/;
code = code.replace(requestRegex, '');

// 3. Update confirm-payment endpoint to notify user
const confirmRegex = /newPaidUntil\.setMonth\(newPaidUntil\.getMonth\(\) \+ \(months \|\| 1\)\);[\s\S]*?await db\.restaurant\.update\(\{[\s\S]*?where: \{ id: restaurant\.id \},[\s\S]*?data: \{ status: 'ACTIVE', paidUntil: newPaidUntil \}[\s\S]*?\}\);/;

const confirmReplacement = `newPaidUntil.setMonth(newPaidUntil.getMonth() + (months || 1));

    await db.restaurant.update({
      where: { id: restaurant.id },
      data: { status: 'ACTIVE', paidUntil: newPaidUntil }
    });

    if (restaurant.ownerTelegramId) {
      notifyPaymentApproved(restaurant.ownerTelegramId);
    }`;

code = code.replace(confirmRegex, confirmReplacement);

// 4. Add Cron task for blocking
const cronCode = `
// ============================================================
// CRON TASKS
// ============================================================
cron.schedule('0 * * * *', async () => {
  try {
    console.log('[CRON] Проверка просроченных подписок...');
    const now = new Date();
    
    // Блокируем тех, у кого закончилась оплата (не TRIAL, ACTIVE/PENDING_PAYMENT, и paidUntil < now)
    const result = await db.restaurant.updateMany({
      where: {
        status: { in: ['ACTIVE', 'PENDING_PAYMENT'] },
        paidUntil: { lt: now },
        email: { not: SUPERADMIN_EMAIL }
      },
      data: { status: 'BLOCKED' }
    });
    
    // Блокируем TRIAL, у которых trialEndsAt < now
    const trialResult = await db.restaurant.updateMany({
      where: {
        status: 'TRIAL',
        trialEndsAt: { lt: now },
        email: { not: SUPERADMIN_EMAIL }
      },
      data: { status: 'BLOCKED' }
    });

    if (result.count > 0 || trialResult.count > 0) {
      console.log(\`[CRON] Заблокировано аккаунтов по истечению: \${result.count} (основные), \${trialResult.count} (триал)\`);
    }
  } catch (err) {
    console.error('[CRON] Ошибка при блокировке:', err.message);
  }
});
`;

if (!code.includes('CRON TASKS')) {
  code = code.replace(/app\.use\(express\.static\(path\.join\(__dirname, 'public'\)\)\);/, cronCode + "\napp.use(express.static(path.join(__dirname, 'public')));");
}

fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('index.js updated successfully');

