const fs = require('fs');
let code = fs.readFileSync('src/components/MyTariffContent.vue', 'utf8');

// Fix API_URL resolution
const fixUrl = `let API_URL = import.meta.env.VITE_API_URL;
    if (!API_URL) {
      API_URL = \`http://\${window.location.hostname}:3000\`;
    }`;

code = code.replace(/const API_URL = import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:3000';/g, fixUrl);

// Also add a fallback render if currentRestaurant is null but not loading
const fallbackHtml = `
    <div v-else class="error-notice">
      Ошибка загрузки данных тарифа.
    </div>
  </div>`;
code = code.replace(/<\/div>\s*<\/div>\s*<\/template>/, fallbackHtml + '\n</template>');

fs.writeFileSync('src/components/MyTariffContent.vue', code);
console.log('Fixed API_URL in MyTariffContent.vue');

