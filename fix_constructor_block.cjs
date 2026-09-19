import fs from 'fs';

let code = fs.readFileSync('src/Constructor.vue', 'utf8');

code = code.replace(/const isBlocked = computed\(\(\) => currentRestaurant\.value\?\.status === 'BLOCKED'\);/, 
`const isBlocked = computed(() => {
  const r = currentRestaurant.value;
  if (!r) return false;
  
  if (r.status === 'BLOCKED') return true;
  
  if (r.status === 'PENDING_PAYMENT' || r.status === 'ACTIVE' || r.status === 'TRIAL') {
     const now = new Date();
     const paidDate = r.paidUntil ? new Date(r.paidUntil) : new Date(0);
     const trialDate = r.trialEndsAt ? new Date(r.trialEndsAt) : new Date(0);
     
     if (r.status === 'TRIAL' && trialDate < now) return true;
     if ((r.status === 'PENDING_PAYMENT' || r.status === 'ACTIVE') && paidDate < now) return true;
  }
  return false;
});`);

fs.writeFileSync('src/Constructor.vue', code);
console.log('Fixed Constructor.vue blocking condition');

