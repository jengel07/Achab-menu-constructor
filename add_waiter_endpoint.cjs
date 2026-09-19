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
      return res.status(429).json({ error: 'Too many requests. Please wait 3 minutes.' });
    }

    callWaiterLocks.set(lockKey, now);

    const restaurant = await prisma.restaurant.findUnique({
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
  // Insert before the error handling middleware
  code = code.replace(/app\.use\(\(err,\s*req,\s*res,\s*next\)\s*=>\s*\{/, callWaiterCode + '\napp.use((err, req, res, next) => {');
  fs.writeFileSync(path, code);
  console.log('Added /api/call-waiter to backend.');
} else {
  console.log('/api/call-waiter already exists.');
}

