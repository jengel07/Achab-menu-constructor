import sys
import re

file_path = 'src/Constructor.vue'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_overlay = '''
    <div v-if="isBlocked && !isMenuOpen" style="position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);">
      <!-- Accessible Hamburger when blocked -->
      <button @click="isMenuOpen = true; sidebarView = 'main'" title="Отрыть меню"
        style="position: absolute; top: 16px; left: 16px; width: 40px; height: 40px; border-radius: 8px; background: var(--bg-panel, #fff); border: 1px solid var(--border-color, #e5e7eb); color: var(--text-main, #000); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 1001; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <MenuIcon :size="24" stroke-width="2" />
      </button>

      <div style="background: var(--bg-panel); color: var(--text-main); padding: 32px; border-radius: 16px; max-width: 400px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid rgba(239, 68, 68, 0.5);">
        <div style="color: #ef4444; margin-bottom: 16px;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <h3 style="margin: 0 0 12px; font-size: 20px;">Доступ ограничен</h3>
        <p style="margin: 0 0 24px; opacity: 0.8; line-height: 1.5; font-size: 14px;">Ваш аккаунт заблокирован за неуплату. Оплатите подписку для восстановления доступа к конструктору.</p>
        <button @click="isMenuOpen = true; sidebarView = 'payment'" style="background: #ef4444; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; width: 100%;">Перейти к оплате</button>
      </div>
    </div>
'''

content = re.sub(
    r'<div v-if="isBlocked && !isMenuOpen" style="position: fixed; inset: 0; z-index: 1000;.*?</button>\s*</div>\s*</div>',
    new_overlay.strip(),
    content,
    flags=re.DOTALL
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated Constructor.vue payment overlay')

