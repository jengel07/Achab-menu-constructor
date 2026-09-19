const fs = require('fs');

const schemaPath = 'daur-menu-backend/prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

if (!schema.includes('status          String    @default("TRIAL")')) {
  schema = schema.replace(
  /  paidUntil       DateTime\?/,
  `  paidUntil       DateTime?
  status          String    @default("TRIAL")
  trialEndsAt     DateTime?`
  );
  fs.writeFileSync(schemaPath, schema);
}
console.log('Schema patched additively');

