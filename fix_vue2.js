import fs from 'fs';

let vueCode = fs.readFileSync('src/views/SuperAdminView.vue', 'utf8');

vueCode = vueCode.replace(/\{\{\s*res\.isBlocked \? '[^']*' : '[^']*'\s*\}\}/, "{{ res.status === 'BLOCKED' ? 'Да' : 'Нет' }}");
// Also verify toggleBlock
vueCode = vueCode.replace(/if \(confirm\(currentlyBlocked \? '.*?разблокировать.*?' : '.*?заблокировать.*?'\)\) \{/i, "if (confirm(currentlyBlocked ? 'Разблокировать этот аккаунт?' : 'Заблокировать этот аккаунт?')) {");

fs.writeFileSync('src/views/SuperAdminView.vue', vueCode);
console.log('Fixed text');

