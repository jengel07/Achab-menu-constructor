const fs = require('fs');
let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

code = code.replace(/select:\s*\{[\s\S]*?_count:\s*\{\s*select:\s*\{\s*staff:\s*true,\s*orders:\s*true\s*\}\s*\},?\s*\}/, 
`select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          paidUntil: true,
          status: true,
          trialEndsAt: true,
          _count: { select: { staff: true, orders: true } },
        }`);

fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Fixed index.js select for superadmin');

