import fs from 'fs';

let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

// 1. Add bot imports
if (!code.includes('import \'./bot.js\';')) {
  code = code.replace(/import db from '\.\/db\.js';/, "import db from './db.js';\nimport './bot.js';\nimport { notifyPaymentApproved } from './bot.js';\nimport cron from 'node-cron';");
}

// 2. Add CRON job at the bottom
if (!code.includes('CRON TASKS')) {
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
  code = code.replace(/app\.use\(express\.static\(path\.join\(__dirname, 'public'\)\)\);/, cronCode + "\napp.use(express.static(path.join(__dirname, 'public')));");
}

// 3. Fix confirm-payment
const oldConfirm = /app\.post\('\/api\/superadmin\/restaurants\/:id\/confirm-payment', authMiddleware, superAdminOnly, async \(req, res\) => {[\s\S]*?res\.json\(\{ success: true, paidUntil: newPaidUntil \}\);\n  \} catch \(err\) {/m;
const newConfirm = `app.post('/api/superadmin/restaurants/:id/confirm-payment', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const restaurant = await db.restaurant.findUnique({ where: { id: req.params.id } });
    if (!restaurant) return res.status(404).json({ error: 'Ресторан не найден' });

    // Оплата строго на 30 дней от текущего момента (согласно требованиям)
    const newPaidUntil = new Date();
    newPaidUntil.setDate(newPaidUntil.getDate() + 30);

    await db.restaurant.update({
      where: { id: restaurant.id },
      data: { status: 'ACTIVE', paidUntil: newPaidUntil }
    });

    if (restaurant.ownerTelegramId) {
      notifyPaymentApproved(restaurant.ownerTelegramId);
    }

    res.json({ success: true, paidUntil: newPaidUntil });
  } catch (err) {`;
code = code.replace(oldConfirm, newConfirm);

fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Restored and patched index.js successfully');

