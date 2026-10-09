const fs = require('fs');

const fixViewMode = (file) => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/ref<'grid' \| 'list'>/g, "ref<'grid' | 'list' | 'full'>");
  content = content.replace(/ref<'list' \| 'grid'>/g, "ref<'list' | 'grid' | 'full'>");
  fs.writeFileSync(file, content);
};

fixViewMode('src/components/PhoneMockupContent.vue');
fixViewMode('src/views/ClientView.vue');
console.log('Fixed viewMode type');
