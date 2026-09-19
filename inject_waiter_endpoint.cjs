const fs = require('fs');
const path = 'daur-menu-backend/index.js';
let code = fs.readFileSync(path, 'utf8');

const callWaiterCode = `
// --- WAITER CALL FEATURE ---
const callWaiterLocks = new Map();

app.post('/api/call-waiter', async (req, res) => {
  try {
    const { restaurantId, tableNumber, callType } = req.body;
    if (!restaurantId || !tableNumber || !callType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const lockKey = \`\${restaurantId}_\${tableNumber}\`;
    const now = Date.now();
    const lastCall = callWaiterLocks.get(lockKey);

    if (lastCall && (now - lastCall < 180000)) {
      return res.status(429).json({ error: 'Слишком частые запросы. Подождите 3 минуты.' });
    }

    callWaiterLocks.set(lockKey, now);

    const restaurant = await db.restaurant.findUnique({
      where: { id: restaurantId }
    });

    if (restaurant && restaurant.telegramBotToken && restaurant.telegramChatId) {
      const message = \`🔔 Вызов официанта!\\nСтол №\${tableNumber}\\nЗапрос: \${callType}\`;
      try {
        await fetch(\`https://api.telegram.org/bot\${restaurant.telegramBotToken}/sendMessage\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: restaurant.telegramChatId,
            text: message,
          }),
        });
      } catch (err) {
        console.error('Telegram notification error:', err);
      }
    }

    if (global.io) {
      global.io.to(restaurantId).emit('waiter_call', {
        tableNumber,
        callType,
        timestamp: new Date()
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error calling waiter:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// ---------------------------
`;

if (!code.includes('/api/call-waiter')) {
  const insertTarget = "// Отдача статики фронтенда";
  code = code.replace(insertTarget, callWaiterCode + '\n' + insertTarget);
  fs.writeFileSync(path, code);
  console.log('Successfully injected /api/call-waiter.');
} else {
  console.log('/api/call-waiter already exists.');
}

