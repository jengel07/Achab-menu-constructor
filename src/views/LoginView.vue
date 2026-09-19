<template>
  <div class="login-page">
    <!-- Логотип в левом верхнем углу -->
    <header class="login-header">
      <img src="/logo-light.png" class="brand-logo-img" alt="Achab Menu" />
    </header>

    <!-- Основная карточка входа/регистрации -->
    <main class="login-container">
      <!-- Вкладки Вход / Регистрация -->
      <div class="auth-tabs">
        <button
          type="button"
          class="auth-tab"
          :class="{ active: !isRegistering }"
          @click="switchMode(false)"
        >
          Вход
        </button>
        <button
          type="button"
          class="auth-tab"
          :class="{ active: isRegistering }"
          @click="switchMode(true)"
        >
          Регистрация
        </button>
      </div>

      <p class="welcome-text">
        {{ isRegistering ? 'Заполните данные для регистрации.' : 'С возвращением! Введите email и пароль.' }}
      </p>

      <form @submit.prevent="handleSubmit" class="login-form">
        <!-- Поле имени (только для регистрации) -->
        <div class="form-group" v-if="isRegistering">
          <label for="register-name">Имя</label>
          <input
            id="register-name"
            name="name"
            v-model="name"
            type="text"
            placeholder="Ваше имя"
            required
          />
        </div>

        <!-- Email field -->
        <div class="form-group">
          <label for="user-email">Email адрес</label>
          <input
            id="user-email"
            name="email"
            v-model="email"
            type="email"
            placeholder="m@example.com"
            required
          />
        </div>

        <!-- Password field -->
        <div class="form-group">
          <label for="user-password">Пароль</label>
          <div class="password-input-wrapper">
            <input
              id="user-password"
              name="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="******"
              required
            />
            <button
              type="button"
              class="btn-toggle-eye"
              @click="showPassword = !showPassword"
            >
              👁️
            </button>
          </div>
        </div>

        <div class="forgot-wrapper" v-if="!isRegistering">
          <a href="#" class="forgot-link">Забыли пароль?</a>
        </div>

        <!-- Сообщение об ошибке -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
          <!-- Кнопка быстрого переключения на вход, если email уже занят -->
          <button
            v-if="showSwitchToLogin"
            type="button"
            class="btn-switch-inline"
            @click="switchMode(false)"
          >
            Войти с этим email →
          </button>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="btn-primary" :disabled="isLoading">
          <span v-if="isLoading">⏳ Загрузка...</span>
          <span v-else>{{ isRegistering ? 'Создать аккаунт' : 'Войти' }}</span>
        </button>
      </form>



      <!-- Footer Policy Links -->
      <footer class="legal-footer">
        Регистрируясь, вы соглашаетесь с нашими
        <a href="#">Условиями использования</a> и
        <a href="#">Политикой конфиденциальности</a>.
      </footer>
    </main>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { authApi, setToken } from '../api';
import { useMenuStore } from '../store/menuStore';

const router = useRouter();
const route = useRoute();
const menuStore = useMenuStore();

// По умолчанию — режим ВХОДА, не регистрации
const isRegistering = ref(false);
const name = ref('');
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');
// Показывать ли кнопку «Войти с этим email →» после ошибки «уже существует»
const showSwitchToLogin = ref(false);

/** Переключение между режимами Вход / Регистрация с очисткой ошибок */
const switchMode = (register: boolean) => {
  isRegistering.value = register;
  errorMessage.value = '';
  showSwitchToLogin.value = false;
};

/** Применяем результат успешного ответа бэкенда */
const applyAuthResult = (result: {
  token: string;
  restaurantId: string;
  name: string;
  role?: string;
}) => {
  setToken(result.token);

  const role = result.role || 'admin';

  localStorage.setItem('currentUser', JSON.stringify({
    restaurantId: result.restaurantId,
    name: result.name,
    email: email.value,
    role,
  }));

  menuStore.loadUserInfo();

  // Редирект по роли с гибкой проверкой
  const lowerRole = role.toLowerCase();
  
  // ПРОПИШИТЕ СЮДА ВАШ ЛИЧНЫЙ EMAIL:
  if (email.value === 'geller.9797@mail.ru') { 
    router.push('/super-admin');
  } 
  else if (
    lowerRole.includes('cook') ||
    lowerRole.includes('chef') ||
    lowerRole.includes('waiter') ||
      lowerRole.includes('barista') ||
      lowerRole.includes('бармен') ||
    lowerRole.includes('повар') ||
    lowerRole.includes('официант')
  ) {
    router.push('/kitchen-orders');
  } else {
    menuStore.loadFromServer();
    router.push('/constructor');
  }
};

const handleSubmit = async () => {
  errorMessage.value = '';
  showSwitchToLogin.value = false;
  isLoading.value = true;

  try {
    if (isRegistering.value) {
      // ── Режим РЕГИСТРАЦИИ ──────────────────────────────────────
      try {
        const result = await authApi.register({
          email: email.value,
          password: password.value,
          name: name.value || undefined,
        });
        applyAuthResult(result);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '';
        // Если email уже занят — предлагаем войти вместо регистрации
        if (
          msg.includes('уже существует') ||
          msg.includes('already') ||
          msg === 'HTTP 409'
        ) {
          errorMessage.value = 'Пользователь с таким email уже зарегистрирован.';
          showSwitchToLogin.value = true;
        } else {
          errorMessage.value = msg || 'Ошибка регистрации. Попробуйте снова.';
        }
      }
    } else {
      // ── Режим ВХОДА ───────────────────────────────────────────
      const result = await authApi.login({
        email: email.value,
        password: password.value,
      });
      applyAuthResult(result);
    }
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error
      ? err.message
      : 'Произошла ошибка. Попробуйте снова.';
  } finally {
    isLoading.value = false;
  }
};



const checkAutoLogin = () => {
  if (route.query.email && route.query.password) {
    email.value = Array.isArray(route.query.email) ? route.query.email[0] : route.query.email;
    password.value = Array.isArray(route.query.password) ? route.query.password[0] : route.query.password;
    
    // Clear query so it doesn't loop
    const query = { ...route.query };
    delete query.email;
    delete query.password;
    router.replace({ query });

    isRegistering.value = false;
    handleSubmit();
  }
};

onMounted(checkAutoLogin);
watch(() => route.query, checkAutoLogin, { immediate: true });
</script>


<style scoped>
.login-page {
  min-height: 100vh;
  background-color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1a1a1a;
  display: flex;
  flex-direction: column;
}

.top-nav {
  padding: 30px 40px;
}

.brand-logo {
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -0.5px;
  color: #000000;
}

.login-container {
  max-width: 400px;
  width: 100%;
  margin: 40px auto auto auto;
  padding: 0 20px;
  text-align: center;
}

.auth-tabs {
  display: flex;
  background-color: #f3f3f3;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 24px;
}

.auth-tab {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 9px;
  transition: background-color 0.2s, color 0.2s;
  color: #6b7280;
}

.auth-tab.active {
  background-color: #ffffff;
  color: #000000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.welcome-text {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 24px;
}

.login-form {
  text-align: left;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #1a1a1a;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid #eaeaea;
  background-color: #f3f3f3;
  font-size: 14px;
  color: #1a1a1a;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s, background-color 0.2s;
}

.form-group input:focus {
  background-color: #ffffff;
  border-color: #000000;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.btn-toggle-eye {
  position: absolute;
  right: 14px;
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0.5;
  font-size: 14px;
}

.btn-toggle-eye:hover {
  opacity: 1;
}

.forgot-wrapper {
  margin-bottom: 24px;
}

.forgot-link {
  font-size: 13px;
  font-weight: 600;
  color: #000000;
  text-decoration: underline;
}

.error-message {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  margin-bottom: 14px;
  text-align: center;
}

.btn-switch-inline {
  display: block;
  margin: 8px auto 0 auto;
  background: none;
  border: none;
  color: #dc2626;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  font-size: 12px;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background-color: #18181b;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s, opacity 0.2s;
  margin-bottom: 12px;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary:not(:disabled):hover {
  background-color: #000000;
}



.legal-footer {
  margin-top: 60px;
  margin-bottom: 30px;
  font-size: 11px;
  color: #6b7280;
  line-height: 1.5;
}

.legal-footer a {
  color: #000000;
  font-weight: 700;
  text-decoration: none;
}

.legal-footer a:hover {
  text-decoration: underline;
}

.brand-logo-img {
  height: 48px;
  object-fit: contain;
  margin-bottom: 24px;
}
</style>
