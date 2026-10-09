const fs = require('fs');
let file = fs.readFileSync('src/views/ClientView.vue', 'utf8');

file = file.replace(/const hostIP = window\.location\.hostname;\r?\n/g, "");

file = file.replace(/const feedbackOptions = \[\r?\n  \{ id: 'kitchen', label: 'Кухня', icon: ConciergeBell \},\r?\n  \{ id: 'service', label: 'Обслуживание', icon: ClipboardCheck \},\r?\n  \{ id: 'interior', label: 'Интерьер', icon: Armchair \}\r?\n\];/g, 
`const badFeedbackOptions = [
  { id: 'taste', label: 'Невкусно', icon: ConciergeBell },
  { id: 'wait', label: 'Долгое ожидание', icon: Clock },
  { id: 'service', label: 'Сервис', icon: ClipboardCheck },
];

const goodFeedbackOptions = [
  { id: 'taste', label: 'Очень вкусно', icon: ChefHat },
  { id: 'atmosphere', label: 'Атмосфера', icon: Armchair },
  { id: 'service', label: 'Отличный сервис', icon: Star },
];`);

fs.writeFileSync('src/views/ClientView.vue', file);
console.log('Fixed ClientView options');
