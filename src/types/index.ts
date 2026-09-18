// Database row types — mirror the SQL schema in /supabase/schema.sql.
// These are intentionally loose (string ids, optional fields) so the app
// tolerates schema drift during development.

export type VendorType = 'owner' | 'employee';
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'handover'
  | 'delivered'
  | 'canceled'
  | 'failed'
  | 'returned'
  | 'scheduled';

export type OrderType = 'delivery' | 'take_away' | 'dine_in';
export type PaymentMethod = 'cash_on_delivery' | 'digital' | 'wallet' | 'offline';
export type PaymentStatus = 'paid' | 'unpaid' | 'partial' | 'refunded';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  vendor_type: VendorType;
  store_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Store {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  contact_phone: string | null;
  contact_email: string | null;
  vat_percent: number;
  min_order_amount: number;
  is_active: boolean;
  is_open: boolean;
  opening_time: string | null;
  closing_time: string | null;
  rating: number;
  total_ratings: number;
  module: string; // 'store' | 'rental' | 'restaurant'
  created_at: string;
}

export interface Category {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  priority: number;
  created_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  discount_price: number | null;
  unit: string | null;
  stock: number;
  is_available: boolean;
  is_veg: boolean;
  rating: number;
  total_ratings: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image_url: string | null;
  quantity: number;
  price: number;
  addon_details: { name: string; price: number }[] | null;
}

export interface Order {
  id: string;
  store_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string | null;
  order_number: number;
  order_type: OrderType;
  order_status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  total_amount: number;
  delivery_address: string | null;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  note: string | null;
  scheduled_at: string | null;
  delivery_man_id: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  store_id: string;
  code: string;
  title: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_amount: number;
  min_purchase: number;
  max_discount: number | null;
  start_date: string;
  end_date: string;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  created_at: string;
}

export interface Campaign {
  id: string;
  store_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  start_date: string;
  end_date: string;
  is_joined: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Banner {
  id: string;
  store_id: string;
  title: string;
  image_url: string | null;
  url: string | null;
  priority: number;
  is_active: boolean;
  created_at: string;
}

export interface Addon {
  id: string;
  store_id: string;
  name: string;
  price: number;
  is_available: boolean;
  created_at: string;
}

export interface DeliveryMan {
  id: string;
  store_id: string;
  full_name: string;
  email: string;
  phone: string;
  image_url: string | null;
  is_active: boolean;
  total_deliveries: number;
  rating: number;
  created_at: string;
}

export interface Conversation {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_image_url: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'vendor' | 'customer';
  message: string;
  attachment_url: string | null;
  created_at: string;
}

export interface Disbursement {
  id: string;
  store_id: string;
  amount: number;
  method: string;
  status: 'pending' | 'completed' | 'failed';
  reference: string | null;
  note: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  store_id: string;
  title: string;
  body: string;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
}
