with open('src/Constructor.vue', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '<div class="constructor-layout" :style="isBlocked && sidebarView !== \'payment\' ? \'pointer-events: none; opacity: 0.5;\' : \'\'">',
    '<div class="constructor-layout">'
)

top_banner_start = '<div v-if="isBlocked" style="position: fixed; top: 0; left: 0; right: 0; background: #dc3545;'
start_idx = content.find(top_banner_start)
if start_idx != -1:
    end_idx = content.find('</div>', start_idx) + 6
    content = content[:start_idx] + content[end_idx:]

bottom_banner_start = '<div v-if="isBlocked" style="position: fixed; bottom: 0; left: 0; right: 0; background: #dc3545;'
start_idx_bottom = content.find(bottom_banner_start)
if start_idx_bottom != -1:
    end_idx_bottom = content.find('</div>', start_idx_bottom) + 6
    content = content[:start_idx_bottom] + content[end_idx_bottom:]

modal_html = """
    <div v-if="isBlocked && !isMenuOpen" style="position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);">
      <div style="background: var(--bg-panel); color: var(--text-main); padding: 32px; border-radius: 16px; max-width: 400px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid rgba(239, 68, 68, 0.5);">
        <div style="color: #ef4444; margin-bottom: 16px;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <h3 style="margin: 0 0 12px; font-size: 20px;">Доступ ограничен</h3>
        <p style="margin: 0 0 24px; opacity: 0.8; line-height: 1.5; font-size: 14px;">Ваш аккаунт заблокирован за неуплату. Оплатите подписку для восстановления доступа к конструктору (публичное меню также скрыто).</p>
        <button @click="isMenuOpen = true; sidebarView = 'payment'" style="background: #ef4444; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; width: 100%;">Перейти к оплате</button>
      </div>
    </div>
"""

content = content.replace('<div class="constructor-layout">', modal_html + '\n    <div class="constructor-layout">')

content = content.replace(
    '<nav class="sidebar-menu">',
    '<nav class="sidebar-menu" :style="isBlocked && sidebarView !== \'payment\' ? \'pointer-events: none; opacity: 0.5;\' : \'\'">'
)

with open('src/Constructor.vue', 'w', encoding='utf-8') as f:
    f.write(content)