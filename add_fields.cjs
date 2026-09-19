const fs = require('fs');
let schema = fs.readFileSync('daur-menu-backend/prisma/schema.prisma', 'utf8');

schema = schema.replace(
  /  createdAt       DateTime          @default\(now\(\)\)/,
  `  createdAt       DateTime          @default(now())
  status          String            @default("TRIAL")
  trialEndsAt     DateTime?`
);

fs.writeFileSync('daur-menu-backend/prisma/schema.prisma', schema);

