const fs = require('fs');

function replaceLogo(filePath, oldString, isLogoImg = true) {
  if (fs.existsSync(filePath)) {
    let code = fs.readFileSync(filePath, 'utf8');
    if (isLogoImg) {
      code = code.replace(oldString, '<img src="/achab-logo.png" class="brand-logo-img" alt="Achab Menu" />');
      if (!code.includes('.brand-logo-img {')) {
        code += '\n<style scoped>\n.brand-logo-img {\n  height: 48px;\n  object-fit: contain;\n  margin-bottom: 24px;\n}\n</style>';
      }
    } else {
      code = code.replace(oldString, 'Achab QRMENU');
    }
    fs.writeFileSync(filePath, code);
    console.log('Updated logo in', filePath);
  }
}

replaceLogo('src/views/LoginView.vue', '<div class="brand-logo">ConstructorMenu</div>');
replaceLogo('src/components/admin/AdminDashboard.vue', '<div class="brand-logo">Daur Menu</div>');
replaceLogo('src/views/SuperAdminView.vue', '<div class="sa-logo">Daur Platform 👑</div>');

// Also update sidebar menu title in Constructor.vue if it exists
let consCode = fs.readFileSync('src/Constructor.vue', 'utf8');
// It doesn't have a logo text, but we should make sure the header looks right.
// Let's add the logo to Constructor.vue top left
if (consCode.includes('<div class="editor-layout">') && !consCode.includes('brand-logo-img')) {
  consCode = consCode.replace('<aside class="sidebar">', '<aside class="sidebar">\n      <div style="padding: 24px; text-align: center;"><img src="/achab-logo.png" class="brand-logo-img" alt="Achab Menu" style="max-width: 100%; height: 40px; object-fit: contain;" /></div>');
  fs.writeFileSync('src/Constructor.vue', consCode);
  console.log('Added logo to Constructor.vue');
}

// Any remaining #646cff in other files?
function replaceColors(filePath) {
  if (fs.existsSync(filePath)) {
    let code = fs.readFileSync(filePath, 'utf8');
    let original = code;
    code = code.replace(/#646cff/gi, '#6a2131')
               .replace(/#6366f1/gi, '#6a2131')
               .replace(/#4f46e5/gi, '#521926')
               .replace(/#3b82f6/gi, '#6a2131')
               .replace(/rgba\(99,\s*102,\s*241/g, 'rgba(106, 33, 49');
    
    if (code !== original) {
      fs.writeFileSync(filePath, code);
      console.log('Updated colors in', filePath);
    }
  }
}

replaceColors('src/Constructor.vue');
replaceColors('src/views/ClientView.vue');
replaceColors('src/components/PhoneMockupContent.vue');
replaceColors('src/components/admin/AdminDashboard.vue');
replaceColors('src/views/LoginView.vue');
replaceColors('src/views/SuperAdminView.vue');
replaceColors('src/views/KitchenOrders.vue');


