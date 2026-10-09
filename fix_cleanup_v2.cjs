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

  // Match the broken block regardless of what's inside
  const regex = /\\\.\)\{3\}\[0-9\]\{1,3\}\$\/\.test\(window\.location\.hostname\) \|\| window\.location\.hostname === 'localhost'\) \{\r?\n\s*.*?3000.*?;\r?\n\s*\}/g;
  
  content = content.replace(regex, '');
  fs.writeFileSync(file, content);
  console.log('Cleaned up completely', file);
});
