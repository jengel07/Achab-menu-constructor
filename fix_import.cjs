const fs = require('fs');
let code = fs.readFileSync('src/views/SuperAdminView.vue', 'utf8');

const doubleImport = `import { ref, computed, onMounted } from 'vue';

const currentTab = ref('restaurants');`;

code = code.replace(doubleImport, "const currentTab = ref('restaurants');");
fs.writeFileSync('src/views/SuperAdminView.vue', code);
