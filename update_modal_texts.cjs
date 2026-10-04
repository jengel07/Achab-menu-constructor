import fs from 'fs';

let vue = fs.readFileSync('src/components/OrderSettingsEditor.vue', 'utf8');

// 1. Text Replacements
vue = vue.replace(
  `<h3>Принятие заказов</h3>`,
  `<h3>Принятие заказов</h3>`
);

vue = vue.replace(
  `<p>Принимай заказы клиентов прямо в Dashboard. Это быстрый и простой способ увеличить выручку.</p>`,
  `<p>Принимай заказы клиентов прямо в Achab QrMenu и по email. Быстрый и простой способ увеличить выручку без лишних заморочек.</p>`
);

vue = vue.replace(
  `<label for="liability">Я понимаю, что сервис предоставляет инструмент для заказов, но я несу полную ответственность за выполнение и связанные убытки.</label>`,
  `<label for="liability">Я понимаю, что Achab QrMenu предоставляет инструмент для приёма заказов, но я несу полную ответственность за их выполнение. Achab QrMenu не несёт ответственности за потерянные заказы, пропущенные уведомления или связанные потери выручки.</label>`
);

vue = vue.replace(
  `Активировать заказы 🚀`,
  `Активировать заказы`
);

// 2. Style replacements for Light Theme
// .modal-content.order-settings-modal
vue = vue.replace(
  /background: #1a1a1a;\s*color: #f3f4f6;/g,
  `background: #ffffff;\n    color: #111827;`
);

// .mode-tabs
vue = vue.replace(
  /background: #262626;/g,
  `background: #f3f4f6;`
);

vue = vue.replace(
  /\.mode-tabs button \{ flex: 1; background: transparent; border: none; padding: 10px; font-size: 14px; color: #6b7280; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0\.15s; \}/g,
  `.mode-tabs button { flex: 1; background: transparent; border: none; padding: 10px; font-size: 14px; color: #6b7280; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.15s; }`
);

vue = vue.replace(
  /\.mode-tabs button\.active \{ background: #374151; color: #fff; box-shadow: 0 2px 6px rgba\(0,0,0,0\.3\); \}/g,
  `.mode-tabs button.active { background: #ffffff; color: #111827; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }`
);

vue = vue.replace(
  /\.mode-description-card \{\s*background: #222225;\s*border: 1px solid #2d2d2d;/g,
  `.mode-description-card { background: #f9fafb; border: 1px solid #f3f4f6;`
);

// .setting-block
vue = vue.replace(
  /\.setting-block \{ background: #222225; border: 1px solid #2d2d2d; padding: 16px; border-radius: 12px; margin-bottom: 12px; \}/g,
  `.setting-block { background: #f9fafb; border: 1px solid #f3f4f6; padding: 16px; border-radius: 12px; margin-bottom: 12px; }`
);

vue = vue.replace(
  /\.btn-cancel \{ background: #374151; color: #9ca3af; /g,
  `.btn-cancel { background: #f3f4f6; color: #374151; `
);

// Input text
vue = vue.replace(
  /\.text-input \{\s*width: 100%;\s*background: #111111;\s*border: 1px solid #2d2d2d;\s*color: #fff;/g,
  `.text-input { width: 100%; background: #ffffff; border: 1px solid #e5e7eb; color: #111827;`
);

vue = vue.replace(
  /\.input-group label \{\s*display: block;\s*font-size: 12px;\s*color: #9ca3af;\s*margin-bottom: 6px;\s*\}/g,
  `.input-group label { display: block; font-size: 12px; color: #6b7280; margin-bottom: 6px; }`
);

// Update title to be just "Настройки заказов" (if not already)
// The code had: <h2>Настройки заказов</h2> so no change needed.

fs.writeFileSync('src/components/OrderSettingsEditor.vue', vue);

