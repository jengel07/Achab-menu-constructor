import fs from 'fs';
let code = fs.readFileSync('src/Constructor.vue', 'utf8');

const scriptAdd = `
const billingStatus = ref(null);
const checkBilling = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch(\`\${API_URL}/api/my-restaurant-billing\`, { headers: { 'Authorization': \`Bearer \${token}\` } });
    if (res.ok) {
      const data = await res.json();
      billingStatus.value = data.status;
      if (data.status === 'BLOCKED' || (data.status === 'TRIAL' && new Date(data.trialEndsAt) < new Date())) {
        billingStatus.value = 'BLOCKED';
        if (sidebarView.value !== 'payment') {
          sidebarView.value = 'payment';
        }
      }
    }
  } catch (e) { console.error('Billing check failed'); }
};

watch(sidebarView, (newVal) => {
  if (billingStatus.value === 'BLOCKED' && newVal !== 'payment') {
    sidebarView.value = 'payment';
  }
});
`;

if (!code.includes('checkBilling')) {
  code = code.replace(/onMounted\(async \(\) => \{/, scriptAdd + '\nonMounted(async () => {\n  checkBilling();\n');
}

if (!code.includes('global-blocking-banner')) {
  const bannerHtml = `
    <div v-if="billingStatus === 'BLOCKED'" class="global-blocking-banner">
      Доступ ограничен. Оплатите подписку для разблокировки.
    </div>
    <div class="constructor-wrapper">
  `;
  code = code.replace(/<div class="constructor-wrapper">/, bannerHtml);
}

if (!code.includes('.global-blocking-banner')) {
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
}

fs.writeFileSync('src/Constructor.vue', code);
console.log('Fixed Constructor.vue properly');

