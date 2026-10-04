const fs = require('fs');
let vue = fs.readFileSync('src/components/OrderSettingsEditor.vue', 'utf8');

const regex = /<div style="display: flex; gap: 8px; align-items: center;">/g;
const replacement = `<div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">`;

if (regex.test(vue)) {
  vue = vue.replace(regex, replacement);
  fs.writeFileSync('src/components/OrderSettingsEditor.vue', vue);
  console.log('Fixed archive timer overflow');
} else {
  console.log('Could not find the target string');
}
