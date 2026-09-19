import fs from 'fs';

let code = fs.readFileSync('src/Constructor.vue', 'utf8');

if (!code.includes('ВНИМАНИЕ: Ваш аккаунт заблокирован')) {
  code = code.replace(/<div class="constructor-layout">/, 
`<div v-if="isBlocked" style="position: fixed; top: 0; left: 0; right: 0; background: #dc3545; color: white; padding: 15px; text-align: center; z-index: 9999; font-weight: bold; font-size: 16px;">
      ВНИМАНИЕ: Ваш аккаунт заблокирован за неуплату. Оплатите подписку для восстановления доступа (публичное меню также скрыто).
    </div>
    <div class="constructor-layout" :style="isBlocked && sidebarView !== 'payment' ? 'pointer-events: none; opacity: 0.5;' : ''">`);
  
  fs.writeFileSync('src/Constructor.vue', code);
  console.log('Banner injected');
} else {
  console.log('Banner already exists');
}

