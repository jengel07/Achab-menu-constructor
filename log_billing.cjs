import fs from 'fs';

let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

const regex = /app\.get\('\/api\/my-restaurant-billing', authMiddleware, async \(req, res\) => \{\n  try \{\n    const restaurant = await db\.restaurant\.findUnique\(\{[\s\S]*?\}\);\n    if \(\!restaurant\) return res\.status\(404\)\.json\(\{ error: 'Ресторан не найден' \}\);\n    res\.json\(restaurant\);\n  \} catch \(err\) \{\n    res\.status\(500\)\.json\(\{ error: err\.message \}\);\n  \}\n\}\);/;
const replacement = `app.get('/api/my-restaurant-billing', authMiddleware, async (req, res) => {
  try {
    console.log('[BILLING] Fetching for user:', req.user);
    const restaurant = await db.restaurant.findUnique({
      where: { id: req.user.restaurantId },
      select: { id: true, name: true, status: true, paidUntil: true, trialEndsAt: true, createdAt: true }
    });
    console.log('[BILLING] Result:', restaurant);
    if (!restaurant) return res.status(404).json({ error: 'Ресторан не найден' });
    res.json(restaurant);
  } catch (err) {
    console.error('[BILLING] Error:', err);
    res.status(500).json({ error: err.message });
  }
});`;

code = code.replace(regex, replacement);
fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Added logging to my-restaurant-billing');

