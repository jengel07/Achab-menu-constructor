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

  // Find the leftover string and remove it
  const regex = /\\\.\)\{3\}\[0-9\]\{1,3\}\$\/\.test\(window\.location\.hostname\) \|\| window\.location\.hostname === 'localhost'\) \{\r?\n\s*[A-Z_a-z0-9]+\s*=\s*`http:\/\/\$\{.*?localhost:3000`;\r?\n\}\r?\n/g;
  
  // Wait, let's just do a simpler replace for the leftover garbage
  const regex2 = /\\\.\)\{3\}\[0-9\]\{1,3\}\$\/\.test\(window\.location\.hostname\) \|\| window\.location\.hostname === 'localhost'\) \{\r?\n\s*.*?\r?\n\}/g;
  
  content = content.replace(regex2, '');
  
  // Actually, some files might have slightly different leftover.
  // Let's just manually replace exactly what's there
  
  content = content.replace(/\\\.\)\{3\}\[0-9\]\{1,3\}\$\/\.test\(window\.location\.hostname\) \|\| window\.location\.hostname === 'localhost'\) \{\r?\n\s*API_URL = `http:\/\/\$\{window\.location\.hostname\}:3000`;\r?\n\}/g, '');
  content = content.replace(/\\\.\)\{3\}\[0-9\]\{1,3\}\$\/\.test\(window\.location\.hostname\) \|\| window\.location\.hostname === 'localhost'\) \{\r?\n\s*BASE_URL = `http:\/\/\$\{window\.location\.hostname\}:3000`;\r?\n\}/g, '');
  content = content.replace(/\\\.\)\{3\}\[0-9\]\{1,3\}\$\/\.test\(window\.location\.hostname\) \|\| window\.location\.hostname === 'localhost'\) \{\r?\n\s*apiUrl = `http:\/\/\$\{window\.location\.hostname\}:3000`;\r?\n\}/g, '');
  content = content.replace(/\\\.\)\{3\}\[0-9\]\{1,3\}\$\/\.test\(window\.location\.hostname\) \|\| window\.location\.hostname === 'localhost'\) \{\r?\n\s*API_URL_VAR = `http:\/\/\$\{window\.location\.hostname\}:3000`;\r?\n\}/g, '');
  
  fs.writeFileSync(file, content);
  console.log('Cleaned up', file);
});
