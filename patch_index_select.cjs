const fs = require('fs');
let indexCode = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

indexCode = indexCode.replace(
  /select: \{\s*id: true,\s*email: true,\s*name: true,\s*_count: \{ select: \{ staff: true, orders: true \} \},\s*\}/,
  `select: {
          id: true,
          email: true,
          name: true,
          isBlocked: true,
          createdAt: true,
          tariffId: true,
          tariff: true,
          paidUntil: true,
          paymentStatus: true,
          _count: { select: { staff: true, orders: true } },
        }`
);

fs.writeFileSync('daur-menu-backend/index.js', indexCode);
console.log('Patched index.js select fields');

