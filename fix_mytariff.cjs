const fs = require('fs');

let code = fs.readFileSync('src/components/MyTariffContent.vue', 'utf8');

const regex = /let API_URL = import\.meta\.env\.VITE_API_URL;\n\s*if \(\!API_URL\) \{\n\s*API_URL = `http:\/\/\$\{window\.location\.hostname\}:3000`;\n\s*\}/m;
const replacement = `let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      if (!API_URL || /^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$/.test(window.location.hostname) || window.location.hostname === 'localhost') {
        API_URL = \`http://\${window.location.hostname}:3000\`;
      }`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/MyTariffContent.vue', code);
console.log('Fixed API_URL in MyTariffContent');
