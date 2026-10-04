const fs = require('fs');

let schema = fs.readFileSync('daur-menu-backend/prisma/schema.prisma', 'utf8');

if (!schema.includes('orderMode')) {
    schema = schema.replace('general_settings String?', 'general_settings String?\n  orderMode        String     @default("ORDER")');
    fs.writeFileSync('daur-menu-backend/prisma/schema.prisma', schema);
}
