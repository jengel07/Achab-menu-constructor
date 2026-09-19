const fs = require('fs');

const schemaPath = 'daur-menu-backend/prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

// Replace Restaurant billing fields
schema = schema.replace(
/  tariffId[\s\S]*?paymentRequests PaymentRequest\[\]/,
`  status          String    @default("TRIAL")
  trialEndsAt     DateTime?
  paidUntil       DateTime?`
);

// Remove Tariff and PaymentRequest models
schema = schema.replace(/model Tariff \{[\s\S]*?\}\n/, '');
schema = schema.replace(/model PaymentRequest \{[\s\S]*?\}\n/, '');

fs.writeFileSync(schemaPath, schema);
console.log('Schema simplified for First Clients offer');

