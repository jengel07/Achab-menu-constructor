const fs = require('fs');


const files = [
  'src/api.ts',
  'src/Constructor.vue',
  'src/views/ClientView.vue',
  'src/views/SuperAdminView.vue',
  'src/components/MenuEditor.vue',
  'src/components/MyTariffContent.vue',
  'src/components/PhoneMockupContent.vue',
  'src/components/QrCodeEditor.vue'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Fix api.ts BASE_URL
  if (file === 'src/api.ts') {
    content = content.replace(
      /let BASE_URL = import\.meta\.env\.VITE_API_URL;\s*if \(!BASE_URL \|\| [\s\S]*?\}\s*/,
      `let BASE_URL = import.meta.env.VITE_API_URL || '';
const isLocal = /^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$/.test(window.location.hostname) || window.location.hostname === 'localhost';
if (!import.meta.env.VITE_API_URL && isLocal) {
  BASE_URL = \`http://\${window.location.hostname}:3000\`;
}
`
    );
  }

  // Fix Constructor.vue API_URL
  if (file === 'src/Constructor.vue') {
    content = content.replace(
      /let API_URL = \(import\.meta as any\)\.env\.VITE_API_URL;\s*if \(!API_URL \|\| [\s\S]*?\}\s*/,
      `let API_URL = import.meta.env.VITE_API_URL || '';
const isLocalApi = /^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$/.test(window.location.hostname) || window.location.hostname === 'localhost';
if (!import.meta.env.VITE_API_URL && isLocalApi) {
  API_URL = \`http://\${window.location.hostname}:3000\`;
}
`
    );
    content = content.replace(
      /let API_URL_VAR = import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:3000';\s*if \(!API_URL_VAR \|\| [\s\S]*?\}\s*/g,
      `let API_URL_VAR = import.meta.env.VITE_API_URL || '';
const isLocalVar = /^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$/.test(window.location.hostname) || window.location.hostname === 'localhost';
if (!import.meta.env.VITE_API_URL && isLocalVar) {
  API_URL_VAR = \`http://\${window.location.hostname}:3000\`;
}
`
    );
  }

  // Fix SuperAdminView.vue
  if (file === 'src/views/SuperAdminView.vue') {
    content = content.replace(
      /const API_URL = import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:3000';\s*/g,
      `let API_URL = import.meta.env.VITE_API_URL || '';
const isLocal = /^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$/.test(window.location.hostname) || window.location.hostname === 'localhost';
if (!import.meta.env.VITE_API_URL && isLocal) {
  API_URL = \`http://\${window.location.hostname}:3000\`;
}
`
    );
  }

  // Fix MyTariffContent.vue
  if (file === 'src/components/MyTariffContent.vue') {
    content = content.replace(
      /let API_URL = import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:3000';\s*if \(!API_URL \|\| [\s\S]*?\}\s*/g,
      `let API_URL = import.meta.env.VITE_API_URL || '';
const isLocal = /^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$/.test(window.location.hostname) || window.location.hostname === 'localhost';
if (!import.meta.env.VITE_API_URL && isLocal) {
  API_URL = \`http://\${window.location.hostname}:3000\`;
}
`
    );
  }

  // Fix MenuEditor.vue
  if (file === 'src/components/MenuEditor.vue') {
    content = content.replace(
      /let apiUrl = import\.meta\.env\.VITE_API_URL;\s*if \(!apiUrl \|\| [\s\S]*?\}\s*/,
      `let apiUrl = import.meta.env.VITE_API_URL || '';
const isLocal = /^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$/.test(window.location.hostname) || window.location.hostname === 'localhost';
if (!import.meta.env.VITE_API_URL && isLocal) {
  apiUrl = \`http://\${window.location.hostname}:3000\`;
}
`
    );
  }

  // Fix ClientView.vue
  if (file === 'src/views/ClientView.vue') {
    content = content.replace(
      /let API_URL = import\.meta\.env\.VITE_API_URL;\s*if \(!API_URL \|\| [\s\S]*?\}\s*/,
      `let API_URL = import.meta.env.VITE_API_URL || '';
const isLocal = /^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$/.test(window.location.hostname) || window.location.hostname === 'localhost';
if (!import.meta.env.VITE_API_URL && isLocal) {
  API_URL = \`http://\${window.location.hostname}:3000\`;
}
`
    );
  }

  // Fix PhoneMockupContent.vue
  if (file === 'src/components/PhoneMockupContent.vue') {
    content = content.replace(
      /\`http:\/\/localhost:3000\/api\/translate\`/g,
      `\`/api/translate\``
    );
  }

  // Fix QrCodeEditor.vue
  if (file === 'src/components/QrCodeEditor.vue') {
      content = content.replace(
      /if \(data\.ip && data\.ip !== 'localhost'\)/g,
      `if (data.ip && data.ip !== 'localhost' && data.ip !== '127.0.0.1')`
    );
  }

  fs.writeFileSync(file, content);
  console.log('Fixed', file);
});
