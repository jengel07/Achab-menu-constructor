const fs = require('fs');
let code = fs.readFileSync('src/views/SuperAdminView.vue', 'utf8');

const tariffsHTML = `
      <!-- 2. ВКЛАДКА: ТАРИФЫ -->
      <div v-if="currentTab === 'tariffs'" class="tariffs-container">
        <div class="tariff-card" v-for="plan in tariffsList" :key="plan.id">
          <div class="t-header">
            <h3>{{ plan.name }}</h3>
            <div class="t-price">{{ plan.pricePerMonth }} ₽ <span>/ мес</span></div>
          </div>
          <ul class="t-features">
            <li v-for="(feature, idx) in (plan.features || '').split(',')" :key="idx">✅ {{ feature.trim() }}</li>
          </ul>
          <button class="t-btn-edit" @click="openTariffModal(plan)">Редактировать тариф</button>
          <button class="t-btn-edit" style="margin-top: 8px; background: #ef4444; color: white;" @click="deleteTariff(plan.id)">Удалить</button>
        </div>
        
        <div class="tariff-card add-new" @click="openTariffModal(null)">
          <div class="add-icon">+</div>
          <p>Добавить тариф</p>
        </div>
      </div>
`;

code = code.replace(/<!-- 2\. .*? -->[\s\S]*?(?=<!-- 3\. )/, tariffsHTML + '\n\n      ');

const tariffModalHTML = `
    <!-- Модалка Тарифа -->
    <div v-if="showTariffModal" class="modal-overlay" @click.self="showTariffModal = false">
      <div class="modal-content" style="max-height: 90vh; overflow-y: auto;">
        <h2>{{ tariffData.id ? 'Редактировать тариф' : 'Новый тариф' }}</h2>
        <div class="form-group">
          <label>Название</label>
          <input type="text" v-model="tariffData.name" class="form-input" />
        </div>
        <div class="form-group">
          <label>Базовая цена (за месяц)</label>
          <input type="number" v-model="tariffData.pricePerMonth" class="form-input" />
        </div>
        <div class="form-group">
          <label>Цена за 6 месяцев (со скидкой)</label>
          <input type="number" v-model="tariffData.pricePer6Months" class="form-input" />
        </div>
        <div class="form-group">
          <label>Цена за год (со скидкой)</label>
          <input type="number" v-model="tariffData.pricePerYear" class="form-input" />
        </div>
        <div class="form-group">
          <label>Фичи (через запятую)</label>
          <textarea v-model="tariffData.features" class="form-input" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>Инструкция для ручной оплаты (Реквизиты, банк)</label>
          <textarea v-model="tariffData.paymentInstruction" class="form-input" rows="4"></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showTariffModal = false">Отмена</button>
          <button class="btn-primary" @click="saveTariff">Сохранить</button>
        </div>
      </div>
    </div>
`;
code = code.replace(/<\/div>\s*<\/template>/, tariffModalHTML + '\n  </div>\n</template>');

const tariffScript = `
const showTariffModal = ref(false);
const tariffData = ref({ id: '', name: '', pricePerMonth: 0, pricePer6Months: 0, pricePerYear: 0, features: '', paymentInstruction: '' });

const openTariffModal = (plan: any) => {
  if (plan) {
    tariffData.value = { ...plan };
  } else {
    tariffData.value = { id: '', name: '', pricePerMonth: 0, pricePer6Months: 0, pricePerYear: 0, features: '', paymentInstruction: '' };
  }
  showTariffModal.value = true;
};

const saveTariff = async () => {
  try {
    const payload = {
      name: tariffData.value.name,
      pricePerMonth: Number(tariffData.value.pricePerMonth),
      pricePer6Months: Number(tariffData.value.pricePer6Months),
      pricePerYear: Number(tariffData.value.pricePerYear),
      features: tariffData.value.features,
      paymentInstruction: tariffData.value.paymentInstruction
    };
    if (tariffData.value.id) {
      await superAdminApi.updateTariff(tariffData.value.id, payload);
    } else {
      await superAdminApi.createTariff(payload);
    }
    showTariffModal.value = false;
    loadTariffs();
  } catch (e: any) {
    alert('Ошибка: ' + e.message);
  }
};

const deleteTariff = async (id: string) => {
  if (confirm('Точно удалить тариф?')) {
    await superAdminApi.deleteTariff(id);
    loadTariffs();
  }
};
`;

code = code.replace(/onMounted\(\(\) => \{/, tariffScript + '\n\nonMounted(() => {');

fs.writeFileSync('src/views/SuperAdminView.vue', code);
console.log('Tariff modal added');

