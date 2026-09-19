import fs from 'fs';

let vueCode = fs.readFileSync('src/views/SuperAdminView.vue', 'utf8');

vueCode = vueCode.replace(/res\.isBlocked \? 'blocked' : 'active'/g, "res.status === 'BLOCKED' ? 'blocked' : 'active'");
vueCode = vueCode.replace(/res\.isBlocked \? '"' : '?''/g, "res.status === 'BLOCKED' ? 'Да' : 'Нет'");

vueCode = vueCode.replace(/const toggleBlock = \(_id: string\) => \{\n\s*alert\('.*?'\);\n\s*\};/,
`const toggleBlock = async (id: string, currentlyBlocked: boolean) => {
  if (confirm(currentlyBlocked ? 'Разблокировать этот аккаунт?' : 'Заблокировать этот аккаунт?')) {
    try {
      await superAdminApi.toggleBlockRestaurant(id, !currentlyBlocked);
      loadRestaurants();
    } catch (e: any) {
      alert('Ошибка: ' + e.message);
    }
  }
};`);

vueCode = vueCode.replace(/@click="toggleBlock\(res\.id\)"/g, `@click="toggleBlock(res.id, res.status === 'BLOCKED')"`);

fs.writeFileSync('src/views/SuperAdminView.vue', vueCode);
console.log('Vue updated');

