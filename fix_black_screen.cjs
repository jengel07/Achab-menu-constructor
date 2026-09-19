import fs from 'fs';

let code = fs.readFileSync('src/Constructor.vue', 'utf8');

// 1. Check if isBlocked is already defined
if (!code.includes('const isBlocked = ref(false);')) {
  const scriptAdd = `
const isBlocked = ref(false);
const checkBilling = async () => {
  try {
    const token = localStorage.getItem('authToken');
    let API_URL_VAR = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    if (!API_URL_VAR || /^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$/.test(window.location.hostname) || window.location.hostname === 'localhost') {
      API_URL_VAR = \`http://\${window.location.hostname}:3000\`;
    }
    const res = await fetch(\`\${API_URL_VAR}/api/my-restaurant-billing\`, { headers: { 'Authorization': \`Bearer \${token}\` } });
    if (res.ok) {
      const r = await res.json();
      if (r.status === 'BLOCKED') {
        isBlocked.value = true;
      } else if (r.status === 'PENDING_PAYMENT' || r.status === 'ACTIVE' || r.status === 'TRIAL') {
        const now = new Date();
        const paidDate = r.paidUntil ? new Date(r.paidUntil) : new Date(0);
        const trialDate = r.trialEndsAt ? new Date(r.trialEndsAt) : new Date(0);
        if (r.status === 'TRIAL' && trialDate < now) isBlocked.value = true;
        if ((r.status === 'PENDING_PAYMENT' || r.status === 'ACTIVE') && paidDate < now) isBlocked.value = true;
      }
      if (isBlocked.value && sidebarView.value !== 'payment') {
        sidebarView.value = 'payment';
      }
    }
  } catch (e) { console.error('Billing check failed', e); }
};
`;
  
  // Inject into imports / top level of script
  code = code.replace(/const router = useRouter\(\);/, scriptAdd + '\nconst router = useRouter();');

  // Inject into onMounted
  code = code.replace(/onMounted\(async \(\) => \{/, "onMounted(async () => {\n  await checkBilling();");
  
  fs.writeFileSync('src/Constructor.vue', code);
  console.log('Fixed Constructor.vue isBlocked definition');
} else {
  console.log('isBlocked already defined');
}

