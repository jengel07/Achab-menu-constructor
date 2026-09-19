const fs = require('fs');
let code = fs.readFileSync('src/views/SuperAdminView.vue', 'utf8');

// There are probably two `const currentTab = ref(...);`
code = code.replace(/const currentTab = ref\('restaurants'\);\s*const currentTab = ref\('restaurants'\);/g, "const currentTab = ref('restaurants');");

fs.writeFileSync('src/views/SuperAdminView.vue', code);

