const fs = require('fs');
let code = fs.readFileSync('src/components/MyTariffContent.vue', 'utf8');

code = code.replace(/\\\$\\\{/g, '${');
code = code.replace(/\\\$\{/g, '${');
code = code.replace(/\\\`/g, '`');

fs.writeFileSync('src/components/MyTariffContent.vue', code);

