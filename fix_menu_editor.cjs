const fs = require('fs');
let vue = fs.readFileSync('src/components/MenuEditor.vue', 'utf8');

vue = vue.replace(
  /<div style="display: flex; gap: 12px; width: 100%;">/g,
  '<div style="display: flex; gap: 12px; width: 100%; flex-wrap: wrap;">'
);

vue = vue.replace(
  /<div style="position: relative; flex-grow: 1; display: flex; align-items: center;">/g,
  '<div style="position: relative; flex-grow: 1; display: flex; align-items: center; min-width: 200px;">'
);

vue = vue.replace(
  /<select v-model="selectedCategoryId" class="category-select">/g,
  '<select v-model="selectedCategoryId" class="category-select" style="flex-grow: 1; min-width: 200px;">'
);

fs.writeFileSync('src/components/MenuEditor.vue', vue);
