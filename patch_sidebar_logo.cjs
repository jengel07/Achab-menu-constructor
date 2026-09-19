const fs = require('fs');
let code = fs.readFileSync('src/Constructor.vue', 'utf8');

code = code.replace(
  /<span class="smenu-header-title">{{ sidebarTitle }}<\/span>/,
  `<span class="smenu-header-title">
            <img v-if="sidebarView === 'main'" :src="isLightTheme ? '/logo-light.png' : '/logo-dark.png'" alt="Achab" style="height: 24px; object-fit: contain; margin: 0;" />
            <template v-else>{{ sidebarTitle }}</template>
          </span>`
);

fs.writeFileSync('src/Constructor.vue', code);
console.log('Patched sidebar title');

