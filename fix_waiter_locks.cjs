const fs = require('fs');

let vue = fs.readFileSync('src/views/ClientView.vue', 'utf8');

const startToken = "// Retrieve lock timestamp from localStorage";
const oldCodeRegex = /\/\/ Retrieve lock timestamp from localStorage[\s\S]*?const waiterLockRemaining = computed\(\(\) => \{[\s\S]*?return `\$\{m\}:\$\{s\}`;[\s\S]*?\}\);/;

const newState = `// Retrieve lock timestamp from localStorage
  const storedLocks = localStorage.getItem('waiter_locks');
  const waiterLocks = ref<Record<string, number>>(storedLocks ? JSON.parse(storedLocks) : {});
  const currentCallSource = ref<string>('global');

  const isWaiterLocked = computed(() => {
    const lockUntil = waiterLocks.value[currentCallSource.value] || 0;
    return lockUntil > now.value;
  });

  const isOrderWaiterLocked = (orderId: string) => {
    return (waiterLocks.value[orderId] || 0) > now.value;
  };

  const waiterLockRemaining = computed(() => {
    const lockUntil = waiterLocks.value[currentCallSource.value] || 0;
    if (lockUntil <= now.value) return '00:00';
    const diff = Math.floor((lockUntil - now.value) / 1000);
    const m = Math.floor(diff / 60).toString().padStart(2, '0');
    const s = (diff % 60).toString().padStart(2, '0');
    return \`\${m}:\${s}\`;
  });`;

if (!oldCodeRegex.test(vue)) {
  console.log("Regex failed!");
} else {
  vue = vue.replace(oldCodeRegex, newState);
}

// 2. Update openCallWaiterModalFromCart
vue = vue.replace(
  /const openCallWaiterModalFromCart = \(\) => \{/,
  `const openCallWaiterModalFromCart = () => {
    currentCallSource.value = 'global';`
);

// 3. Update openCallWaiterModal
vue = vue.replace(
  /const openCallWaiterModal = \(order: any\) => \{/,
  `const openCallWaiterModal = (order: any) => {
    currentCallSource.value = order.id;`
);

// 4. Update submitWaiterCall
vue = vue.replace(
  /waiterLockUntil\.value = lockTime;\s+localStorage\.setItem\('waiter_lock_until', lockTime\.toString\(\)\);/g,
  `waiterLocks.value[currentCallSource.value] = lockTime;
        localStorage.setItem('waiter_locks', JSON.stringify(waiterLocks.value));`
);

// 5. Update the template where the order lock is checked
// The button template inside the order loop
vue = vue.replace(
  /:style="\{ background: isWaiterLocked \? '#d1ffd6' : '#eeeeee', color: isWaiterLocked \? '#10b981' : '#111' \}">/g,
  `:style="{ background: isOrderWaiterLocked(order.id) ? '#d1ffd6' : '#eeeeee', color: isOrderWaiterLocked(order.id) ? '#10b981' : '#111' }">`
);

vue = vue.replace(
  /<span v-if="isWaiterLocked">✓ \{\{ tDyn\('Официант уже в пути'\) \}\}<\/span>/g,
  `<span v-if="isOrderWaiterLocked(order.id)">✓ {{ tDyn('Официант уже в пути') }}</span>`
);

fs.writeFileSync('src/views/ClientView.vue', vue);
console.log("Success");
