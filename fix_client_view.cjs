import fs from 'fs';

let code = fs.readFileSync('src/views/ClientView.vue', 'utf8');

// 1. Add error state to ClientView script
if (!code.includes('const fetchError = ref(')) {
  code = code.replace(/const store = useClientMenuStore\(\);/, `const store = useClientMenuStore();\nconst fetchError = ref('');`);
}

// 2. Handle 403 response
if (!code.includes('fetchError.value = data.error')) {
  const fetchRegex = /const response = await fetch\(fetchUrl\);\n\s*if \(response\.ok\) \{[\s\S]*?\}\n\s*\} catch \(error\) \{/m;
  const newFetch = `const response = await fetch(fetchUrl);
      if (response.ok) {
        fetchError.value = '';
        const data = await response.json();
        if (data.error) {
           fetchError.value = data.error;
           return;
        }
        store.restaurantInfo = data.restaurantInfo || {};
        store.updateCategories(data.categories || []);
        store.updateItems(data.items || []);
        if (data.generalSettings) {
          store.generalSettings = { ...store.generalSettings, ...data.generalSettings };
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        if (errData.error) {
          fetchError.value = errData.error;
        } else {
          fetchError.value = 'Ошибка загрузки меню';
        }
      }
    } catch (error) {`;
  code = code.replace(fetchRegex, newFetch);
}

// 3. Inject error UI in template
if (!code.includes('class="menu-error-overlay"')) {
  code = code.replace(/<template>\n  <div :class="\['client-view'/, 
`<template>
  <div v-if="fetchError" class="menu-error-overlay" style="position: fixed; inset: 0; background: #fff; z-index: 999999; display: flex; align-items: center; justify-content: center; padding: 20px; text-align: center;">
    <div>
      <div style="font-size: 48px; margin-bottom: 20px;">🔒</div>
      <h2 style="color: #333; font-size: 24px; margin-bottom: 10px;">{{ fetchError }}</h2>
      <p style="color: #666;">Пожалуйста, обратитесь к администрации заведения.</p>
    </div>
  </div>
  <div :class="['client-view'`);
}

fs.writeFileSync('src/views/ClientView.vue', code);
console.log('ClientView modified to show error');

