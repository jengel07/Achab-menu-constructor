const fs = require('fs');
let code = fs.readFileSync('src/views/SuperAdminView.vue', 'utf8');

code = code.replace(/const currentTab = ref\('restaurants'\);\r?\nconst paymentRequests/, 'const paymentRequests');

fs.writeFileSync('src/views/SuperAdminView.vue', code);

