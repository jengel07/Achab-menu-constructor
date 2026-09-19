const fs = require('fs');
let code = fs.readFileSync('src/views/LoginView.vue', 'utf8');

code = code.replace(
  /<div class="brand-logo">ConstructorMenu<\/div>/,
  `<img src="/logo-light.png" class="brand-logo-img" alt="Achab Menu" />`
);

// Add CSS for brand-logo-img if it's missing
if (!code.includes('.brand-logo-img')) {
  code = code.replace('</style>', `
.brand-logo-img {
  height: 48px;
  object-fit: contain;
  margin-bottom: 24px;
}
</style>`);
}

fs.writeFileSync('src/views/LoginView.vue', code);
console.log('LoginView updated');

