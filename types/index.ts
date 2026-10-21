
export type OrderUnit = 'packets' | 'litres';

export interface Product {
  id: string;
  name: string;
  brand: 'Arogya' | 'Hatsun' | 'Hapdaily' | 'Other';
  description: string;
  price: number;
  price_per_litre?: number | null;
  image_url: string;
  category: string;
  unit: string;
  available: boolean;
  stock_quantity?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  product_id: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  unit: string;
  image_url?: string;
  item_total: number;
}

export interface Order {
  id: string;
  order_number?: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  payment_status: 'unverified' | 'paid_verified' | 'cash_on_delivery';
  payment_method: 'upi' | 'cod';
  created_at: string;
}

export interface FlyingItem {
  id: string;
  imageUrl: string;
  startX: number;
  startY: number;
}

export interface DailySummary {
  date: string;
  total_orders: number;
  total_earnings: number;
  items_sold: number;
  product_breakdown: Array<{
    name: string;
    brand: string;
    quantity: number;
    revenue: number;
  }>;
}

export interface PhotoEditState {
  zoom: number;
  rotation: number;
  brightness: number;
  contrast: number;
  saturation: number;
  filter: 'none' | 'vibrant' | 'warm' | 'cool' | 'fresh' | 'bw';
}

export interface Shop {
  id: string;
  name: string;
  owner_name: string;
  phone: string;
  address: string;
  notes?: string;
  total_billed?: number;
  total_paid?: number;
  balance?: number;
  today_delivered?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ShopRate {
  id?: string;
  shop_id: string;
  product_id: string;
  rate: number;
  created_at?: string;
  updated_at?: string;
}

export interface DeliveryItem {
  id?: string;
  delivery_id?: string;
  product_id?: string;
  product_name: string;
  product_unit: string;
  quantity: number;
  rate: number;
  line_total: number;
}

export interface Delivery {
  id: string;
  shop_id: string;
  shop_name?: string;
  delivery_date: string;
  total_amount: number;
  notes?: string;
  items: DeliveryItem[];
  created_at?: string;
  updated_at?: string;
}

export interface Payment {
  id: string;
  shop_id: string;
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'upi' | 'other';
  notes?: string;
  created_at?: string;
}
