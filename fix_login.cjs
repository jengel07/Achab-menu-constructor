const fs = require('fs');
let file = fs.readFileSync('src/views/LoginView.vue', 'utf8');

file = file.replace(/email\.value = Array\.isArray\(route\.query\.email\) \? route\.query\.email\[0\] : route\.query\.email;/g, "email.value = (Array.isArray(route.query.email) ? route.query.email[0] : route.query.email) || '';");
file = file.replace(/password\.value = Array\.isArray\(route\.query\.password\) \? route\.query\.password\[0\] : route\.query\.password;/g, "password.value = (Array.isArray(route.query.password) ? route.query.password[0] : route.query.password) || '';");

fs.writeFileSync('src/views/LoginView.vue', file);
console.log('Fixed LoginView.vue');
