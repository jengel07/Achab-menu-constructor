import fs from 'fs';

let vue = fs.readFileSync('src/Constructor.vue', 'utf8');

vue = vue.replace('@click="isMobileSidebarOpen = true"', '@click="isMobileSidebarOpen = true; isMenuOpen = false"');
vue = vue.replace('@click="isMenuOpen = true"', '@click="isMenuOpen = true; isMobileSidebarOpen = false"');

fs.writeFileSync('src/Constructor.vue', vue);

