import fs from 'fs';

let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

const regex = /fetch\(urlObj\.toString\(\), \{ method: 'GET' \}\)\s*\.then\(res => res\.json\(\)\)\s*\.then\(data => \{\s*if \(!data\.ok && data\.parameters\?\.migrate_to_chat_id\) \{\s*urlObj\.searchParams\.set\('chat_id', data\.parameters\.migrate_to_chat_id\);\s*return fetch\(urlObj\.toString\(\), \{ method: 'GET' \}\);\s*\}\s*return data;\s*\}\)\s*\.then\(data => console\.log\('Telegram waiter call sent:', data\?\.ok \|\| data\?\.status\)\)\s*\.catch\(e => console\.error\('Telegram error:', e\)\);/;

const replacement = `fetch(urlObj.toString(), { method: 'GET' })
            .then(res => res.json())
            .then(data => {
              if (!data.ok) {
                 console.error('[WAITER TG] Failed:', JSON.stringify(data));
                 if (data.parameters?.migrate_to_chat_id) {
                   urlObj.searchParams.set('chat_id', data.parameters.migrate_to_chat_id);
                   return fetch(urlObj.toString(), { method: 'GET' }).then(r => r.json());
                 }
              }
              return data;
            })
            .then(data => console.log('[WAITER TG] Final:', data))
            .catch(e => console.error('[WAITER TG] Error:', e));`;

code = code.replace(regex, replacement);
fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Fixed TG logging in index.js');

