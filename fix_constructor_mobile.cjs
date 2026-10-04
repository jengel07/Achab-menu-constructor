import fs from 'fs';

let code = fs.readFileSync('src/Constructor.vue', 'utf8');

// 1. Add isMobileSidebarOpen ref
if (!code.includes('const isMobileSidebarOpen = ref(false);')) {
    code = code.replace('const isMenuOpen = ref(false);', 'const isMenuOpen = ref(false);\nconst isMobileSidebarOpen = ref(false);');
}

// 2. Change <aside class="sidebar"> to include dynamic class
code = code.replace('<aside class="sidebar">', '<aside class="sidebar" :class="{ \'mobile-open\': isMobileSidebarOpen }">');

// 3. Add backdrop right before <aside>
if (!code.includes('mobile-sidebar-backdrop')) {
    code = code.replace('<aside class="sidebar"', '<div v-if="isMobileSidebarOpen" class="mobile-sidebar-backdrop" @click="isMobileSidebarOpen = false"></div>\n        <aside class="sidebar"');
}

// 4. Change the header mobile button to toggle isMobileSidebarOpen
const oldHeaderBtn = `<button @click="isMenuOpen = true" class="btn-mobile-menu btn-theme-toggle" title="Отрыть меню" style="display: none; align-items: center; justify-content: center; width: 36px; height: 36px; padding: 0;">`;
const newHeaderBtn = `<button @click="isMobileSidebarOpen = true" class="btn-mobile-menu btn-theme-toggle" title="Отрыть меню" style="display: none; align-items: center; justify-content: center; width: 36px; height: 36px; padding: 0;">`;
code = code.replace(oldHeaderBtn, newHeaderBtn);

// 5. When a tab is clicked in the sidebar, close the mobile sidebar!
code = code.replace(/@click="activeTab = tab as any"/, `@click="activeTab = tab as any; isMobileSidebarOpen = false"`);

fs.writeFileSync('src/Constructor.vue', code);

