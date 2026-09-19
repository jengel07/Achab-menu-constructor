import fs from 'fs';

let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

// 1. Fix the select for /api/superadmin/restaurants
const oldSelect = `select: {
          id: true,
          email: true,
          name: true,
          _count: { select: { staff: true, orders: true } },
        },`;
const newSelect = `select: {
          id: true,
          email: true,
          name: true,
          status: true,
          paidUntil: true,
          trialEndsAt: true,
          createdAt: true,
          _count: { select: { staff: true, orders: true } },
        },`;
if (code.includes(oldSelect)) {
  code = code.replace(oldSelect, newSelect);
}

// 2. Re-add the confirm-payment endpoint if missing
if (!code.includes('confirm-payment')) {
  const confirmEndpoint = `
// POST /api/superadmin/restaurants/:id/confirm-payment
app.post('/api/superadmin/restaurants/:id/confirm-payment', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const restaurant = await db.restaurant.findUnique({ where: { id: req.params.id } });
    if (!restaurant) return res.status(404).json({ error: 'Ресторан не найден' });

    // Оплата строго на 30 дней от текущего момента
    const newPaidUntil = new Date();
    newPaidUntil.setDate(newPaidUntil.getDate() + 30);

    await db.restaurant.update({
      where: { id: restaurant.id },
      data: { status: 'ACTIVE', paidUntil: newPaidUntil }
    });

    if (restaurant.ownerTelegramId && typeof notifyPaymentApproved === 'function') {
      notifyPaymentApproved(restaurant.ownerTelegramId);
    }

    res.json({ success: true, paidUntil: newPaidUntil });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
`;
  code = code.replace(/app\.post\('\/api\/superadmin\/restaurants\/:id\/toggle-block'/, confirmEndpoint + "\napp.post('/api/superadmin/restaurants/:id/toggle-block'");
}

fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Fixed superadmin API');

