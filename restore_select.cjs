import fs from 'fs';

let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

const regex = /app\.get\('\/api\/superadmin\/restaurants', authMiddleware, superAdminOnly, async \(req, res\) => \{\n  try \{\n    const restaurants = await db\.restaurant\.findMany\(\{\n      select: \{\n        id: true,\n        email: true,\n        name: true,\n        _count: \{ select: \{ staff: true, orders: true \} \},\n      \},/;

const replacement = `app.get('/api/superadmin/restaurants', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const restaurants = await db.restaurant.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        createdAt: true,
        paidUntil: true,
        trialEndsAt: true,
        _count: { select: { staff: true, orders: true } },
      },`;

code = code.replace(regex, replacement);
fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Restored select fields');

