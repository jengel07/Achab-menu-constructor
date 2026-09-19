import fs from 'fs';

let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

const regex = /select: \{\s*id: true,\s*email: true,\s*name: true,\s*_count: \{ select: \{ staff: true, orders: true \} \},\s*\}/;

const replacement = `select: {
          id: true,
          email: true,
          name: true,
          status: true,
          paidUntil: true,
          trialEndsAt: true,
          createdAt: true,
          _count: { select: { staff: true, orders: true } },
        }`;

code = code.replace(regex, replacement);

fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Fixed GET restaurants');

