const fs = require('fs');
let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

// 1. Update /api/auth/register
code = code.replace(
  /const restaurant = await db\.restaurant\.create\(\{[\s\S]*?name: name \|\| '',[\s\S]*?\},?\s*\}\);/,
`const trialEnds = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      const restaurant = await db.restaurant.create({
        data: {
          email,
          password: hashedPassword,
          name: name || '',
          status: 'TRIAL',
          trialEndsAt: trialEnds,
        },
      });`
);

// 2. Add billing endpoints before app.listen
const billingEndpoints = `
// GET /api/my-restaurant-billing
app.get('/api/my-restaurant-billing', authMiddleware, async (req, res) => {
  try {
    const restaurant = await db.restaurant.findUnique({
      where: { id: req.user.restaurantId }
    });
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    
    res.json({
      status: restaurant.status,
      trialEndsAt: restaurant.trialEndsAt,
      paidUntil: restaurant.paidUntil,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch billing info' });
  }
});

// POST /api/my-restaurant-billing/request
app.post('/api/my-restaurant-billing/request', authMiddleware, async (req, res) => {
  try {
    const updated = await db.restaurant.update({
      where: { id: req.user.restaurantId },
      data: { status: 'PENDING_PAYMENT' }
    });
    res.json(updated);
  } catch(error) {
    res.status(500).json({ error: 'Failed to request payment' });
  }
});

// POST /api/superadmin/restaurants/:id/confirm-payment
app.post('/api/superadmin/restaurants/:id/confirm-payment', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const { months } = req.body;
    const restaurant = await db.restaurant.findUnique({ where: { id: req.params.id } });
    
    let currentPaidUntil = restaurant.paidUntil ? new Date(restaurant.paidUntil) : new Date();
    if (currentPaidUntil < new Date()) currentPaidUntil = new Date();
    
    currentPaidUntil.setMonth(currentPaidUntil.getMonth() + parseInt(months));
    
    const updated = await db.restaurant.update({
      where: { id: req.params.id },
      data: {
        paidUntil: currentPaidUntil,
        status: 'ACTIVE'
      }
    });
    res.json(updated);
  } catch(error) {
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});
`;

if (!code.includes('/api/my-restaurant-billing')) {
  code = code.replace(/app\.listen\(/, billingEndpoints + '\napp.listen(');
}

// 3. Update GET /api/superadmin/restaurants
// Replace the exact select block for GET /api/superadmin/restaurants ONLY.
const superAdminRestaurantsRegex = /(app\.get\('\/api\/superadmin\/restaurants'[\s\S]*?db\.restaurant\.findMany\(\{[\s\S]*?select:\s*\{)([\s\S]*?)(_count:\s*\{\s*select:\s*\{\s*staff:\s*true,\s*orders:\s*true\s*\}\s*\},?\s*\},?\s*orderBy)/;
code = code.replace(superAdminRestaurantsRegex, `$1
          id: true,
          email: true,
          name: true,
          createdAt: true,
          paidUntil: true,
          status: true,
          trialEndsAt: true,
          $3`);


fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Backend endpoints updated cleanly.');

