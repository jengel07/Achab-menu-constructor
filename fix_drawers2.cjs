import fs from 'fs';

let vue = fs.readFileSync('src/Constructor.vue', 'utf8');

vue = vue.replace(/@click="isMobileSidebarOpen = true"/g, '@click="isMobileSidebarOpen = true; isMenuOpen = false"');
vue = vue.replace(/@click="isMenuOpen = true"/g, '@click="isMenuOpen = true; isMobileSidebarOpen = false"');

fs.writeFileSync('src/Constructor.vue', vue);

