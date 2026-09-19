import fs from 'fs';

let code = fs.readFileSync('src/components/MyTariffContent.vue', 'utf8');

const regex = /const handlePaymentClick = async \(\) => \{[\s\S]*?\};/;
const replacement = `const handlePaymentClick = () => {
  if (currentRestaurant.value?.id) {
    window.open(\`https://t.me/achab_notify_bot?start=REST_\${currentRestaurant.value.id}\`, '_blank');
  } else {
    alert('Ошибка: Не удалось определить ID ресторана.');
  }
};`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/MyTariffContent.vue', code);
console.log('MyTariffContent.vue updated');

