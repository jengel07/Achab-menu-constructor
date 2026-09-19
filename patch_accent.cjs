const fs = require('fs');

const files = [
  'src/style.css',
  'src/store/menuStore.ts',
  'src/views/MenuDataPage.vue'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace hex
    content = content.replace(/#646cff/gi, '#9D0D0E');
    
    // Replace rgba
    content = content.replace(/rgba\(100,\s*108,\s*255/gi, 'rgba(157, 13, 14');
    
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
}

