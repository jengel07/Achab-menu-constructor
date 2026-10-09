export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  priceBottle?: number;
  priceGlass?: number;
  priceGlassLabel?: string;
  priceBottleLabel?: string;
  categoryId: string;
  isAvailable: boolean;
  image?: string;
  nutFree?: boolean;
  glutenFree?: boolean;
  vegetarian?: boolean;
  vegan?: boolean;
  modifiers?: any[];
}

export interface MenuCategory {
  id: string;
  name: string;
}

export interface QrSettings {
  text: string;
  bgColor: string;
  squareColor: string;
  textColor: string;
  textBgColor: string;
  font: string;
  url?: string;
  fontFamily?: string;
}

export interface RestaurantInfo {
  name: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  address?: string;
  phone?: string;
  qrCodeUrl?: string;
  wifiName?: string;
  wifiPassword?: string;
  qrSettings?: QrSettings;
  coverImage?: string;
  avatarImage?: string;
  showCoverGradient?: boolean; 
  isDarkMode?: boolean;
  isWifiEnabled?: boolean;
  filterSettings?: Record<string, boolean>;
  
}

export interface MenuState {
  restaurantInfo: RestaurantInfo;
  categories: MenuCategory[];
  items: MenuItem[];
}

// === Типы для работы с заказами ===

export interface OrderItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
}

export type OrderType = 'onsite' | 'pickup' | 'delivery';
export type OrderStatus = 'open' | 'progress' | 'done' | 'cancelled';

export interface Order {
  id: number | string;
  type: OrderType;
  status: OrderStatus;
  createdAt: number;
  total: number;
  items: OrderItem[];
  note?: string;
  
  // Дополнительные поля клиента
  tableNumber?: string | number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  pickupTimeMin?: number;
  deliveryAddress?: string;
  deliveryTime?: string;
}