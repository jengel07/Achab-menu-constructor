/**
 * Централизованный API-клиент
 * Автоматически добавляет JWT-токен и базовый URL из .env
 */

let BASE_URL = import.meta.env.VITE_API_URL;
if (!BASE_URL || /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(window.location.hostname) || window.location.hostname === 'localhost') {
  BASE_URL = `http://${window.location.hostname}:3000`;
}


// ============================================================
// STAFF MENU API (STOP-LIST)
// ============================================================
export const staffMenuApi = {
  getMenu: () => request<{ categories: any[]; items: any[] }>('/api/staff/menu'),
  updateAvailability: (id: string, isAvailable: boolean) => 
    request<{ success: boolean }>(`/api/staff/dishes/${id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable })
    })
};

// ============================================================
// Хелперы для работы с токеном
// ============================================================

export function getToken(): string | null {
  return localStorage.getItem('authToken');
}

export function setToken(token: string): void {
  localStorage.setItem('authToken', token);
}

export function removeToken(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

/** Возвращает роль текущего пользователя из localStorage */
export function getUserRole(): string | null {
  const saved = localStorage.getItem('currentUser');
  if (!saved) return null;
  try {
    return JSON.parse(saved).role || null;
  } catch {
    return null;
  }
}

/** Проверяет, является ли пользователь персоналом (не администратором) */
export function isStaff(): boolean {
  const role = getUserRole();
  return role === 'cook' || role === 'waiter';
}

// ============================================================
// Базовая функция запроса
// ============================================================

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string> || {}),
  };

  // Only set application/json if we are not sending FormData
  if (!(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (!skipAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401) {
    // Токен истёк или недействителен — очищаем данные и редиректим на логин
    removeToken();
    window.location.href = '/login';
    throw new Error('Сессия истекла. Войдите снова.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// ============================================================
// AUTH API
// ============================================================

export const authApi = {
  register: (data: { email: string; password: string; name?: string }) =>
    request<{ success: boolean; token: string; restaurantId: string; name: string }>(
      '/api/auth/register',
      { method: 'POST', body: JSON.stringify(data), skipAuth: true }
    ),

  login: (data: { email: string; password: string }) =>
    request<{ success: boolean; token: string; restaurantId: string; name: string; role: string }>(
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify(data), skipAuth: true }
    ),

  refresh: () =>
    request<{ success: boolean; token: string }>('/api/auth/refresh', { method: 'POST' }),
};

// ============================================================
// MENU API
// ============================================================

export const menuApi = {
  get: (restaurantId: string) =>
    request<{
      restaurantInfo: Record<string, unknown>;
      categories: unknown[];
      items: unknown[];
      generalSettings: Record<string, unknown>;
    }>(`/api/menu/${restaurantId}`),

  save: (restaurantId: string, data: any) =>
    request<{ success: boolean }>(`/api/menu/${restaurantId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  parseMenu: (files: FileList | File[]) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('menuFiles', files[i]);
    }
    return request<{ categories: any[]; items: any[] }>('/api/parse-menu', {
      method: 'POST',
      body: formData,
    });
  }
};

// ============================================================
// ORDERS API
// ============================================================

export const ordersApi = {
  getAll: () =>
    request<unknown[]>('/api/orders'),

  create: (data: {
    items: unknown[];
    total: number;
    type: string;
    customerName?: string;
    customerPhone?: string;
    tableNumber?: string | number;
    address?: string;
    comment?: string;
    scheduledTime?: string;
  }) =>
    request<{ success: boolean; orderId: string; order: unknown }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: string) =>
    request<{ success: boolean }>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

    updateStatusWithNote: (id: string, status: string, rejectionNote?: string) =>
    request<{ success: boolean }>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rejectionNote }),
    }),
    
  delete: (id: string) =>
    request<{ success: boolean }>(`/api/orders/${id}`, { method: 'DELETE' }),
    
  deleteAll: () =>
    request<{ success: boolean }>('/api/orders/all', { method: 'DELETE' }),
};

// ============================================================
// STAFF API
// ============================================================

export const staffApi = {
  /** Получить всех сотрудников ресторана */
  getAll: () =>
    request<{ success: boolean; staff: Array<{ id: string; name: string; email: string; role: string; status: string }> }>(
      '/api/staff'
    ),

  /** Создать сотрудника с паролем (сохраняется в БД, email отправляется автоматически) */
  create: (data: { name: string; email: string; password: string; role: string }) =>
    request<{ success: boolean; staff: { id: string; name: string; email: string; role: string; status: string } }>(
      '/api/staff',
      { method: 'POST', body: JSON.stringify(data) }
    ),

  /** Удалить сотрудника */
  remove: (id: string) =>
    request<{ success: boolean }>(`/api/staff/${id}`, { method: 'DELETE' }),
};

// ============================================================
// SUPERADMIN API (только для владельца платформы)
// ============================================================

export const superAdminApi = {
  getTariffs: () => request<any[]>('/api/tariffs'),
  updateTariff: (id: string, data: any) => request<any>(`/api/tariffs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  createTariff: (data: any) => request<any>('/api/tariffs', { method: 'POST', body: JSON.stringify(data) }),
  deleteTariff: (id: string) => request<any>(`/api/tariffs/${id}`, { method: 'DELETE' }),
  
  getPaymentRequests: () => request<any[]>('/api/payment-requests'),
  confirmPaymentRequest: (id: string) => request<any>(`/api/payment-requests/${id}/confirm`, { method: 'PUT' }),
  rejectPaymentRequest: (id: string) => request<any>(`/api/payment-requests/${id}/reject`, { method: 'PUT' }),
  updateRestaurantTariff: (id: string, tariffId: string, months: number) => request<any>(`/api/superadmin/restaurants/${id}/tariff`, { method: 'PUT', body: JSON.stringify({ tariffId, months }) }),

  /** Общая статистика платформы */
  getStats: () =>
    request<{ success: boolean; restaurantCount: number; staffCount: number; orderCount: number }>(
      '/api/superadmin/stats'
    ),

  /** Список всех ресторанов */
  getRestaurants: () =>
    request<{
      success: boolean;
      restaurants: Array<{
        id: string;
        email: string;
        name: string | null;
        _count: { staff: number; orders: number };
      }>;
    }>('/api/superadmin/restaurants'),

  /** Удалить ресторан со всеми данными */
  deleteRestaurant: (id: string) => request<{ success: boolean }>(`/api/superadmin/restaurants/${id}`, { method: 'DELETE' }),
  toggleBlockRestaurant: (id: string, block: boolean) => request<{ success: boolean }>(`/api/superadmin/restaurants/${id}/toggle-block`, { method: 'POST', body: JSON.stringify({ block }) }),

  /** Войти в аккаунт другого ресторана */
  loginAs: (restaurantId: string) =>
    request<{ success: boolean; token: string; restaurantId: string; name: string; role: string }>('/api/superadmin/login-as', {
      method: 'POST',
      body: JSON.stringify({ restaurantId }),
    }),

  /** Все сотрудники платформы */
  getAllStaff: () =>
    request<{
      success: boolean;
      staff: Array<{
        id: string;
        name: string;
        email: string;
        role: string;
        status: string;
        restaurant: { id: string; name: string | null };
      }>;
    }>('/api/superadmin/staff'),

  /** Создать сотрудника для любого ресторана (только суперадмин) */
  createStaff: (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    restaurantId: string;
  }) =>
    request<{ success: boolean; staff: { id: string; name: string; email: string; role: string; status: string } }>(
      '/api/superadmin/staff',
      { method: 'POST', body: JSON.stringify(data) }
    ),
};


// ============================================================
// BANNERS API
// ============================================================
export const bannersApi = {
  getAll: (restaurantId: string) => request<{ banners: any[] }>(`/api/banners/${restaurantId}`),
  getActive: (restaurantId: string) => request<{ banners: any[] }>(`/api/banners/active/${restaurantId}`, { skipAuth: true }),
  create: (restaurantId: string, data: { imageUrl: string; targetItemId?: string; order?: number }) => 
    request<{ banner: any }>(`/api/banners/${restaurantId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  update: (id: string, data: { isActive?: boolean; targetItemId?: string; order?: number }) =>
    request<{ banner: any }>(`/api/banners/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
  remove: (id: string) => request<{ success: boolean }>(`/api/banners/${id}`, { method: 'DELETE' })
};
