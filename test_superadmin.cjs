import fs from 'fs';
import http from 'http';

const token = fs.readFileSync('C:/Users/Lenovo/.gemini/antigravity/scratch/superadmin_token.txt', 'utf8').trim(); // Wait, I don't have the token.
// Let's just create a token for superadmin.
import jwt from 'jsonwebtoken';
const JWT_SECRET = 'my_super_secret_jwt_key_123'; // from docker-compose
const testToken = jwt.sign(
  { email: 'geller.9797@mail.ru', role: 'admin' },
  JWT_SECRET,
  { expiresIn: '1d' }
);

http.get('http://localhost:3000/api/superadmin/restaurants', {
  headers: { 'Authorization': `Bearer ${testToken}` }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
}).on('error', (err) => console.log('Error:', err.message));

