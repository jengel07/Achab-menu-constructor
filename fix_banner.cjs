const fs = require('fs');

let file = fs.readFileSync('src/Constructor.vue', 'utf8');

// 1. Remove the fixed warning banner
file = file.replace(/<div v-if="isBlocked" style="position: fixed; top: 0; left: 0; right: 0; background: #dc3545; color: white; padding: 15px; text-align: center; z-index: 9999; font-weight: bold; font-size: 16px;">\s*ВНИМАНИЕ: Ваш аккаунт заблокирован за неуплату\. Оплатите подписку для восстановления доступа \(публичное меню также скрыто\)\.\s*<\/div>/, '');

// 2. Remove pointer-events from constructor-layout
file = file.replace(/<div class="constructor-layout" :style="isBlocked && sidebarView !== 'payment' \? 'pointer-events: none; opacity: 0\.5;' : ''">/, '<div class="constructor-layout">');

// 3. Add the warning banner inside editor-area, after editor-header
const headerEndIdx = file.indexOf('</header>');
if (headerEndIdx !== -1) {
  const insertPos = headerEndIdx + '</header>'.length;
  const bannerCode = `\n        <div v-if="isBlocked" style="background: #dc3545; color: white; padding: 15px; text-align: center; font-weight: bold; font-size: 16px; margin: 16px 16px 0 16px; border-radius: 8px;">\n          ВНИМАНИЕ: Ваш аккаунт заблокирован за неуплату. Оплатите подписку для восстановления доступа (публичное меню также скрыто).\n        </div>`;
  file = file.slice(0, insertPos) + bannerCode + file.slice(insertPos);
}

// 4. Add pointer-events to preview-area
file = file.replace(/<section class="preview-area">/, '<section class="preview-area" :style="isBlocked && sidebarView !== \'payment\' ? \'pointer-events: none; opacity: 0.5;\' : \'\'">');

fs.writeFileSync('src/Constructor.vue', file);
console.log('Fixed banner positioning in Constructor.vue');

