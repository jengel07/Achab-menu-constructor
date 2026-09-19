const fs = require('fs');

let indexCode = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

const telegramCode = `fetch(urlObj.toString(), { method: 'GET' })
            .then(res => res.json())
            .then(data => {
              if (!data.ok && data.parameters?.migrate_to_chat_id) {
                 urlObj.searchParams.set('chat_id', data.parameters.migrate_to_chat_id);
                 return fetch(urlObj.toString(), { method: 'GET' });
              }
              return data;
            })
            .then(data => console.log('Telegram waiter call sent:', data?.ok || data?.status))
            .catch(e => console.error('Telegram error:', e));`;

indexCode = indexCode.replace(/fetch\(urlObj\.toString\(\), \{ method: 'GET' \}\)[\s\S]*?\.catch\(e => console\.error\('Telegram error:', e\)\);/, telegramCode);
fs.writeFileSync('daur-menu-backend/index.js', indexCode);


let ordersCode = fs.readFileSync('daur-menu-backend/orders.js', 'utf8');

const orderTelegramCode = `fetch(url)
              .then(r => r.json())
              .then(data => {
                if (!data.ok && data.parameters?.migrate_to_chat_id) {
                   urlObj.searchParams.set('chat_id', data.parameters.migrate_to_chat_id);
                   return fetch(urlObj.toString());
                }
                return data;
              })
              .then(data => console.log('Telegram sent:', data?.ok || data?.status, data))
              .catch(e => console.error('Telegram error:', e));`;
ordersCode = ordersCode.replace(/fetch\(url\)[\s\S]*?\.catch\(e => console\.error\('Telegram error:', e\)\);/, orderTelegramCode);

const feedbackTelegramCode = `fetch(url)
              .then(r => r.json())
              .then(data => {
                if (!data.ok && data.parameters?.migrate_to_chat_id) {
                   urlObj.searchParams.set('chat_id', data.parameters.migrate_to_chat_id);
                   return fetch(urlObj.toString());
                }
                return data;
              })
              .then(data => console.log('Telegram feedback sent:', data?.ok || data?.status))
              .catch(e => console.error('Telegram error:', e));`;
ordersCode = ordersCode.replace(/fetch\(url\)[\s\S]*?\.catch\(e => console\.error\('Telegram error:', e\)\);/, feedbackTelegramCode); // Need to be careful here

fs.writeFileSync('daur-menu-backend/orders.js', ordersCode);
console.log('Patched Telegram logic');
