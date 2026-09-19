const fs = require('fs');

const schemaPath = 'daur-menu-backend/prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

// Check if Tariff already exists
if (!schema.includes('model Tariff')) {
  // Add tariff fields to Restaurant
  const restaurantBlock = `  ordersThreadId String?
  waitersThreadId String?
  reviewsThreadId String?
  tariffId        String?
  tariff          Tariff?   @relation(fields: [tariffId], references: [id], onDelete: SetNull)
  paidUntil       DateTime?
  paymentStatus   String    @default("trial")
  paymentRequests PaymentRequest[]`;
  
  schema = schema.replace(/  ordersThreadId String\?\r?\n  waitersThreadId String\?\r?\n  reviewsThreadId String\?/, restaurantBlock);
  
  const tariffModels = `
model Tariff {
  id                 String   @id @default(uuid())
  name               String
  pricePerMonth      Float
  pricePer6Months    Float?
  pricePerYear       Float?
  features           String?  @db.Text
  paymentInstruction String?  @db.Text
  restaurants        Restaurant[]
  paymentRequests    PaymentRequest[]
}

model PaymentRequest {
  id           String     @id @default(uuid())
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  tariffId     String
  tariff       Tariff     @relation(fields: [tariffId], references: [id])
  amount       Float
  months       Int
  status       String     @default("pending")
  createdAt    DateTime   @default(now())
}
`;

  schema += tariffModels;
  fs.writeFileSync(schemaPath, schema);
  console.log("Schema updated.");
} else {
  console.log("Tariff already in schema.");
}
