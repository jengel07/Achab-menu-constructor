<template>
  <div class="client-wrapper" :style="{ backgroundColor: restaurantInfo.backgroundColor || '#f4f6f3' }">
    <button class="close-preview-btn" @click="goToConstructor">
      ✕ {{ t('closePreview') || 'Закрыть предпросмотр' }}
    </button>

    <div class="phone-mockup">
      <div class="phone-screen" :style="{  
        backgroundColor: restaurantInfo.backgroundColor || '#121212',  
        color: restaurantInfo.textColor || '#fff'  
      }">
        
        <div class="phone-body">
          <div class="phone-header" :style="{  
          backgroundColor: restaurantInfo.secondaryColor || '#333',  
          backgroundImage: restaurantInfo.coverImage  
            ? (restaurantInfo.showCoverGradient !== false  
              ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${restaurantInfo.coverImage})`  
              : `url(${restaurantInfo.coverImage})`)  
            : 'none',  
          backgroundSize: 'cover',  
          backgroundPosition: 'center'  
        }">
          <div class="phone-avatar-wrapper">
            <div class="phone-avatar-placeholder">
              <span v-if="!restaurantInfo.avatarImage">🍽️</span>
              <img v-else :src="restaurantInfo.avatarImage" alt="Аватар" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
          </div>
          <div class="phone-logo" style="color: #ffffff;">{{ restaurantInfo.name || 'Jazzve' }}</div>
        </div>

          
          <div  
            v-if="Boolean(store.generalSettings?.wifiEnabled)"  
            class="wifi-card-widget"  
            @click="isWifiExpanded = !isWifiExpanded"
            :style="{  
              backgroundColor: restaurantInfo.secondaryColor ? restaurantInfo.secondaryColor + '22' : 'rgba(255, 255, 255, 0.08)',  
              color: restaurantInfo.textColor || '#fff',
              border: '1px solid ' + (restaurantInfo.secondaryColor ? restaurantInfo.secondaryColor + '44' : 'rgba(255, 255, 255, 0.15)')
            }"
          >
            <div class="wifi-card-main-row">
              <div class="wifi-card-left">
                <div class="wifi-card-icon-box">ℹ️</div>
                <div class="wifi-card-texts">
                  <div class="wifi-card-title">{{ t('info') || 'Информация' }}</div>
                  <div class="wifi-card-subtitle">Wi-Fi</div>
                </div>
              </div>
              <div class="wifi-card-chevron" :style="{ transform: isWifiExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }">›</div>
            </div>

            <div v-if="isWifiExpanded" class="wifi-expanded-content" @click.stop>
              <div class="wifi-info-row">
                <span>{{ t('network') || 'Сеть' }}:</span> <b>{{ store.generalSettings?.wifiSsid || 'Не указана' }}</b>
              </div>
              <div class="wifi-info-row" style="margin-top: 4px;">
                <span>{{ t('password') || 'Пароль' }}:</span> <b style="user-select: all;">{{ store.generalSettings?.wifiPassword || 'Не указан' }}</b>
              </div>
            </div>
          </div>

          <PromoBanners :restaurantId="computedRestaurantId" />

          <div class="phone-categories">
            <button  
              class="phone-cat-badge"  
              :class="{ active: selectedCategory === 'all' }"
              :style="selectedCategory === 'all' ? { backgroundColor: restaurantInfo.primaryColor || '#9D0D0E', color: '#fff' } : {}"
              @click="selectedCategory = 'all'"
            >
              {{ t('allCategories') }}
            </button>
            <button  
              v-for="cat in categories"  
              :key="cat.id || cat.name"
              class="phone-cat-badge"
              :class="{ active: selectedCategory === (cat.id || cat.name) }"
              :style="selectedCategory === (cat.id || cat.name) ? { backgroundColor: restaurantInfo.primaryColor || '#9D0D0E', color: '#fff' } : {}"
              @click="selectedCategory = (cat.id || cat.name)"
            >
              {{ getLocalizedCategoryName(cat) }}
            </button>
          </div>

          <div v-if="filteredItems.length === 0" class="empty-search-notice">
            {{ t('noDishes') }}
          </div>
          <div v-else :class="viewMode === 'grid' ? 'menu-items-grid-phone' : (viewMode === 'full' ? 'menu-items-full-phone' : 'menu-items-list-phone')">
            <div v-for="item in filteredItems" :key="item.id" :class="viewMode === 'grid' ? 'menu-card' : (viewMode === 'full' ? 'menu-card-full' : 'menu-list-row')">
              <img v-if="(viewMode === 'grid' || viewMode === 'full') && item.image" :src="item.image" :alt="getItemName(item)" />
              <div class="card-content">
                <div class="card-text-block">
                  <h3>{{ getItemName(item) }}</h3>
                  <span v-if="viewMode === 'list'" class="price" :style="{ color: restaurantInfo.primaryColor || '#9D0D0E', whiteSpace: 'nowrap' }">
                    <template v-if="!item.priceBottle && !item.priceGlass">{{ Number(item.price || 0).toFixed(2) }} ₽</template>
                    <template v-else>{{ [item.priceGlass, item.priceBottle].filter(p => p).join(' / ') }} ₽</template>
                  </span>
                  <p v-if="(viewMode === 'grid' || viewMode === 'full') && getItemDescription(item)">{{ getItemDescription(item) }}</p>
                </div>
                <div class="card-bottom-row" style="flex-direction: column; gap: 8px;">
                  <span v-if="viewMode === 'grid' || viewMode === 'full'" class="price" :style="{ color: restaurantInfo.primaryColor || '#9D0D0E', fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap' }">
                    <template v-if="!item.priceBottle && !item.priceGlass">
                      {{ Number(item.price || 0).toFixed(2) }} ₽
                    </template>
                    <template v-else>
                      {{ [item.priceGlass, item.priceBottle].filter(p => p).join(' / ') }} ₽
                    </template>
                  </span>
                  
                  <div v-else></div>

                  <div v-if="!item.priceBottle && !item.priceGlass">
                    <div v-if="getItemQuantity(item.id) > 0" class="counter-controls" :style="{ borderColor: restaurantInfo.primaryColor || '#9D0D0E' }">
                      <button class="counter-btn" @click="decreaseQuantity(item.id)">-</button>
                      <span class="counter-value">{{ getItemQuantity(item.id) }}</span>
                      <button class="counter-btn" @click="increaseQuantity(item.id)">+</button>
                    </div>
                    <button v-else class="add-to-cart-btn" :style="{ backgroundColor: restaurantInfo.primaryColor || '#9D0D0E', width: '100%', padding: '6px 12px' }" @click="item.modifiers && item.modifiers.length > 0 ? modifierItem = item : addToCart(item)">+ {{ item.modifiers && item.modifiers.length > 0 ? tDyn('опции') : tDyn('добавить') }}</button>
                  </div>

                  <div v-else>
                    <button class="add-to-cart-btn" :style="{ backgroundColor: restaurantInfo.primaryColor || '#9D0D0E', width: '100%', padding: '6px 12px' }" @click="openVariantModal(item)">
                      + {{ tDyn('выбрать') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SettingsbarForClient 
          v-if="!showCheckoutModal"
          :primaryColor="restaurantInfo.primaryColor"
          :secondaryColor="restaurantInfo.secondaryColor"
          :currentLang="currentLang"
          :viewMode="viewMode"
          :activeModal="activeModal"
          :cartItems="cartItems"
          :totalPrice="totalPrice"
          :searchQuery="searchQuery"
          :selectedFilters="selectedFilters"
          :restaurantInfo="restaurantInfo"
          :getItemName="getItemName"
          :tDyn="tDyn"
          @open="(m) => activeModal = m"
          @close="activeModal = 'none'"
          @toggle-view="toggleViewMode"
          @select-lang="selectLanguage"
          @clear-cart="cartItems = []"
          @increase="increaseQuantity"
          @decrease="decreaseQuantity"
          @checkout="startCheckout"
          @toggle-filter="toggleFilter"
          @clear-filters="selectedFilters = []"
          @update:searchQuery="val => searchQuery = val"
        />

<!-- WAITER CALL MODAL -->
    <div v-if="showCallWaiterModal" class="bottom-sheet-overlay" @click.self="showCallWaiterModal = false">
      <div class="bottom-sheet" style="background: white; padding: 24px; border-radius: 20px 20px 0 0; color: #111;">
        <div style="width: 40px; height: 4px; background: #e0e0e0; border-radius: 2px; margin: 0 auto 16px;"></div>
        <h3 style="margin: 0 0 16px 0; font-size: 18px; text-align: center;">{{ tDyn('Позвать официанта') }}</h3>
        
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button @click="submitWaiterCall('Принести счет (картой)')" class="waiter-option-btn">💳 {{ tDyn('Принести счет (картой)') }}</button>
          <button @click="submitWaiterCall('Принести счет (наличными)')" class="waiter-option-btn">💵 {{ tDyn('Принести счет (наличными)') }}</button>
          <button @click="submitWaiterCall('Позвать кальянщика')" class="waiter-option-btn">💨 {{ tDyn('Позвать кальянщика') }}</button>
          <button @click="submitWaiterCall('Просто подойти')" class="waiter-option-btn">🙋 {{ tDyn('Просто подойти') }}</button>
        </div>
      </div>
    </div>


        <div v-if="activeModal === 'variant' && selectedVariantItem" class="checkout-modal-overlay" @click.self="activeModal = 'none'">
          <div class="checkout-modal" style="border-radius: 20px 20px 0 0;">
            <div class="checkout-header">
              <h3 style="margin: 0; font-size: 16px;">{{ getItemName(selectedVariantItem) }}</h3>
              <button class="close-modal-btn" @click="activeModal = 'none'">✕</button>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
              <div v-if="selectedVariantItem.priceGlass" style="display: flex; justify-content: space-between; align-items: center; background: #f9f9f9; padding: 12px; border-radius: 12px;">
                <span style="font-weight: bold; font-size: 14px; color: #111;">{{ selectedVariantItem.priceGlassLabel || tDyn('Бокал') }}<br><span style="color: #666; font-size: 12px; font-weight: normal;">{{ Number(selectedVariantItem.priceGlass || 0).toFixed(2) }} ₽</span></span>
                
                <div v-if="getItemQuantity(selectedVariantItem.id + '_glass') > 0" class="counter-controls" :style="{ borderColor: restaurantInfo.primaryColor || '#9D0D0E', width: '90px' }">
                  <button class="counter-btn" @click="decreaseQuantity(selectedVariantItem.id + '_glass')">-</button>
                  <span class="counter-value">{{ getItemQuantity(selectedVariantItem.id + '_glass') }}</span>
                  <button class="counter-btn" @click="increaseQuantity(selectedVariantItem.id + '_glass')">+</button>
                </div>
                <button v-else class="add-to-cart-btn" :style="{ backgroundColor: restaurantInfo.primaryColor || '#9D0D0E', width: 'auto', padding: '8px 16px', color: 'white' }" @click="addToCart({ ...selectedVariantItem, id: selectedVariantItem.id + '_glass', price: selectedVariantItem.priceGlass, name: ((selectedVariantItem.name?.ru || selectedVariantItem.name) + ' (' + (selectedVariantItem.priceGlassLabel || tDyn('Бокал')) + ')') })">
                  + {{ tDyn('добавить') }}
                </button>
              </div>

              <div v-if="selectedVariantItem.priceBottle" style="display: flex; justify-content: space-between; align-items: center; background: #f9f9f9; padding: 12px; border-radius: 12px;">
                <span style="font-weight: bold; font-size: 14px; color: #111;">{{ selectedVariantItem.priceBottleLabel || tDyn('Бутылка') }}<br><span style="color: #666; font-size: 12px; font-weight: normal;">{{ Number(selectedVariantItem.priceBottle || 0).toFixed(2) }} ₽</span></span>
                
                <div v-if="getItemQuantity(selectedVariantItem.id + '_bottle') > 0" class="counter-controls" :style="{ borderColor: restaurantInfo.primaryColor || '#9D0D0E', width: '90px' }">
                  <button class="counter-btn" @click="decreaseQuantity(selectedVariantItem.id + '_bottle')">-</button>
                  <span class="counter-value">{{ getItemQuantity(selectedVariantItem.id + '_bottle') }}</span>
                  <button class="counter-btn" @click="increaseQuantity(selectedVariantItem.id + '_bottle')">+</button>
                </div>
                <button v-else class="add-to-cart-btn" :style="{ backgroundColor: restaurantInfo.primaryColor || '#9D0D0E', width: 'auto', padding: '8px 16px', color: 'white' }" @click="addToCart({ ...selectedVariantItem, id: selectedVariantItem.id + '_bottle', price: selectedVariantItem.priceBottle, name: ((selectedVariantItem.name?.ru || selectedVariantItem.name) + ' (' + (selectedVariantItem.priceBottleLabel || tDyn('Бутылка')) + ')') })">
                  + {{ tDyn('добавить') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="showCheckoutModal" class="checkout-modal-overlay" @click.self="closeModal">
          <div class="checkout-modal">
            
            <template v-if="checkoutStep === 1">
              <div class="checkout-header">
                <h3>{{ tDyn('Оформление заказа') }}</h3>
                <button class="close-modal-btn" @click="closeModal">✕</button>
              </div>
              
              <form @submit.prevent="goToReviewStep" class="checkout-form">
                <div class="form-group">
                  <label>{{ tDyn('Тип заказа') }}</label>
                  <select v-model="customerForm.orderType">
                    <option value="dine_in">🍽️ {{ tDyn('В заведении (Столик)') }}</option>
                    <option value="takeaway">🏃 {{ tDyn('С собой (Самовывоз)') }}</option>
                    <option value="delivery">🚗 {{ tDyn('Доставка') }}</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>{{ tDyn('Имя') }} {{ customerForm.orderType === 'dine_in' ? tDyn('(необязательно)') : '' }}</label>
                  <input 
                    v-model="customerForm.name" 
                    type="text" 
                    :placeholder="tDyn('Введите ваше имя')" 
                    :required="customerForm.orderType !== 'dine_in'" 
                  />
                </div>

                <div class="form-group">
                  <label>{{ tDyn('Телефон') }} {{ customerForm.orderType === 'dine_in' ? tDyn('(необязательно)') : '' }}</label>
                  <input 
                    v-model="customerForm.phone" 
                    type="tel" 
                    placeholder="+7 (999) 000-00-00" 
                    :required="customerForm.orderType !== 'dine_in'" 
                  />
                </div>

                <div v-if="customerForm.orderType === 'dine_in'" class="form-group">
                  <label>{{ tDyn('Номер столика') }}</label>
                  <input v-model="customerForm.tableNumber" type="text" :placeholder="tDyn('Например: 5')" required />
                </div>

                <div v-if="customerForm.orderType === 'delivery'" class="form-group">
                  <label>{{ tDyn('Адрес доставки') }}</label>
                  <input v-model="customerForm.address" type="text" :placeholder="tDyn('Улица, дом, квартира')" required />
                </div>

                <div v-if="customerForm.orderType === 'takeaway'" class="time-picker-block">
                  <label class="block-title">{{ tDyn('Когда приготовить?') }}</label>
                  <div class="time-inputs-row">
                    <input v-model="customerForm.scheduledTime" type="time" class="time-input" />
                    <input v-model="customerForm.scheduledDate" type="date" class="date-input" />
                  </div>
                  <span class="hint-text">{{ tDyn('Нам нужно около 15–20 минут на приготовление') }}</span>
                </div>

                <div v-if="customerForm.orderType === 'delivery'" class="time-picker-block">
                  <label class="block-title">{{ tDyn('Когда доставить?') }}</label>
                  <div class="time-inputs-row">
                    <input v-model="customerForm.scheduledTime" type="time" class="time-input" />
                    <input v-model="customerForm.scheduledDate" type="date" class="date-input" />
                  </div>
                </div>

                <div class="form-group">
                  <label>{{ tDyn('Примечание (необязательно)') }}</label>
                  <textarea v-model="customerForm.comment" :placeholder="tDyn('Напр., соусы отдельно? всё в один пакет?')"></textarea>
                </div>



                <div class="checkout-summary">
                  <span>{{ tDyn('Итого к оплате:') }}</span>
                  <strong>{{ totalPrice.toFixed(2) }} ₽</strong>
                </div>

                <button 
                  type="submit" 
                  class="submit-order-btn"
                  :style="{ backgroundColor: restaurantInfo.primaryColor || '#9D0D0E' }"
                >
                  {{ tDyn('Далее: Проверить заказ') }}
                </button>
              </form>
            </template>

            <template v-else-if="checkoutStep === 2">
              <div class="checkout-header">
                <button class="back-btn" @click="checkoutStep = 1">〈</button>
                <h3>{{ tDyn('Проверка заказа') }}</h3>
                <button class="close-modal-btn" @click="closeModal">✕</button>
              </div>

              <div class="review-screen-content">
                <div class="review-card-block">
                  <div class="review-card-title">{{ tDyn('Итого заказа') }}</div>
                  <div class="review-items-list">
                    <div v-for="item in cartItems" :key="item.id" class="review-item-row">
                      <span class="r-name"><b>{{ item.quantity }}x</b> {{ getItemName(item) }}</span>
                      <span class="r-price">RUB {{ (Number(item.price || 0) * item.quantity).toFixed(2) }}</span>
                    </div>
                  </div>
                  <div class="review-totals-divider"></div>
                  <div class="review-total-line">
                    <span>{{ tDyn('Подытог') }}</span>
                    <span>RUB {{ totalPrice.toFixed(2) }}</span>
                  </div>
                  <div class="review-total-line">
                    <span>{{ tDyn('Доставка / Сбор') }}</span>
                    <span>RUB 0.00</span>
                  </div>
                  <div class="review-total-line main-total">
                    <span>{{ tDyn('Итого') }}</span>
                    <span>RUB {{ totalPrice.toFixed(2) }}</span>
                  </div>
                </div>

                <div class="review-card-block">
                  <div class="review-card-title">{{ tDyn('Ваши данные') }}</div>
                  <div class="data-row" v-if="customerForm.name">
                    <span class="icon">👤</span>
                    <div>
                      <div class="label-muted">{{ tDyn('Имя') }}</div>
                      <div class="val">{{ customerForm.name }}</div>
                    </div>
                  </div>
                  <div class="data-row" v-if="customerForm.phone">
                    <span class="icon">📞</span>
                    <div>
                      <div class="label-muted">{{ tDyn('Телефон') }}</div>
                      <div class="val">{{ customerForm.phone }}</div>
                    </div>
                  </div>
                  <div class="data-row" v-if="customerForm.comment">
                    <span class="icon">📝</span>
                    <div>
                      <div class="label-muted">{{ tDyn('Примечание') }}</div>
                      <div class="val">{{ customerForm.comment }}</div>
                    </div>
                  </div>
                  <div class="data-row" v-if="customerForm.orderType === 'dine_in'">
                    <span class="icon">🪑</span>
                    <div>
                      <div class="label-muted">{{ tDyn('Столик') }}</div>
                      <div class="val">№ {{ customerForm.tableNumber }}</div>
                    </div>
                  </div>
                  <div class="data-row" v-if="customerForm.orderType === 'delivery'">
                    <span class="icon">📍</span>
                    <div>
                      <div class="label-muted">{{ tDyn('Адрес доставки') }}</div>
                      <div class="val">{{ customerForm.address }}</div>
                    </div>
                  </div>
                </div>

                <div class="review-card-block">
                  <div class="review-card-title">
                    {{ customerForm.orderType === 'takeaway' ? tDyn('Время самовывоза') : (customerForm.orderType === 'delivery' ? tDyn('Время доставки') : tDyn('Время визита')) }}
                  </div>
                  <div class="time-badge-box">
                    📅 {{ customerForm.scheduledDate }} {{ tDyn('в') }} {{ customerForm.scheduledTime }}
                  </div>
                  <div class="hint-text" style="margin-top: 4px;">{{ tDyn('Пожалуйста, приходите вовремя') }}</div>
                </div>

                <div v-if="customerForm.orderType === 'takeaway'" class="review-card-block map-block-wrapper">
                  <div class="review-card-title">{{ tDyn('Как добраться (Самовывоз)') }}</div>
                  <div class="map-container">
                    <div style="position:relative;overflow:hidden;border-radius:8px;">
                      <iframe src="https://yandex.ru/map-widget/v1/?ll=41.024008%2C43.001192&mode=poi&poi%5Bpoint%5D=41.023803%2C43.001167&poi%5Buri%5D=ymapsbm1%3A%2F%2Forg%3Foid%3D43328610653&z=19.47" width="100%" height="140" frameborder="0" allowfullscreen="true" style="position:relative;"></iframe>
                    </div>
                  </div>
                  <a href="https://yandex.com/maps/-/CTrKi8~b" target="_blank" rel="noopener noreferrer" class="yandex-map-btn">
                    {{ tDyn('Открыть в Яндекс Картах') }}
                  </a>
                </div>

                <div class="legal-notice">
                  {{ tDyn('Размещая заказ, вы соглашаетесь на обработку ваших данных для его выполнения.') }}
                </div>


                

                <div class="review-actions-row">
                  <button class="btn-secondary-action" @click="checkoutStep = 1">{{ tDyn('Назад') }}</button>
                  <button class="btn-primary-action" @click="confirmOrder" :style="{ backgroundColor: restaurantInfo.primaryColor || '#9D0D0E' }">
                    {{ tDyn('Разместить заказ') }}
                  </button>
                </div>
              
    

  </div>
</template>

          </div>
        </div>

          
          

<div v-if="activeOrders.length > 0 && !showCheckoutModal" style="position: absolute; top: 15px; left: 12px; right: 12px; z-index: 50; display: flex; flex-direction: column; align-items: flex-end; pointer-events: none;">
  
  <div v-if="!isOrdersListExpanded" class="orders-mini-icon" @click="isOrdersListExpanded = true" style="pointer-events: auto; position: relative; width: 44px; height: 44px; background: white; border-radius: 50%; display: flex; justify-content: center; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); cursor: pointer; color: #111;">
    <Receipt :size="20" stroke-width="2" />
    <span class="orders-badge" style="position: absolute; top: -2px; right: -2px; background: #ef4444; color: white; font-size: 10px; font-weight: bold; min-width: 18px; height: 18px; border-radius: 9px; display: flex; justify-content: center; align-items: center; padding: 0 4px; box-sizing: border-box;">
      {{ activeOrders.length }}
    </span>
  </div>

  <div v-if="isOrdersListExpanded" class="expanded-panel" style="pointer-events: auto; width: 100%; max-width: 100%; max-height: calc(100dvh - 100px); overflow-y: auto; background: transparent; display: flex; flex-direction: column; gap: 8px; scrollbar-width: none; padding-bottom: 80px;">
    <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center; background: white; padding: 12px 16px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.15);">
      <strong style="color: #111; font-size: 14px;">{{ tDyn('Мои заказы') }} ({{ activeOrders.length }})</strong>
      <button @click="isOrdersListExpanded = false" style="background: rgba(0,0,0,0.05); border: none; color: #333; padding: 4px; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer;">
        <X :size="16" stroke-width="3" />
      </button>
    </div>

    <div v-for="order in activeOrders" :key="order.id" class="active-order-container" style="display: block;">
      <div class="floating-order-bar" @click="isOrderExpanded[order.id] = !isOrderExpanded[order.id]" style="margin-bottom: 8px;">
        <div class="order-bar-icon-wrapper" :class="'status-' + order.status">
          <Clock v-if="order.status === 'new'" :size="20" stroke-width="2" />
          <ChefHat v-else-if="order.status === 'progress'" :size="20" stroke-width="2" />
          <CheckCircle v-else-if="order.status === 'done' || order.status === 'archived'" :size="20" stroke-width="2" />
          <XCircle v-else :size="20" stroke-width="2" />
        </div>
        <div class="order-bar-text">
          <strong>{{ tDyn('Заказ') }} #{{ order.orderNumber || order.id.slice(-4) }}</strong>
          <span>{{ getOrderStatusText(order.status) }}</span>
        </div>
        <div class="order-bar-right">
          <button v-if="order.status === 'done' || order.status === 'archived' || order.status === 'cancelled'" class="close-order-btn" @click.stop="clearActiveOrder(order.id)">
            <X :size="14" stroke-width="3" />
          </button>
          <ChevronDown class="order-bar-chevron" :class="{ 'expanded': isOrderExpanded[order.id] }" :size="20" />
        </div>
      </div>

      
      <div v-if="isOrderExpanded[order.id] && order.items" class="order-tracker-card" style="margin-bottom: 8px; background: white; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; pointer-events: auto;">
        
        <div style="background: #f4f4f4; text-align: center; padding: 12px; font-weight: 600; font-size: 15px; color: #111;">
          {{ tDyn('Заказ №') }}{{ order.orderNumber || order.id.slice(-4) }}
        </div>

        <div style="padding: 24px 16px;">
          <!-- Main Icon -->
          <div style="display: flex; justify-content: center; margin-bottom: 12px;">
            <div style="width: 72px; height: 72px; display: flex; align-items: center; justify-content: center; color: #9D0D0E;">
              <ChefHat v-if="order.status === 'progress'" :size="64" stroke-width="1.5" />
              <CheckCircle v-else-if="order.status === 'done' || order.status === 'archived'" :size="64" stroke-width="1.5" />
              <Clock v-else-if="order.status === 'new' || order.status === 'open'" :size="64" stroke-width="1.5" />
              <XCircle v-else :size="64" stroke-width="1.5" />
            </div>
          </div>
          
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="margin: 0 0 6px 0; font-size: 24px; color: #111;">
              {{ order.status === 'progress' ? tDyn('Готовится') : (order.status === 'done' || order.status === 'archived' ? tDyn('Готов') : (order.status === 'cancelled' ? tDyn('Отменен') : tDyn('Отправлен'))) }}
            </h2>
            <p style="margin: 0; font-size: 13px; color: #666;">
              {{ order.status === 'progress' ? tDyn('Повар уже готовит ваше блюдо') : (order.status === 'done' || order.status === 'archived' ? tDyn('Блюдо готово к подаче') : (order.status === 'cancelled' ? tDyn('Заказ был отменен') : tDyn('Ожидаем подтверждения кухни'))) }}
            </p>
          </div>

          <!-- Stepper -->
          <div v-if="order.status !== 'cancelled'" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; position: relative;">
            
            <div style="position: absolute; top: 16px; left: 10%; right: 10%; height: 3px; background: #e0e0e0; z-index: 1;"></div>
            
            <!-- Progress lines filling the stepper -->
            <div style="position: absolute; top: 16px; left: 10%; height: 3px; background: #4caf50; z-index: 2; transition: width 0.3s;"
                 :style="{ width: (order.status === 'progress' ? '50%' : (order.status === 'done' || order.status === 'archived' ? '100%' : '0%')) }">
            </div>

            <!-- Step 1: Sent -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; z-index: 3; flex: 1;">
              <div style="width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;"
                   :style="{ background: (order.status === 'new' || order.status === 'open') ? '#9D0D0E' : '#4caf50' }">
                <Check v-if="order.status === 'progress' || order.status === 'done' || order.status === 'archived'" :size="18" stroke-width="3"/>
                <Clock v-else :size="18" stroke-width="2"/>
              </div>
              <span style="font-size: 10px; font-weight: 600;" :style="{ color: '#333' }">{{ tDyn('Отправлен') }}</span>
            </div>

            <!-- Step 2: Accepted (Bundled with progress visually for simplicity, or lit if progress/done) -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; z-index: 3; flex: 1;">
              <div style="width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;"
                   :style="{ background: (order.status === 'progress' || order.status === 'done' || order.status === 'archived') ? '#4caf50' : '#e0e0e0' }">
                <Check v-if="order.status === 'progress' || order.status === 'done' || order.status === 'archived'" :size="18" stroke-width="3"/>
                <span v-else style="color: #888; font-weight: bold; font-size: 14px;">2</span>
              </div>
              <span style="font-size: 10px; font-weight: 600;" :style="{ color: (order.status === 'progress' || order.status === 'done' || order.status === 'archived') ? '#333' : '#888' }">{{ tDyn('Принят') }}</span>
            </div>

            <!-- Step 3: Cooking -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; z-index: 3; flex: 1;">
              <div style="width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;"
                   :style="{ 
                      background: (order.status === 'done' || order.status === 'archived') ? '#4caf50' : (order.status === 'progress' ? '#9D0D0E' : '#e0e0e0'),
                      boxShadow: order.status === 'progress' ? '0 0 0 4px rgba(106, 33, 49, 0.2)' : 'none'
                   }">
                <Check v-if="order.status === 'done' || order.status === 'archived'" :size="18" stroke-width="3"/>
                <Clock v-else-if="order.status === 'progress'" :size="18" stroke-width="2"/>
                <span v-else style="color: #888; font-weight: bold; font-size: 14px;">3</span>
              </div>
              <span style="font-size: 10px; font-weight: 600;" :style="{ color: (order.status === 'done' || order.status === 'archived' || order.status === 'progress') ? (order.status === 'progress' ? '#9D0D0E' : '#333') : '#888' }">{{ tDyn('Готовится') }}</span>
            </div>

            <!-- Step 4: Ready -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; z-index: 3; flex: 1;">
              <div style="width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;"
                   :style="{ 
                      background: (order.status === 'done' || order.status === 'archived') ? '#9D0D0E' : '#e0e0e0',
                      boxShadow: (order.status === 'done' || order.status === 'archived') ? '0 0 0 4px rgba(106, 33, 49, 0.2)' : 'none'
                   }">
                <Check v-if="order.status === 'done' || order.status === 'archived'" :size="18" stroke-width="3"/>
                <span v-else style="color: #888; font-weight: bold; font-size: 14px;">4</span>
              </div>
              <span style="font-size: 10px; font-weight: 600;" :style="{ color: (order.status === 'done' || order.status === 'archived') ? '#9D0D0E' : '#888' }">{{ tDyn('Готов / Подаем') }}</span>
            </div>
          </div>

          <div style="height: 1px; background: #eee; margin: 0 0 16px 0;"></div>

          <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #111;">{{ tDyn('Ваш заказ:') }}</h3>
          
          <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px;">
            <div v-for="item in order.items" :key="item.id" style="display: flex; font-size: 14px; color: #222;">
              <span style="width: 24px; color: #666;">{{ item.quantity }}x</span>
              <span style="flex: 1;">{{ item.name }}</span>
            </div>
          </div>

          <button 
            @click="openCallWaiterModal(order)"
            :disabled="isWaiterLocked"
            style="width: 100%; padding: 14px; color: #111; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s;"
            :style="{ background: isWaiterLocked ? '#d1ffd6' : '#eeeeee', color: isWaiterLocked ? '#10b981' : '#111' }">
            <span v-if="isWaiterLocked">✓ {{ tDyn('Официант уже в пути') }}</span>
            <span v-else>{{ tDyn('Позвать официанта') }}</span>
          </button>

        </div>
      </div>


        <div v-if="order.status === 'done' || order.status === 'archived'" style="animation: fadeIn 0.3s ease; box-shadow: 0 4px 20px rgba(0,0,0,0.4); border-radius: 16px; pointer-events: auto; margin-bottom: 8px;">
      <div class="feedback-widget" style="pointer-events: auto;">
        <div class="feedback-title">{{ tDyn('Вам все понравилось?') }}</div>
        <div class="stars-container">
          <Star 
            v-for="i in 5" :key="i"
            :class="['star-icon', { 'filled': i <= (orderRating[order.id] || 0) }]"
            @click="orderRating[order.id] = i"
          />
        </div>
        
        <div v-if="(orderRating[order.id] || 0) > 0 && !feedbackSubmitted[order.id]" class="feedback-extra" style="animation: slideDown 0.3s ease-out;">
          <div v-if="(orderRating[order.id] || 0) <= 3" class="feedback-options-grid">
            <div 
              v-for="opt in badFeedbackOptions" :key="opt.id"
              class="feedback-option-card"
              :class="{ 'selected': (orderFeedback[order.id] || []).includes(opt.id) }"
              @click.prevent="toggleFeedback(order.id, opt.id)"
            >
              <component :is="opt.icon" class="feedback-opt-icon" />
              <span class="feedback-opt-label">{{ tDyn(opt.label) }}</span>
            </div>
          </div>
          <div v-else class="feedback-options-grid">
            <div 
              v-for="opt in goodFeedbackOptions" :key="opt.id"
              class="feedback-option-card"
              :class="{ 'selected': (orderFeedback[order.id] || []).includes(opt.id) }"
              @click.prevent="toggleFeedback(order.id, opt.id)"
            >
              <component :is="opt.icon" class="feedback-opt-icon" />
              <span class="feedback-opt-label">{{ tDyn(opt.label) }}</span>
            </div>
          </div>
          
          <textarea v-model="orderFeedbackText[order.id]" class="feedback-textarea" :placeholder="tDyn('Расскажите подробнее...')"></textarea>
          <button class="feedback-submit-btn" @click="submitFeedback(order.id)">{{ tDyn('Отправить отзыв') }}</button>
          
          <div v-if="(orderRating[order.id] || 0) >= 4" class="yandex-review-prompt">
            <a :href="store.generalSettings?.yandexReviewLink || 'https://yandex.ru/maps/org/jazzve/43328610653/reviews/'" target="_blank" class="yandex-review-btn">
              Оставить отзыв на Яндекс Картах
            </a>
          </div>
        </div>
        <div v-if="feedbackSubmitted[order.id]" class="feedback-success-msg">
          {{ tDyn('Спасибо за ваш отзыв!') }}
          
          <div v-if="(orderRating[order.id] || 0) >= 4" class="yandex-review-prompt" style="margin-top: 12px;">
            <a :href="store.generalSettings?.yandexReviewLink || 'https://yandex.ru/maps/org/jazzve/43328610653/reviews/'" target="_blank" class="yandex-review-btn">
              Оставить отзыв на Яндекс Картах
            </a>
          </div>
        </div>
      </div>
    </div>

    </div>
  </div>
</div>
<div v-if="cartItems.length > 0 && !showCheckoutModal" class="floating-cart-bar" @click="activeModal = 'cart'" :style="{ backgroundColor: restaurantInfo.primaryColor || '#10b981' }">
          <span style="display: flex; align-items: center; gap: 6px;">
            <ShoppingCart :size="18" stroke-width="2" /> 
            {{ t('cart') }} ({{ totalQuantity }})
          </span>
          <span>{{ totalPrice.toFixed(2) }} ₽</span>
        </div>

      </div>
    </div>
  </div>

  <ClientModifiersModal 
    v-if="modifierItem" 
    :item="modifierItem" 
    :restaurantInfo="restaurantInfo" 
    @close="modifierItem = null" 
    @add-to-cart="(finalItem) => { addToCart(finalItem); modifierItem = null; }" 
  />


</template>

<script setup lang="ts">
import ClientModifiersModal from '../components/ClientModifiersModal.vue';
import { ref, computed, onMounted, onUnmounted, reactive, watch } from 'vue';

const computedRestaurantId = computed(() => {
  try {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return (store.restaurantInfo as any)?.id || (store.restaurantInfo as any)?.restaurantId || user.restaurantId;
  } catch (e) {
    return (store.restaurantInfo as any)?.id || (store.restaurantInfo as any)?.restaurantId;
  }
});
import { useRouter } from 'vue-router';
import { useMenuStore } from '../store/menuStore';
import PromoBanners from '../components/client/PromoBanners.vue';
import SettingsbarForClient from '../components/SettingsbarForClient.vue';
import { Check, Receipt, ShoppingCart, Star, ConciergeBell, ClipboardCheck, Armchair, Clock, ChefHat, CheckCircle, XCircle, ChevronDown, X } from 'lucide-vue-next';

// Динамическое определение IP-адреса хоста
const hostIP = window.location.hostname;
let API_URL = (import.meta as any).env.VITE_API_URL;
// Если VITE_API_URL не задан или это локальный/сетевой IP из .env (который мог измениться), 
// надежнее использовать реальный hostname (IP-адрес), по которому клиент открыл страницу.
if (!API_URL || /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(window.location.hostname) || window.location.hostname === 'localhost') {
  API_URL = `http://${hostIP}:3000`;
}
const router = useRouter();

const translations: Record<string, Record<string, string>> = {
  ru: {
    closePreview: 'Закрыть предпросмотр',
    allCategories: 'Все категории',
    noDishes: 'В данной категории пока нет блюд',
    add: 'добавить',
    cart: 'Корзина',
    nutrition: 'Пищевая ценность',
    nutFree: 'Без орехов',
    lactoseFree: 'Без лактозы',
    glutenFree: 'Без глютена',
    info: 'Информация',
    network: 'Сеть',
    password: 'Пароль'
  },
  en: {
    closePreview: 'Close Preview',
    allCategories: 'All categories',
    noDishes: 'No dishes found',
    add: 'add',
    cart: 'Cart',
    nutrition: 'Nutrition',
    nutFree: 'Nut-free',
    lactoseFree: 'Lactose-free',
    glutenFree: 'Gluten-free',
    info: 'Information',
    network: 'Network',
    password: 'Password'
  }
};

const store = useMenuStore();
const isWifiExpanded = ref(false);

const restaurantInfo = computed(() => store.restaurantInfo);
const items = computed(() => store.items);
const categories = computed(() => store.categories);

const selectedCategory = ref<string>('all');
const currentLang = ref<string>('ru'); 
const viewMode = ref<'grid' | 'list' | 'full'>('full');
const modifierItem = ref<any>(null);
const activeModal = ref<'none' | 'cart' | 'filters' | 'search' | 'share' | 'language' | 'variant'>('none');
const selectedVariantItem = ref<any>(null);
const openVariantModal = (item: any) => { selectedVariantItem.value = item; activeModal.value = 'variant'; };
const searchQuery = ref<string>('');
const selectedFilters = ref<string[]>([]);
const cartItems = ref<any[]>([]);

const getTodayDateStr = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

const getCurrentTimeStr = () => {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const showCheckoutModal = ref(false);
const checkoutStep = ref<1 | 2>(1);

const feedbackOptions = [
  { id: 'kitchen', label: 'Кухня', icon: ConciergeBell },
  { id: 'service', label: 'Обслуживание', icon: ClipboardCheck },
  { id: 'interior', label: 'Интерьер', icon: Armchair }
];

  const submitFeedback = async (orderId: string) => {
  if (!orderId || !orderRating.value[orderId]) return;
  try {
    const fbArr = orderFeedback.value[orderId] || [];
    const fbStr = fbArr.length > 0 ? `[${fbArr.join(', ')}] ` : '';
    const fullText = fbStr + (orderFeedbackText.value[orderId] || '');
    const res = await fetch(`${API_URL}/api/orders/${orderId}/feedback`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: orderRating.value[orderId], feedback: fullText })
    });
    if (res.ok) {
      feedbackSubmitted.value[orderId] = true;
    }
  } catch (e) {
    console.error(e);
  }
};

  const toggleFeedback = (orderId: string, id: string) => {
  if (!orderFeedback.value[orderId]) orderFeedback.value[orderId] = [];
  if (orderFeedback.value[orderId].includes(id)) {
    orderFeedback.value[orderId] = orderFeedback.value[orderId].filter((x: string) => x !== id);
  } else {
    orderFeedback.value[orderId].push(id);
  }
};

const savedForm = JSON.parse(localStorage.getItem('customer_form') || '{}');
const customerForm = ref({
  name: savedForm.name || '',
  phone: savedForm.phone || '',
  orderType: savedForm.orderType || 'dine_in',
  tableNumber: savedForm.tableNumber || '',
  address: savedForm.address || '',
  comment: '', // don't save previous comment
  scheduledTime: getCurrentTimeStr(),
  scheduledDate: getTodayDateStr()
});

watch(customerForm, (newVal) => {
  localStorage.setItem('customer_form', JSON.stringify({
    name: newVal.name,
    phone: newVal.phone,
    orderType: newVal.orderType,
    tableNumber: newVal.tableNumber,
    address: newVal.address
  }));
}, { deep: true });

const t = (key: string) => {
  return translations[currentLang.value]?.[key] || translations['ru'][key] || key;
};

const savedCache = localStorage.getItem('translationCache_client');
  const translationCache = reactive<Record<string, Record<string, string>>>(
    savedCache ? JSON.parse(savedCache) : {
      'en': {},
      'de': {},
      'ab': {},
      'ru': {}
    }
  );

const translateQueue = new Set<string>();

let pendingTranslations: {text: string, lang: string, targetCode: string}[] = [];
let batchTimeout: ReturnType<typeof setTimeout> | null = null;

const processBatch = async () => {
  batchTimeout = null;
  const batch = [...pendingTranslations];
  pendingTranslations = [];
  
  if (batch.length === 0) return;
  
  const byLang: Record<string, { items: string[], langStr: string }> = {};
  for (const item of batch) {
    if (!byLang[item.targetCode]) byLang[item.targetCode] = { items: [], langStr: item.lang };
    byLang[item.targetCode].items.push(item.text);
  }
  
  for (const [targetCode, group] of Object.entries(byLang)) {
    try {
      const res = await fetch(`${API_URL}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: group.items, targetLang: targetCode })
      });
      const data = await res.json();
      if (data.success && data.translations) {
        if (!translationCache[group.langStr]) translationCache[group.langStr] = {};
        for (let i = 0; i < group.items.length; i++) {
          translationCache[group.langStr][group.items[i]] = data.translations[i];
        }
        localStorage.setItem('translationCache_client', JSON.stringify(translationCache));
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      for (const t of group.items) {
        translateQueue.delete(`${group.langStr}:${t}`);
      }
    }
  }
};

const performTranslation = async (text: string, targetLangCode: string) => {
  if (!text || targetLangCode === 'ru' || targetLangCode === 'Русский') return;
  if (translationCache[targetLangCode]?.[text]) return;
  
  const cacheKey = `${targetLangCode}:${text}`;
  if (translateQueue.has(cacheKey)) return;
  translateQueue.add(cacheKey);

  const langCodeMap: Record<string, string> = {
    'English': 'en',
    'Deutsch': 'de',
    'Аҧсшәа': 'ab',
    'Русский': 'ru'
  };
  const targetCode = langCodeMap[targetLangCode] || targetLangCode;
  if (targetCode === 'ru') {
    translateQueue.delete(cacheKey);
    return;
  }

  pendingTranslations.push({ text, lang: targetLangCode, targetCode });
  
  if (!batchTimeout) {
    batchTimeout = setTimeout(processBatch, 200);
  }
};

const getLocalizedValue = (field: any) => {
  if (!field) return '';
  let text = '';
  
  if (typeof field === 'object' && field !== null) {
    text = field['ru'] || Object.values(field)[0] || '';
    if (field[currentLang.value]) return field[currentLang.value];
  } else {
    text = String(field);
  }
  
  const lang = currentLang.value;
  if (lang === 'ru' || lang === 'Русский') return text;
  if (translationCache[lang]?.[text]) return translationCache[lang][text];
  
  performTranslation(text, lang);
  return text;
};

const tDyn = (ruText: string) => {
  if (!ruText) return '';
  const lang = currentLang.value;
  if (lang === 'ru' || lang === 'Русский') return ruText;
  if (translationCache[lang]?.[ruText]) return translationCache[lang][ruText];
  
  performTranslation(ruText, lang);
  return ruText;
};

const getItemName = (item: any) => getLocalizedValue(item?.name);
const getItemDescription = (item: any) => getLocalizedValue(item?.description);
const getLocalizedCategoryName = (cat: any) => getLocalizedValue(cat?.name);

const urlParams = new URLSearchParams(window.location.search);
const isPreviewMode = urlParams.get('preview') === 'true';
const urlRestId = urlParams.get('id'); // Извлекаем ID ресторана из адресной строки

const loadPreviewFromStorage = () => {
  try {
    const savedRestaurantInfo = localStorage.getItem('preview_restaurantInfo');
    const savedItems = localStorage.getItem('preview_items');
    const savedCategories = localStorage.getItem('preview_categories');
    const savedGeneralSettings = localStorage.getItem('preview_generalSettings');

    if (savedRestaurantInfo) store.restaurantInfo = JSON.parse(savedRestaurantInfo);
    if (savedItems) store.updateItems(JSON.parse(savedItems));
    if (savedCategories) store.updateCategories(JSON.parse(savedCategories));
    if (savedGeneralSettings) store.generalSettings = { ...store.generalSettings, ...JSON.parse(savedGeneralSettings) };
  } catch (error) {
    console.error('Ошибка чтения данных предпросмотра из localStorage:', error);
  }
};

const loadClientMenu = async () => {
  if (isPreviewMode) {
    loadPreviewFromStorage();
    return;
  }
  try {
    // Формируем умную ссылку: если есть ID в адресной строке телефона, просим именно это меню
    const fetchUrl = urlRestId 
      ? `${API_URL}/api/menu?restaurantId=${urlRestId}` 
      : `${API_URL}/api/menu`;

    const response = await fetch(fetchUrl);
    if (response.ok) {
      const data = await response.json();
      store.restaurantInfo = data.restaurantInfo || {};
      store.updateCategories(data.categories || []);
      store.updateItems(data.items || []);
      if (data.generalSettings) {
        store.generalSettings = { ...store.generalSettings, ...data.generalSettings };
      }
    }
  } catch (error) {
    console.error('Ошибка загрузки актуального меню для клиента:', error);
  }
};

const handleStorageEvent = (event: StorageEvent) => {
  if (
    event.key === 'preview_restaurantInfo' || 
    event.key === 'preview_items' || 
    event.key === 'preview_categories' || 
    event.key === 'preview_generalSettings' ||
    event.key === 'generalSettings'
  ) {
    if (isPreviewMode) {
      loadPreviewFromStorage();
    } else {
      loadClientMenu();
    }
  }
};


// --- WAITER CALL LOGIC ---
const showCallWaiterModal = ref(false);
const currentCallTable = ref('');
const currentCallRestaurantId = ref('');

// Retrieve lock timestamp from localStorage
const storedLock = localStorage.getItem('waiter_lock_until');
const waiterLockUntil = ref(storedLock ? parseInt(storedLock, 10) : 0);

const isWaiterLocked = computed(() => {
  return waiterLockUntil.value > Date.now();
});

const openCallWaiterModal = (order: any) => {
  if (isWaiterLocked.value) return;
  currentCallTable.value = order.tableNumber || customerForm.value.tableNumber;
  currentCallRestaurantId.value = order.restaurantId || (restaurantInfo.value as any).id;
  if (!currentCallTable.value) {
    alert(tDyn('Неизвестен номер стола.'));
    return;
  }
  showCallWaiterModal.value = true;
};

const submitWaiterCall = async (callType: string) => {
  if (isWaiterLocked.value) return;
  
  try {
    const res = await fetch(`${API_URL}/api/call-waiter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurantId: currentCallRestaurantId.value,
        tableNumber: currentCallTable.value,
        callType
      })
    });
    
    if (res.ok) {
      const lockTime = Date.now() + 180000; // 3 minutes
      waiterLockUntil.value = lockTime;
      localStorage.setItem('waiter_lock_until', lockTime.toString());
      showCallWaiterModal.value = false;
    } else {
      const data = await res.json();
      alert(data.error || tDyn('Произошла ошибка'));
    }
  } catch (err) {
    console.error(err);
    alert(tDyn('Ошибка сети'));
  }
};
// ------------------------

  onMounted(() => {
  loadClientMenu();
  window.addEventListener('storage', handleStorageEvent);
  
  try {
  const savedOrders = JSON.parse(localStorage.getItem('active_orders') || '[]');
  if (savedOrders && savedOrders.length > 0) {
    activeOrderIds.value = savedOrders;
    startOrderPolling();
  } else {
    // Migrate old single order
    const oldSaved = localStorage.getItem('active_order_id');
    if (oldSaved) {
      activeOrderIds.value = [oldSaved];
      localStorage.setItem('active_orders', JSON.stringify([oldSaved]));
      localStorage.removeItem('active_order_id');
      startOrderPolling();
    }
  }
} catch (e) { console.error(e); }
});

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageEvent);
  if (orderPollInterval) clearInterval(orderPollInterval);
});

const isOrdersListExpanded = ref(false);
const activeOrderIds = ref<string[]>([]);
const activeOrders = ref<any[]>([]);
const isOrderExpanded = ref<Record<string, boolean>>({});
const orderRating = ref<Record<string, number>>({});
const orderFeedback = ref<Record<string, string[]>>({});
const orderFeedbackText = ref<Record<string, string>>({});
const feedbackSubmitted = ref<Record<string, boolean>>({});
let orderPollInterval: any = null;

const startOrderPolling = () => {
  if (orderPollInterval) clearInterval(orderPollInterval);
  pollOrderStatus();
  orderPollInterval = setInterval(pollOrderStatus, 5000);
};

const pollOrderStatus = async () => {
  if (activeOrderIds.value.length === 0) return;
  try {
    const updated = [];
    for (const id of activeOrderIds.value) {
      const res = await fetch(`${API_URL}/api/orders/${id}`);
      if (res.ok) {
        updated.push(await res.json());
      }
    }
    updated.forEach(newO => {
      const existingIdx = activeOrders.value.findIndex(o => o.id === newO.id);
      if (existingIdx !== -1) {
        activeOrders.value[existingIdx] = newO;
      } else {
        activeOrders.value.push(newO);
      }
    });
  } catch (err) {
    console.error('Error polling:', err);
  }
};

const clearActiveOrder = (id: string) => {
  activeOrderIds.value = activeOrderIds.value.filter(x => x !== id);
  activeOrders.value = activeOrders.value.filter(x => x.id !== id);
  localStorage.setItem('active_orders', JSON.stringify(activeOrderIds.value));
  if (activeOrderIds.value.length === 0 && orderPollInterval) {
    clearInterval(orderPollInterval);
  }
};

const getOrderStatusText = (status: string) => {
  switch (status) {
    case 'new': return tDyn('Новый, ждем...');
    case 'progress': return tDyn('Готовится на кухне');
    case 'done': return tDyn('Готов (Подан / Ожидает выдачи)');
    case 'archived': return tDyn('Закрыт');
    case 'cancelled': return tDyn('Отменен');
    default: return tDyn('Обновление...');
  }
};


const filteredItems = computed(() => {
  let result = items.value;

  if (selectedCategory.value !== 'all') {
    result = result.filter((item: any) => (item.category === selectedCategory.value || item.categoryId === selectedCategory.value));
  }

  if (searchQuery.value.trim() !== '') {
    const q = searchQuery.value.toLowerCase();
    result = result.filter((item: any) => {
      const name = getItemName(item).toLowerCase();
      const desc = getItemDescription(item).toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }

  if (selectedFilters.value.length > 0) {
    result = result.filter((item: any) => {
      return selectedFilters.value.some(f => {
        if (f === 'nutFree') return item.noNuts || item.nutFree || item.isNutFree || item.nut_free || (Array.isArray(item.tags) && item.tags.includes('nutFree'));
        if (f === 'lactoseFree') return item.noLactose || item.lactoseFree || item.isLactoseFree || item.lactose_free || (Array.isArray(item.tags) && item.tags.includes('lactoseFree'));
        if (f === 'glutenFree') return item.noGluten || item.glutenFree || item.isGlutenFree || item.gluten_free || (Array.isArray(item.tags) && item.tags.includes('glutenFree'));
        if (f === 'vegetarian') return item.vegetarian || item.isVegetarian || (Array.isArray(item.tags) && item.tags.includes('vegetarian'));
        if (f === 'vegan') return item.vegan || item.isVegan || (Array.isArray(item.tags) && item.tags.includes('vegan'));
        return false;
      });
    });
  }

  return result;
});

const toggleFilter = (filterKey: string) => {
  const index = selectedFilters.value.indexOf(filterKey);
  if (index > -1) {
    selectedFilters.value.splice(index, 1);
  } else {
    selectedFilters.value.push(filterKey);
  }
};

const getItemQuantity = (id: string | number) => {
  const item = cartItems.value.find(i => i.id === id);
  return item ? item.quantity : 0;
};

const addToCart = (item: any) => {
  const existing = cartItems.value.find(i => i.id === item.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cartItems.value.push({ ...item, quantity: 1 });
  }
};

const increaseQuantity = (id: string | number) => {
  const item = cartItems.value.find(i => i.id === id);
  if (item) item.quantity += 1;
};

const decreaseQuantity = (id: string | number) => {
  const index = cartItems.value.findIndex(i => i.id === id);
  if (index !== -1) {
    if (cartItems.value[index].quantity > 1) {
      cartItems.value[index].quantity -= 1;
    } else {
      cartItems.value.splice(index, 1);
    }
  }
};

const totalQuantity = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.quantity, 0);
});

const totalPrice = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

const startCheckout = () => {
  if (cartItems.value.length === 0) return;
  activeModal.value = 'none';
  checkoutStep.value = 1;
  showCheckoutModal.value = true;
};

const goToReviewStep = () => {
  checkoutStep.value = 2;
};

const closeModal = () => {
  showCheckoutModal.value = false;
  checkoutStep.value = 1;
};

const getRussianName = (field: any) => {
  if (!field) return '';
  if (typeof field === 'object' && field !== null) {
    return field['ru'] || Object.values(field)[0] || '';
  }
  return String(field);
};

const confirmOrder = async () => {
  const preparedItems = cartItems.value.map(item => {
    let itemName = getRussianName(item.name);
    if (item.selectedModifiers && item.selectedModifiers.length > 0) {
      const mods = item.selectedModifiers.map((m) => m.name).join(', ');
      itemName += ` (${mods})`;
    }
    return {
      id: String(item.id).split('_')[0],
      name: itemName,
      price: Number(item.price || 0),
      quantity: item.quantity
    };
  });

  const newOrderData = {
    restaurantId: (restaurantInfo.value as any).id || (restaurantInfo.value as any).restaurantId,
    items: preparedItems,
    total: totalPrice.value,
    type: customerForm.value.orderType === 'dine_in' 
      ? 'onsite' 
      : (customerForm.value.orderType === 'takeaway' ? 'pickup' : 'delivery'),
    customerName: customerForm.value.name,
    customerPhone: customerForm.value.phone,
    tableNumber: customerForm.value.tableNumber,
    address: customerForm.value.address,
    comment: customerForm.value.comment,
    scheduledTime: customerForm.value.scheduledTime
  };

  try {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrderData),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    
    // Сохраняем активный заказ
    if (!activeOrderIds.value.includes(result.orderId)) {
      activeOrderIds.value.push(result.orderId);
      isOrdersListExpanded.value = true;
      activeOrders.value.push(result.order);
      localStorage.setItem('active_orders', JSON.stringify(activeOrderIds.value));
    }
    startOrderPolling();

    cartItems.value = [];
    closeModal();
    customerForm.value = { 
        ...customerForm.value,
        comment: '',
        scheduledTime: getCurrentTimeStr(),
        scheduledDate: getTodayDateStr()
      };

  } catch (error) {
    console.error('Ошибка при отправке заказа:', error);
    alert('Не удалось отправить заказ. Проверьте соединение с сервером.');
  }
};

const selectLanguage = (lang: string) => {
  currentLang.value = lang;
  activeModal.value = 'none';
};

const toggleViewMode = () => {
    if (viewMode.value === 'list') viewMode.value = 'grid';
    else if (viewMode.value === 'grid') viewMode.value = 'full';
    else viewMode.value = 'list';
  };

const goToConstructor = () => {
  router.push('/constructor');
};
</script>

<style scoped>
.wifi-card-widget { margin: 12px 16px 16px 16px; padding: 12px 14px; border-radius: 12px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 6px rgba(0,0,0,0.04); }
.wifi-card-widget:hover { opacity: 0.95; }
.wifi-card-main-row { display: flex; align-items: center; justify-content: space-between; }
.wifi-card-left { display: flex; align-items: center; gap: 10px; }
.wifi-card-icon-box { font-size: 18px; display: flex; align-items: center; justify-content: center; }
.wifi-card-title { font-size: 12px; opacity: 0.7; line-height: 1.1; }
.wifi-card-subtitle { font-size: 15px; font-weight: 600; line-height: 1.2; }
.wifi-card-chevron { font-size: 20px; transition: transform 0.2s ease; opacity: 0.6; }
.wifi-expanded-content { margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.1); font-size: 13px; }
.wifi-info-row { display: flex; justify-content: space-between; }
.client-wrapper { width: 100vw; height: 100vh; height: 100dvh; display: flex; justify-content: center; align-items: center; overflow: hidden; box-sizing: border-box; position: relative; }
.close-preview-btn { position: absolute; top: 20px; right: 20px; background: rgba(0, 0, 0, 0.7); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.2); padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; z-index: 1000; transition: background 0.2s ease, transform 0.1s ease; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); }
.close-preview-btn:hover { background: rgba(0, 0, 0, 0.9); }
.close-preview-btn:active { transform: scale(0.95); }
@media (max-width: 600px) { .close-preview-btn { display: none; } }
.phone-mockup { width: 330px; max-width: 100vw; height: 90vh; max-height: 750px; background: #000; border: 10px solid #2a2a2a; border-radius: 36px; overflow: hidden; position: relative; display: flex; flex-direction: column; box-shadow: 0 15px 40px rgba(0,0,0,0.35); box-sizing: border-box; }
@media (max-width: 600px) { .phone-mockup { width: 100vw; height: 100vh; height: 100dvh; max-height: none; border: none; border-radius: 0; box-shadow: none; } }
.phone-screen { display: flex; flex-direction: column; height: 100%; position: relative; overflow: hidden; }
.phone-header { height: 110px; flex-shrink: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative; color: white; text-align: center; margin: 0 -10px 10px -10px; }
.phone-body { flex: 1; padding: 0 10px 95px 10px; overflow-y: auto; }
.phone-avatar-wrapper { width: 45px; height: 45px; border-radius: 50%; border: 2px solid #fff; background: #333; overflow: hidden; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; }
.phone-logo { font-weight: bold; font-size: 13px; text-shadow: 0 0 4px rgba(0,0,0,0.5); }
.phone-categories { display: flex; gap: 6px; margin-bottom: 10px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
.phone-categories::-webkit-scrollbar { display: none; }
.phone-cat-badge { padding: 5px 10px; border-radius: 14px; font-size: 10px; font-weight: 600; white-space: nowrap; border: none; cursor: pointer; transition: all 0.2s ease; color: #111; background: rgba(255, 255, 255, 0.8); }
.phone-cat-badge.active { color: #ffffff; }
.menu-items-grid-phone { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
.menu-card { background: #ffffff; color: #111111; border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; border: none; padding: 6px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }
.menu-card img { width: 100%; height: 90px; object-fit: cover; border-radius: 10px; }
.card-content { display: flex; flex-direction: column; justify-content: space-between; flex: 1; padding: 4px 2px; }
.card-text-block h3 { margin: 4px 0 2px 0; font-size: 11px; font-weight: bold; color: #111111; line-height: 1.2; }
.card-text-block p { font-size: 9px; color: #666; margin: 0 0 6px 0; }
.card-bottom-row { display: flex; flex-direction: column; gap: 6px; width: 100%; margin-top: auto; }
.price { font-weight: bold; font-size: 11px; white-space: nowrap; }
.add-to-cart-btn { color: white; border: none; border-radius: 8px; padding: 8px 0; font-size: 11px; font-weight: bold; cursor: pointer; width: 100%; text-align: center; transition: opacity 0.2s; box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
.add-to-cart-btn:active { opacity: 0.8; }
.counter-controls { display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1.5px solid; border-radius: 8px; padding: 6px 12px; width: 100%; box-sizing: border-box; }
.counter-btn { background: transparent; border: none; font-size: 13px; font-weight: bold; cursor: pointer; color: #111; padding: 0 4px; }
.counter-value { font-size: 12px; font-weight: bold; color: #111; }
.menu-items-list-phone { display: flex; flex-direction: column; gap: 6px; }
.menu-list-row { background: #ffffff; color: #111111; border: none; border-radius: 12px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }
.menu-list-row .card-content { flex-direction: row; justify-content: space-between; align-items: center; width: 100%; padding: 0; }
.menu-list-row .card-text-block { flex: 1; padding-right: 12px; }
.menu-list-row .card-bottom-row { flex-direction: column; align-items: flex-end; width: 115px; gap: 4px; }
.menu-list-row .price { font-size: 12px; margin-bottom: 2px; white-space: nowrap; }
.menu-list-row .add-to-cart-btn { padding: 6px 0; font-size: 10px; }
.menu-list-row .counter-controls { padding: 4px 8px; }
.floating-cart-bar { position: absolute; bottom: calc(12px + 45px + 4px); left: 12px; right: 12px; color: white; border-radius: 24px; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-weight: bold; cursor: pointer; z-index: 20; box-shadow: 0 4px 15px rgba(0,0,0,0.4); box-sizing: border-box; }
.floating-order-bar {
  background: #ffffff;
  border-radius: 16px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 20;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  box-sizing: border-box;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(0,0,0,0.05);
}
.order-bar-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.order-bar-icon-wrapper.status-new { background: #9D0D0E; }
.order-bar-icon-wrapper.status-progress { background: linear-gradient(135deg, #fbbf24, #f59e0b); }
.order-bar-icon-wrapper.status-done { background: linear-gradient(135deg, #34d399, #10b981); }
.order-bar-icon-wrapper.status-archived { background: linear-gradient(135deg, #9ca3af, #6b7280); }
.order-bar-icon-wrapper.status-cancelled { background: linear-gradient(135deg, #f87171, #ef4444); }

.order-bar-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.order-bar-text strong { font-size: 14px; color: #111; }
.order-bar-text span { font-size: 11px; color: #6b7280; font-weight: 600; line-height: 1.2; }

.order-bar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.order-bar-chevron {
  color: #9ca3af;
  transition: transform 0.3s ease;
}
.order-bar-chevron.expanded {
  transform: rotate(180deg);
}
.close-order-btn {
  background: #f1f5f9;
  color: #64748b;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  padding: 0;
}
.close-order-btn:hover { background: #e2e8f0; color: #334155; }

.empty-search-notice { text-align: center; font-size: 10px; margin-top: 25px; color: #888; }
.checkout-modal-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); z-index: 100; display: flex; align-items: flex-end; }
.checkout-modal { background: #f4f5f7; color: #111; width: 100%; max-height: 92%; border-top-left-radius: 20px; border-top-right-radius: 20px; padding: 16px; box-sizing: border-box; overflow-y: auto; animation: slideUp 0.3s ease-out; }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.checkout-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.checkout-header h3 { margin: 0; font-size: 14px; font-weight: bold; }
.close-modal-btn, .back-btn { background: none; border: none; font-size: 16px; cursor: pointer; color: #666; padding: 0; }
.checkout-form { display: flex; flex-direction: column; gap: 10px; }
.form-group { display: flex; flex-direction: column; gap: 4px; text-align: left; }
.form-group label { font-size: 10px; font-weight: 600; color: #555; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px 10px; border-radius: 8px; border: 1px solid #ddd; font-size: 11px; outline: none; box-sizing: border-box; background: #fff; }
.form-group textarea { resize: none; height: 45px; }
.time-picker-block { background: #ffffff; border-radius: 10px; padding: 10px; display: flex; flex-direction: column; gap: 6px; border: 1px solid #eee; }
.block-title { font-size: 11px; font-weight: bold; color: #333; }
.time-inputs-row { display: flex; gap: 8px; }
.time-input, .date-input { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 8px; font-size: 11px; background: #fff; outline: none; }
.hint-text { font-size: 9px; color: #777; }
.checkout-summary { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; padding-top: 8px; border-top: 1px dashed #ddd; font-size: 12px; }
.submit-order-btn { color: #fff; border: none; border-radius: 10px; padding: 10px; font-size: 12px; font-weight: bold; cursor: pointer; margin-top: 4px; }
.review-screen-content { display: flex; flex-direction: column; gap: 10px; }
.review-card-block { background: #ffffff; border-radius: 12px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); text-align: left; }
.review-card-title { font-size: 12px; font-weight: bold; color: #111; margin-bottom: 8px; }
.review-items-list { display: flex; flex-direction: column; gap: 8px; }
.review-item-row { display: flex; justify-content: space-between; font-size: 11px; color: #333; gap: 10px; }
.r-name { flex: 1; line-height: 1.3; }
.r-price { white-space: nowrap; font-weight: 500; }
.review-totals-divider { height: 1px; background: #eee; margin: 8px 0; }
.review-total-line { display: flex; justify-content: space-between; font-size: 11px; color: #666; margin-bottom: 4px; }
.review-total-line.main-total { font-size: 13px; font-weight: bold; color: #111; margin-top: 6px; margin-bottom: 0; }
.data-row { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; font-size: 11px; }
.data-row:last-child { margin-bottom: 0; }
.data-row .icon { font-size: 13px; margin-top: 1px; }
.label-muted { font-size: 9px; color: #888; }
.val { font-weight: 500; color: #222; }
.time-badge-box { background: #f1f3f5; padding: 8px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; color: #333; }
.map-container { margin-bottom: 8px; overflow: hidden; border-radius: 8px; }
.yandex-map-btn { display: block; text-align: center; background: #fc3f1d; color: #fff; padding: 8px; border-radius: 8px; font-size: 11px; font-weight: bold; text-decoration: none; }
.legal-notice { font-size: 9px; color: #888; text-align: center; line-height: 1.2; padding: 0 10px; }
.review-actions-row { display: flex; gap: 8px; margin-top: 4px; }
.btn-secondary-action { flex: 1; background: #e2e8f0; color: #333; border: none; border-radius: 10px; padding: 10px; font-size: 12px; font-weight: bold; cursor: pointer; }
.btn-primary-action { flex: 2; color: #fff; border: none; border-radius: 10px; padding: 10px; font-size: 12px; font-weight: bold; cursor: pointer; }
.feedback-widget {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px 10px;
  text-align: center;
  margin-top: 8px;
  margin-bottom: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.feedback-title {
  font-size: 13px;
  font-weight: 600;
  color: #111;
  margin-bottom: 12px;
}
.stars-container {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 4px;
}
.star-icon {
  width: 32px;
  height: 32px;
  color: #e2e8f0;
  fill: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
}
.star-icon.filled {
  color: #facc15;
  fill: #facc15;
}
.feedback-details-section {
  margin-top: 16px;
  animation: fadeIn 0.3s ease;
}
.feedback-subtitle {
  font-size: 12px;
  color: #555;
  margin-bottom: 12px;
  font-weight: 500;
}
.feedback-options-scroll {
  display: flex;
  overflow-x: auto;
  gap: 10px;
  padding-bottom: 8px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.feedback-options-scroll::-webkit-scrollbar {
  display: none;
}
.feedback-option-card {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 90px;
  height: 75px;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  gap: 8px;
}
.feedback-option-card.selected {
  border-color: #9D0D0E;
  background: #eff6ff;
  color: #1d4ed8;
}
.feedback-option-card.selected .feedback-opt-icon {
  color: #1d4ed8;
}
.feedback-opt-icon {
  width: 24px;
  height: 24px;
  color: #475569;
}
.feedback-opt-label {
  font-size: 10px;
  font-weight: 600;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
.yandex-review-prompt {
  margin-top: 16px;
  animation: fadeIn 0.3s ease;
}
.yandex-review-btn {
  display: inline-block;
  background: #fc3f1d;
  color: #fff;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  text-decoration: none;
  width: 100%;
  box-sizing: border-box;
  text-align: center;
}
.menu-items-full-phone { display: flex; flex-direction: column; gap: 12px; padding: 0 16px 100px; }
.menu-card-full {
  background: #ffffff;
  color: #111111;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
}
.menu-card-full img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 12px;
}
.menu-card-full .card-content {
  padding: 12px 4px 4px;
}
.menu-card-full .card-text-block h3 {
  font-size: 15px;
  margin: 0 0 6px 0;
  font-weight: bold;
}
.menu-card-full .card-text-block p {
  font-size: 12px;
  color: #555;
  margin: 0 0 16px 0;
  line-height: 1.4;
}
.menu-card-full .card-bottom-row {
  display: flex;
  flex-direction: row !important;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.menu-card-full .add-to-cart-btn {
  width: auto;
  padding: 8px 20px;
  font-size: 12px;
}
.menu-card-full .counter-controls {
  width: auto;
  min-width: 90px;
}
.order-receipt-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  color: #111;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  animation: fadeIn 0.2s ease;
}
.receipt-header {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px dashed #ccc;
  padding-bottom: 8px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #555;
}
.receipt-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}
.receipt-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}
.receipt-item .r-name {
  flex: 1;
  padding-right: 10px;
}
.receipt-item .r-price {
  font-weight: 600;
  white-space: nowrap;
}
.receipt-total {
  display: flex;
  justify-content: space-between;
  border-top: 1px dashed #ccc;
  padding-top: 12px;
  font-size: 14px;
  font-weight: bold;
}

.feedback-textarea {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px;
  font-size: 12px;
  min-height: 60px;
  margin-top: 10px;
  margin-bottom: 10px;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
}
.feedback-submit-btn {
  width: 100%;
  background: #111;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 10px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 10px;
}
.feedback-success-msg {
  color: #10b981;
  font-weight: bold;
  font-size: 14px;
  margin-top: 12px;
}

.waiter-option-btn {
  padding: 16px;
  background: #f4f5f7;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  color: #111;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
}
.waiter-option-btn:hover { background: #e2e8f0; }
</style>

