import fs from 'fs';

let code = fs.readFileSync('daur-menu-backend/orders.js', 'utf8');

const regex = /fetch\(url\)\s*\.then\(r => r\.json\(\)\)\s*\.then\(data => \{\s*if \(!data\.ok && data\.parameters\?\.migrate_to_chat_id\) \{\s*urlObj\.searchParams\.set\('chat_id', data\.parameters\.migrate_to_chat_id\);\s*return fetch\(urlObj\.toString\(\)\);\s*\}\s*return data;\s*\}\)\s*\.then\(data => console\.log\('Telegram feedback sent:', data\?\.ok \|\| data\?\.status\)\)\s*\.catch\(e => console\.error\('Telegram error:', e\)\);/;

const replacement = `fetch(url)
              .then(r => r.json())
              .then(data => {
                if (!data.ok) {
                   console.error('[ORDERS TG] Failed:', JSON.stringify(data));
                   if (data.parameters?.migrate_to_chat_id) {
                     urlObj.searchParams.set('chat_id', data.parameters.migrate_to_chat_id);
                     return fetch(urlObj.toString()).then(r => r.json());
                   }
                }
                return data;
              })
              .then(data => console.log('[ORDERS TG] Final:', data))
              .catch(e => console.error('[ORDERS TG] Error:', e));`;

code = code.replace(regex, replacement);

const feedbackRegex = /fetch\(url\)\s*\.then\(r => r\.json\(\)\)\s*\.then\(data => console\.log\('Telegram feedback sent:', data\.ok\)\)\s*\.catch\(e => console\.error\('Telegram error:', e\)\);/;

const feedbackReplacement = `fetch(url)
              .then(r => r.json())
              .then(data => {
                if (!data.ok) {
                   console.error('[FEEDBACK TG] Failed:', JSON.stringify(data));
                   if (data.parameters?.migrate_to_chat_id) {
                     urlObj.searchParams.set('chat_id', data.parameters.migrate_to_chat_id);
                     return fetch(urlObj.toString()).then(r => r.json());
                   }
                }
                return data;
              })
              .then(data => console.log('[FEEDBACK TG] Final:', data))
              .catch(e => console.error('[FEEDBACK TG] Error:', e));`;

code = code.replace(feedbackRegex, feedbackReplacement);

fs.writeFileSync('daur-menu-backend/orders.js', code);
console.log('Fixed TG logging in orders.js');

