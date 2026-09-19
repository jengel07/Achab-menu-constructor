const fs = require('fs');
let content = fs.readFileSync('daur-menu-backend/prisma/schema.prisma', 'utf8');
if (content.charCodeAt(0) === 0xFEFF) {
  content = content.slice(1);
}
fs.writeFileSync('daur-menu-backend/prisma/schema.prisma', content);

