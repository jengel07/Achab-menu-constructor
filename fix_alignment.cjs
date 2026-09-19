const fs = require('fs');

function fixAlignment() {
  const filePath = 'src/views/ClientView.vue';
  let code = fs.readFileSync(filePath, 'utf8');

  // Fix the wrapper's position
  code = code.replace(
    /position: absolute; top: 15px; right: 12px; z-index: 50;/g,
    'position: absolute; top: 15px; left: 12px; right: 12px; z-index: 50;'
  );

  // Fix the panel's width
  code = code.replace(
    /width: calc\(100vw - 24px\); max-width: 400px;/g,
    'width: 100%; max-width: 100%;'
  );

  fs.writeFileSync(filePath, code);
  console.log('Fixed alignment in ClientView.vue');
}

fixAlignment();

