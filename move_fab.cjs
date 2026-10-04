const fs = require('fs');

function moveFab(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\.floating-waiter-fab \{\s*position: absolute;\s*top: 16px;\s*right: 16px;/g, 
    '.floating-waiter-fab {\n  position: absolute;\n  top: 16px;\n  left: 16px;'
  );
  fs.writeFileSync(filePath, content);
}

moveFab('src/views/ClientView.vue');
moveFab('src/components/PhoneMockupContent.vue');

console.log('Moved to left');

