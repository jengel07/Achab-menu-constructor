const fs = require('fs');

let file = fs.readFileSync('src/components/SettingsbarForClient.vue', 'utf8');
file = file.replace(/viewMode: 'list' \| 'grid'/g, "viewMode: 'list' | 'grid' | 'full'");
fs.writeFileSync('src/components/SettingsbarForClient.vue', file);

let cstr = fs.readFileSync('src/Constructor.vue', 'utf8');
cstr = cstr.replace(/const savePaymentSettings = \(\) => \{[\s\S]*?\}\s*catch[\s\S]*?\}\r?\n\};\r?\n/g, '');
fs.writeFileSync('src/Constructor.vue', cstr);

console.log('Fixed SettingsbarForClient');
