const fs = require('fs');
let code = fs.readFileSync('src/Constructor.vue', 'utf8');

// 1. Add fetching logic to Constructor.vue
const scriptAdd = `
const billingStatus = ref(null);
const checkBilling = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch(\`\${API_URL}/api/my-restaurant-billing\`, { headers: { 'Authorization': \`Bearer \${token}\` } });
    if (res.ok) {
      const data = await res.json();
      billingStatus.value = data.status;
      // If blocked or expired trial, force payment tab
      if (data.status === 'BLOCKED' || (data.status === 'TRIAL' && new Date(data.trialEndsAt) < new Date())) {
        billingStatus.value = 'BLOCKED';
        if (sidebarView.value !== 'payment') {
          openSidebarView('payment');
        }
      }
    }
  } catch (e) { console.error('Billing check failed'); }
};

onMounted(() => {
  checkBilling();
});
`;

code = code.replace(/onMounted\(\(\) => \{/, scriptAdd + '\nonMounted(() => {');

// 2. Add watch on sidebarView so that if blocked, it doesn't allow switching
const watchBlock = `
watch(sidebarView, (newVal) => {
  if (billingStatus.value === 'BLOCKED' && newVal !== 'payment') {
    sidebarView.value = 'payment';
  }
});
`;
code = code.replace(/onMounted\(\(\) => \{/, watchBlock + '\nonMounted(() => {');

// 3. Add the global banner at the top of the app wrapper
const bannerHtml = `
    <div v-if="billingStatus === 'BLOCKED'" class="global-blocking-banner">
      Доступ ограничен. Оплатите подписку для разблокировки.
    </div>
    <div class="constructor-wrapper">
`;
code = code.replace(/<div class="constructor-wrapper">/, bannerHtml);

// 4. Add styles for banner
const styleAdd = `
.global-blocking-banner {
  background: #ef4444;
  color: white;
  text-align: center;
  padding: 12px;
  font-weight: bold;
  font-size: 16px;
  position: absolute;
  top: 0; left: 0; right: 0;
  z-index: 9999;
}
.constructor-wrapper {
  margin-top: v-bind("billingStatus === 'BLOCKED' ? '46px' : '0'");
}
`;
code = code.replace(/<\/style>/, styleAdd + '\n</style>');

fs.writeFileSync('src/Constructor.vue', code);
console.log('Fixed Constructor.vue blocking');

