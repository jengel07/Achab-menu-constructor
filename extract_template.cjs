const fs = require('fs');

const vue = fs.readFileSync('src/views/ClientView.vue', 'utf8');
const templateMatch = vue.match(/<template>([\s\S]*?)<\/template>/);
if (templateMatch) {
  console.log(templateMatch[1]);
}
