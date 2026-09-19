import fs from 'fs';

// 1. Backend index.js
let backendCode = fs.readFileSync('daur-menu-backend/index.js', 'utf8');
backendCode = backendCode.replace(/\/api\/my-restaurant-billing/g, '/api/my-restaurant-status');
fs.writeFileSync('daur-menu-backend/index.js', backendCode);

// 2. Frontend Constructor.vue
let constructorCode = fs.readFileSync('src/Constructor.vue', 'utf8');
constructorCode = constructorCode.replace(/\/api\/my-restaurant-billing/g, '/api/my-restaurant-status');
fs.writeFileSync('src/Constructor.vue', constructorCode);

// 3. Frontend MyTariffContent.vue
let tariffCode = fs.readFileSync('src/components/MyTariffContent.vue', 'utf8');
tariffCode = tariffCode.replace(/\/api\/my-restaurant-billing/g, '/api/my-restaurant-status');
fs.writeFileSync('src/components/MyTariffContent.vue', tariffCode);

console.log('Renamed billing to status to bypass adblockers');

