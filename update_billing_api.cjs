const fs = require('fs');
let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

// 1. Update /api/auth/register
const oldRegister = `const restaurant = await db.restaurant.create({
        data: {
          email,
          password: hashedPassword,
          name: name || '',
        },
      });`;
const newRegister = `
      const trialEnds = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      const restaurant = await db.restaurant.create({
        data: {
          email,
          password: hashedPassword,
          name: name || '',
          status: 'TRIAL',
          trialEndsAt: trialEnds,
        },
      });`;
code = code.replace(oldRegister, newRegister);

// 2. Update /api/my-restaurant-billing
const oldBilling = `app.get('/api/my-restaurant-billing', authMiddleware, async (req, res) => {
  try {
    const restaurant = await db.restaurant.findUnique({
      where: { id: req.user.restaurantId },
      include: { tariff: true }
    });
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    
    res.json({
      tariff: restaurant.tariff,
      tariffId: restaurant.tariffId,
      paidUntil: restaurant.paidUntil,
      paymentStatus: restaurant.paymentStatus
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch billing info' });
  }
});`;
const newBilling = `app.get('/api/my-restaurant-billing', authMiddleware, async (req, res) => {
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

// New endpoint to submit payment request from client
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

// New endpoint for SuperAdmin to confirm payment
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
code = code.replace(oldBilling, newBilling);

// 3. Update GET /api/superadmin/restaurants select logic
const oldSuperAdminSelect = `select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          tariffId: true,
          tariff: true,
          paidUntil: true,
          paymentStatus: true,
          _count: { select: { staff: true, orders: true } },
        }`;
const newSuperAdminSelect = `select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          paidUntil: true,
          status: true,
          trialEndsAt: true,
          _count: { select: { staff: true, orders: true } },
        }`;
code = code.replace(oldSuperAdminSelect, newSuperAdminSelect);

fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Backend endpoints updated for First Clients offer');

