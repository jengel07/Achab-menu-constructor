const fs = require('fs');

let vue = fs.readFileSync('src/components/PhoneMockupContent.vue', 'utf8');

if (!vue.includes('ConciergeBell')) {
    // Add import statement for lucide icons
    const importRegex = /import SettingsbarForClient from '\.\/SettingsbarForClient\.vue';/;
    vue = vue.replace(importRegex, `import SettingsbarForClient from './SettingsbarForClient.vue';\nimport { ConciergeBell } from 'lucide-vue-next';`);
} else if (!vue.includes('import { ConciergeBell }')) {
    // It has ConciergeBell in template but no import
    const importRegex = /import SettingsbarForClient from '\.\/SettingsbarForClient\.vue';/;
    vue = vue.replace(importRegex, `import SettingsbarForClient from './SettingsbarForClient.vue';\nimport { ConciergeBell } from 'lucide-vue-next';`);
}

fs.writeFileSync('src/components/PhoneMockupContent.vue', vue);
