const fs = require('fs');
let code = fs.readFileSync('src/views/SuperAdminView.vue', 'utf8');

// The file was written properly by write_to_file but with literal \$. We just need to remove the \ before $
code = code.replace(/\\\$\\\{/g, '${');
code = code.replace(/\\\$\{/g, '${');
code = code.replace(/\\\`/g, '`');

fs.writeFileSync('src/views/SuperAdminView.vue', code);

