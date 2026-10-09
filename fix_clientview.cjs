const fs = require('fs');
let vue = fs.readFileSync('src/views/ClientView.vue', 'utf8');

const regex = /let API_URL = \(import\.meta as any\)\.env\.VITE_API_URL;[\s\S]*?API_URL = `http:\/\/\$\{hostIP\}:3000`;\s*\}/;

const replacement = `let API_URL = import.meta.env.VITE_API_URL || '';
const isLocal = /^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$/.test(window.location.hostname) || window.location.hostname === 'localhost';
if (!import.meta.env.VITE_API_URL && isLocal) {
  API_URL = \`http://\${window.location.hostname}:3000\`;
}`;

if (regex.test(vue)) {
  vue = vue.replace(regex, replacement);
  fs.writeFileSync('src/views/ClientView.vue', vue);
  console.log('Fixed ClientView.vue');
} else {
  console.log('Regex did not match in ClientView.vue');
}
