// Thin data-access wrappers around Supabase. Each function corresponds to a
// REST-style call the Flutter app made against its PHP/Laravel backend; the
// signatures match what the screens need.
//
// UNIFIED DATABASE — the vendor app now reads/writes the SAME Supabase tables
// as the admin panel + customer app + delivery app. The existing TS types
// (Store, Product, Order, etc.) are preserved for backward-compat with
// screens; mappers below translate between the admin's column names and
// the vendor app's preferred field names.

import { supabase } from '@/lib/supabase';
import type {
  Addon,
  Banner,
  Campaign,
  Category,
  ChatMessage,
  Conversation,
  Coupon,
  DeliveryMan,
  Disbursement,
  Notification,
  Order,
  Product,
  Store,
} from '@/types';

// =====================================================================
// MAPPERS — admin panel column names ↔ vendor app field names
// =====================================================================

function mapStoreRow(row: any): Store {
  return {
    id: String(row.id),
    owner_id: String(row.vendor_id ?? ''),
    name: row.name ?? '',
    description: row.announcement ?? null,
    logo_url: row.logo ?? null,
    cover_url: row.cover_photo ?? null,
    address: row.address ?? '',
    latitude: row.lat ? Number(row.lat) : null,
    longitude: row.lng ? Number(row.lng) : null,
    contact_phone: row.phone ?? '',
    contact_email: row.email ?? '',
    vat_percent: Number(row.tax ?? 0),
    min_order_amount: Number(row.minimum_order ?? 0),
    is_active: Boolean(row.active ?? row.status ?? true),
    is_open: Boolean(row.status ?? true),
    opening_time: null,
    closing_time: null,
    rating: Number(row.rating ?? 0),
    total_ratings: Number(row.rating_count ?? 0),
    module: 'store', // admin uses module_id FK — we keep the enum string
  } as Store;
}

function mapCategoryRow(row: any): Category {
  // Admin's `store_categories` table — store-scoped, has name + priority + status
  return {
    id: String(row.id),
    store_id: String(row.store_id ?? ''),
    name: row.name ?? '',
    description: null,
    image_url: null,
    is_active: Boolean(row.status ?? true),
    priority: Number(row.priority ?? 0),
  } as Category;
}

function mapProductRow(row: any): Product {
  // Admin's `items` table
  const imagesArr: string[] = Array.isArray(row.images)
    ? row.images
    : Array.isArray(row.images_url_full_path)
      ? row.images_url_full_path
      : row.image
        ? [row.image]
        : [];
  return {
    id: String(row.id),
    store_id: String(row.store_id ?? ''),
    category_id: String(row.category_id ?? row.store_category_id ?? ''),
    name: row.name ?? '',
    description: row.description ?? null,
    image_url: row.image ?? (imagesArr[0] ?? null),
    price: Number(row.price ?? 0),
    discount_price: row.discount_type === 'amount'
      ? Number(row.discount ?? 0)
      : null, // percent discount not supported in old type
    unit: null,
    stock: Number(row.stock ?? 0),
    is_available: Boolean(row.status ?? true),
    is_veg: Boolean(row.veg ?? false),
    rating: Number(row.avg_rating ?? 0),
    total_ratings: Number(row.rating_count ?? 0),
  } as Product;
}

function mapOrderRow(row: any): Order {
  const details = row.items || row.order_details || [];
  return {
    id: String(row.id),
    store_id: String(row.store_id ?? ''),
    customer_id: String(row.user_id ?? ''),
    customer_name: '',
    customer_phone: '',
    order_number: Number(row.id) || 0,
    order_type: row.order_type ?? 'delivery',
    order_status: row.order_status ?? 'pending',
    payment_method: row.payment_method === 'cash_on_delivery' ? 'cod' : (row.payment_method ?? 'cod'),
    payment_status: row.payment_status ?? 'unpaid',
    total_amount: Number(row.order_amount ?? 0),
    delivery_address: row.delivery_address ?? '',
    delivery_latitude: null,
    delivery_longitude: null,
    note: null,
    scheduled_at: row.schedule_at ?? null,
    delivery_man_id: row.delivery_man_id ? String(row.delivery_man_id) : null,
    items: details.map((d: any) => ({
      id: String(d.id),
      order_id: String(d.order_id),
      product_id: String(d.item_id ?? ''),
      product_name: d.item_details?.name ?? '',
      product_image_url: d.item_details?.image_url ?? null,
      quantity: Number(d.quantity ?? 1),
      price: Number(d.price ?? 0),
      addon_details: [],
    })),
    created_at: row.created_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? row.created_at ?? new Date().toISOString(),
  } as Order;
}

function mapCouponRow(row: any): Coupon {
  return {
    id: String(row.id),
    store_id: String(row.store_id ?? ''),
    code: row.code ?? '',
    title: row.title ?? '',
    description: '',
    discount_type: row.discount_type ?? 'amount',
    discount_amount: Number(row.discount ?? 0),
    min_purchase: Number(row.min_purchase ?? 0),
    max_discount: Number(row.max_discount ?? 0),
    start_date: row.start_date ?? null,
    end_date: row.expire_date ?? null,
    usage_limit: Number(row.limit ?? 0),
    used_count: Number(row.total_uses ?? 0),
    is_active: Boolean(row.status ?? true),
  } as Coupon;
}

function mapBannerRow(row: any): Banner {
  return {
    id: String(row.id),
    store_id: String(row.store_id ?? ''), // admin banners are global; we treat store_id=0 for all
    title: row.title ?? '',
    image_url: row.image ?? '',
    url: row.redirect_link ?? row.default_link ?? null,
    priority: Number(row.featured ?? 0),
    is_active: Boolean(row.status ?? true),
  } as Banner;
}

function mapAddonRow(row: any): Addon {
  return {
    id: String(row.id),
    store_id: '', // admin's add_ons table is global; not store-scoped
    name: row.name ?? '',
    price: Number(row.price ?? 0),
    is_available: Boolean(row.status ?? true),
  } as Addon;
}

function mapDeliveryManRow(row: any): DeliveryMan {
  return {
    id: String(row.id),
    store_id: String(row.store_id ?? ''),
    full_name: `${row.f_name ?? ''} ${row.l_name ?? ''}`.trim(),
    email: row.email ?? '',
    phone: row.phone ?? '',
    image_url: row.image ?? null,
    is_active: Boolean(row.active ?? row.status ?? true),
    total_deliveries: Number(row.order_count ?? 0),
    rating: Number(row.earning ?? 0), // admin has no rating column on delivery_men; reuse earning
  } as DeliveryMan;
}

function mapDisbursementRow(row: any): Disbursement {
  return {
    id: String(row.id),
    store_id: String(row.store_id ?? ''),
    amount: Number(row.amount ?? 0),
    method: 'bank_transfer', // admin doesn't track method on disbursements
    status: row.status ?? 'pending',
    reference: null,
    note: null,
  } as Disbursement;
}

function mapConversationRow(row: any): Conversation {
  return {
    id: String(row.id),
    store_id: '', // admin conversations are keyed by sender_id/receiver_id, not store_id
    customer_id: row.receiver_type === 'customer' ? String(row.receiver_id) : String(row.sender_id),
    customer_name: '',
    customer_image_url: null,
    last_message: '', // admin conversations has last_message_id FK, not text
    last_message_at: row.updated_at ?? row.created_at,
    unread_count: Number(row.unread_message_count ?? 0),
    created_at: row.created_at ?? new Date().toISOString(),
  } as Conversation;
}

function mapMessageRow(row: any): ChatMessage {
  return {
    id: String(row.id),
    conversation_id: String(row.conversation_id),
    sender_id: String(row.sender_id),
    sender_type: 'vendor', // admin's messages table has no sender_type; we assume vendor for outgoing
    message: row.message ?? '',
    attachment_url: row.file ?? null,
  } as ChatMessage;
}

function mapNotificationRow(row: any, storeId: string): Notification {
  return {
    id: String(row.id),
    store_id: storeId,
    title: row.title ?? '',
    body: row.description ?? '',
    image_url: null,
    is_read: Boolean(row.is_seen ?? false),
  } as Notification;
}

// =====================================================================
// STORES — admin's `stores` table (FK vendor_id → vendors.id)
// =====================================================================
export const storesApi = {
  /**
   * Look up the store owned by a vendor. The vendor row is identified by
   * its email (matching auth.users.email). Returns the store row or null.
   */
  async getByOwner(authUserEmail: string): Promise<Store | null> {
    // First find the vendor row by email
    const { data: vendor, error: vErr } = await supabase
      .from('vendors')
      .select('id')
      .eq('email', authUserEmail)
      .maybeSingle();
    if (vErr) throw vErr;
    if (!vendor) return null;

    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('vendor_id', vendor.id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapStoreRow(data) : null;
  },

  async getByVendorId(vendorId: string | number): Promise<Store | null> {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('vendor_id', vendorId)
      .maybeSingle();
    if (error) throw error;
    return data ? mapStoreRow(data) : null;
  },

  async get(id: string | number): Promise<Store | null> {
    const { data, error } = await supabase.from('stores').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? mapStoreRow(data) : null;
  },

  /**
   * Create a new store owned by a vendor. The `owner_id` field on the
   * vendor-app type maps to `vendor_id` on the admin's `stores` table.
   */
  async create(payload: Partial<Store> & { vendor_id?: number | string }): Promise<Store> {
    const insertRow: Record<string, any> = {
      name: payload.name,
      phone: payload.contact_phone,
      email: payload.contact_email,
      address: payload.address,
      lat: payload.latitude != null ? String(payload.latitude) : null,
      lng: payload.longitude != null ? String(payload.longitude) : null,
      logo: payload.logo_url,
      cover_photo: payload.cover_url,
      tax: payload.vat_percent ?? 0,
      minimum_order: payload.min_order_amount ?? 0,
      active: payload.is_active ?? true,
      status: payload.is_open ?? true,
      // Default admin columns
      comission: 0,
      schedule_order: false,
      free_delivery: false,
      delivery: true,
      take_away: false,
      self_delivery_system: false,
      pos_system: false,
      featured: false,
      store_business_model: 'commission',
      per_km_shipping_charge: 0,
      maximum_shipping_charge: 0,
      prescription_order: false,
      rating: 0,
      rating_count: 0,
      order_count: 0,
      is_subscribed: false,
    };
    if (payload.vendor_id !== undefined) insertRow.vendor_id = payload.vendor_id;
    if (payload.name) insertRow.slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const { data, error } = await supabase.from('stores').insert(insertRow).select().single();
    if (error) throw error;
    return mapStoreRow(data);
  },

  async update(id: string | number, patch: Partial<Store>): Promise<Store> {
    const updateRow: Record<string, any> = {};
    if (patch.name !== undefined) { updateRow.name = patch.name; updateRow.slug = String(patch.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
    if (patch.contact_phone !== undefined) updateRow.phone = patch.contact_phone;
    if (patch.contact_email !== undefined) updateRow.email = patch.contact_email;
    if (patch.address !== undefined) updateRow.address = patch.address;
    if (patch.latitude !== undefined) updateRow.lat = patch.latitude != null ? String(patch.latitude) : null;
    if (patch.longitude !== undefined) updateRow.lng = patch.longitude != null ? String(patch.longitude) : null;
    if (patch.logo_url !== undefined) updateRow.logo = patch.logo_url;
    if (patch.cover_url !== undefined) updateRow.cover_photo = patch.cover_url;
    if (patch.vat_percent !== undefined) updateRow.tax = patch.vat_percent;
    if (patch.min_order_amount !== undefined) updateRow.minimum_order = patch.min_order_amount;
    if (patch.is_active !== undefined) updateRow.active = patch.is_active;
    if (patch.is_open !== undefined) updateRow.status = patch.is_open;
    if (patch.description !== undefined) updateRow.announcement = patch.description;

    const { data, error } = await supabase
      .from('stores')
      .update(updateRow)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapStoreRow(data);
  },
};

// =====================================================================
// CATEGORIES — admin's `store_categories` table (store-scoped)
// =====================================================================
export const categoriesApi = {
  async list(storeId: string | number): Promise<Category[]> {
    const { data, error } = await supabase
      .from('store_categories')
      .select('*')
      .eq('store_id', storeId)
      .order('priority', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapCategoryRow);
  },
  async create(payload: Partial<Category> & { module_id?: number }): Promise<Category> {
    const insertRow: Record<string, any> = {
      store_id: payload.store_id,
      name: payload.name,
      priority: payload.priority ?? 0,
      status: payload.is_active ?? true,
    };
    if (payload.module_id !== undefined) insertRow.module_id = payload.module_id;
    if (payload.name) insertRow.slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const { data, error } = await supabase.from('store_categories').insert(insertRow).select().single();
    if (error) throw error;
    return mapCategoryRow(data);
  },
  async update(id: string | number, patch: Partial<Category>) {
    const updateRow: Record<string, any> = {};
    if (patch.name !== undefined) updateRow.name = patch.name;
    if (patch.priority !== undefined) updateRow.priority = patch.priority;
    if (patch.is_active !== undefined) updateRow.status = patch.is_active;
    const { data, error } = await supabase.from('store_categories').update(updateRow).eq('id', id).select().single();
    if (error) throw error;
    return mapCategoryRow(data);
  },
  async remove(id: string | number) {
    const { error } = await supabase.from('store_categories').delete().eq('id', id);
    if (error) throw error;
  },
};

// =====================================================================
// PRODUCTS — admin's `items` table
// =====================================================================
export const productsApi = {
  async list(storeId: string | number): Promise<Product[]> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapProductRow);
  },
  async create(payload: Partial<Product> & { module_id?: number; store_category_id?: number }): Promise<Product> {
    const insertRow: Record<string, any> = {
      store_id: payload.store_id,
      category_id: payload.category_id,
      name: payload.name,
      description: payload.description,
      image: payload.image_url,
      price: payload.price ?? 0,
      discount: payload.discount_price ?? 0,
      discount_type: 'amount',
      stock: payload.stock ?? 0,
      status: payload.is_available ?? true,
      veg: payload.is_veg ?? false,
      tax: 0,
      tax_type: 'exclude',
      is_approved: false, // requires admin approval
      added_by: 'vendor',
      avg_rating: 0,
      rating_count: 0,
      reviews_count: 0,
      order_count: 0,
      maximum_cart_quantity: 0,
      featured: false,
      recommended: false,
      organic: false,
      is_halal: false,
    };
    if (payload.module_id !== undefined) insertRow.module_id = payload.module_id;
    if (payload.store_category_id !== undefined) insertRow.store_category_id = payload.store_category_id;
    if (payload.name) insertRow.slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36);

    const { data, error } = await supabase.from('items').insert(insertRow).select().single();
    if (error) throw error;
    return mapProductRow(data);
  },
  async update(id: string | number, patch: Partial<Product>) {
    const updateRow: Record<string, any> = {};
    if (patch.name !== undefined) updateRow.name = patch.name;
    if (patch.description !== undefined) updateRow.description = patch.description;
    if (patch.image_url !== undefined) updateRow.image = patch.image_url;
    if (patch.price !== undefined) updateRow.price = patch.price;
    if (patch.discount_price !== undefined) updateRow.discount = patch.discount_price;
    if (patch.stock !== undefined) updateRow.stock = patch.stock;
    if (patch.is_available !== undefined) updateRow.status = patch.is_available;
    if (patch.is_veg !== undefined) updateRow.veg = patch.is_veg;
    if (patch.category_id !== undefined) updateRow.category_id = patch.category_id;

    const { data, error } = await supabase
      .from('items')
      .update(updateRow)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapProductRow(data);
  },
  async remove(id: string | number) {
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) throw error;
  },
};

// =====================================================================
// ORDERS — admin's `orders` + `order_details` tables
// =====================================================================
export const ordersApi = {
  async list(storeId: string | number, status?: string): Promise<Order[]> {
    let q = supabase
      .from('orders')
      .select('*, items:order_details(*), stores!inner(id, name, logo, phone, address)')
      .eq('store_id', storeId);
    if (status && status !== 'all') q = q.eq('order_status', status);
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapOrderRow);
  },
  async get(id: string | number): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_details(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapOrderRow(data) : null;
  },
  async updateStatus(id: string | number, status: string) {
    const updateRow: Record<string, any> = {
      order_status: status,
      updated_at: new Date().toISOString(),
    };
    // Also flip the boolean status columns to match admin's expected state
    if (status === 'confirmed') updateRow.confirmed = true;
    if (status === 'processing') updateRow.processing = true;
    if (status === 'handover') updateRow.handover = true;
    if (status === 'picked_up') updateRow.picked_up = true;
    if (status === 'delivered') updateRow.delivered = true;
    if (status === 'canceled') updateRow.canceled = true;

    const { data, error } = await supabase
      .from('orders')
      .update(updateRow)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapOrderRow(data);
  },
};

// =====================================================================
// COUPONS — admin's `coupons` table
// =====================================================================
export const couponsApi = {
  async list(storeId: string | number): Promise<Coupon[]> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapCouponRow);
  },
  async create(payload: Partial<Coupon>): Promise<Coupon> {
    const insertRow: Record<string, any> = {
      store_id: payload.store_id,
      title: payload.title ?? payload.code,
      code: payload.code,
      discount: payload.discount_amount ?? 0,
      discount_type: payload.discount_type ?? 'amount',
      coupon_type: 'store_base',
      min_purchase: payload.min_purchase ?? 0,
      max_discount: payload.max_discount ?? 0,
      limit: payload.usage_limit ?? 0,
      total_uses: 0,
      status: payload.is_active ?? true,
      start_date: payload.start_date,
      expire_date: payload.end_date,
      created_by: 'vendor',
    };
    if (payload.code) insertRow.slug = payload.code.toLowerCase();

    const { data, error } = await supabase.from('coupons').insert(insertRow).select().single();
    if (error) throw error;
    return mapCouponRow(data);
  },
  async update(id: string | number, patch: Partial<Coupon>) {
    const updateRow: Record<string, any> = {};
    if (patch.title !== undefined) updateRow.title = patch.title;
    if (patch.code !== undefined) updateRow.code = patch.code;
    if (patch.discount_amount !== undefined) updateRow.discount = patch.discount_amount;
    if (patch.discount_type !== undefined) updateRow.discount_type = patch.discount_type;
    if (patch.min_purchase !== undefined) updateRow.min_purchase = patch.min_purchase;
    if (patch.max_discount !== undefined) updateRow.max_discount = patch.max_discount;
    if (patch.usage_limit !== undefined) updateRow.limit = patch.usage_limit;
    if (patch.is_active !== undefined) updateRow.status = patch.is_active;
    if (patch.start_date !== undefined) updateRow.start_date = patch.start_date;
    if (patch.end_date !== undefined) updateRow.expire_date = patch.end_date;

    const { data, error } = await supabase
      .from('coupons')
      .update(updateRow)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapCouponRow(data);
  },
  async remove(id: string | number) {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) throw error;
  },
};

// =====================================================================
// CAMPAIGNS — admin's `campaigns` + `campaign_store` join table
// =====================================================================
export const campaignsApi = {
  /**
   * List all campaigns available to this store (admin creates them; the
   * store owner can join or leave). Joins `campaign_store` to know status.
   */
  async list(storeId: string | number): Promise<Campaign[]> {
    // Read all running campaigns
    const { data: campaigns, error: e1 } = await supabase
      .from('campaigns')
      .select('*')
      .eq('status', 'running')
      .order('created_at', { ascending: false });
    if (e1) throw e1;

    // Read this store's join status
    const { data: joins, error: e2 } = await supabase
      .from('campaign_store')
      .select('campaign_id, campaign_status')
      .eq('store_id', storeId);
    if (e2) throw e2;

    const joinMap = new Map<string, string>();
    (joins ?? []).forEach((j: any) => joinMap.set(String(j.campaign_id), j.campaign_status));

    return (campaigns ?? []).map((row: any) => ({
      id: String(row.id),
      store_id: String(storeId),
      title: row.title ?? '',
      description: row.description ?? '',
      image_url: row.image ?? null,
      start_date: row.start_date ?? null,
      end_date: row.end_date ?? null,
      is_joined: joinMap.has(String(row.id)),
      is_active: row.status === 'running',
    } as Campaign));
  },
  async join(storeId: string | number, campaignId: string | number) {
    // Upsert a row in campaign_store
    const { error } = await supabase
      .from('campaign_store')
      .upsert({
        campaign_id: campaignId,
        store_id: storeId,
        campaign_status: 'running',
      }, { onConflict: 'campaign_id,store_id' });
    if (error) throw error;
  },
  async leave(storeId: string | number, campaignId: string | number) {
    const { error } = await supabase
      .from('campaign_store')
      .delete()
      .eq('campaign_id', campaignId)
      .eq('store_id', storeId);
    if (error) throw error;
  },
};

// =====================================================================
// BANNERS — admin's `banners` table (global, but we filter by module_id)
// =====================================================================
export const bannersApi = {
  async list(storeId: string | number): Promise<Banner[]> {
    // Admin banners are global; we show all active banners to the vendor
    // (they're not store-scoped in the admin panel).
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('status', true)
      .order('featured', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapBannerRow);
  },
  /**
   * Vendors cannot create banners in the admin panel — only admins can.
   * This method is kept for backward-compat with the UI but will throw
   * 'permission denied' under RLS unless the user is an admin.
   */
  async create(payload: Partial<Banner>) {
    const insertRow: Record<string, any> = {
      title: payload.title ?? '',
      image: payload.image_url ?? '',
      type: 'app',
      status: payload.is_active ?? true,
      created_by: 'vendor',
      featured: Boolean(payload.priority ?? 0),
    };
    const { data, error } = await supabase.from('banners').insert(insertRow).select().single();
    if (error) throw error;
    return mapBannerRow(data);
  },
  async remove(id: string | number) {
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (error) throw error;
  },
};

// =====================================================================
// ADDONS — admin's `add_ons` table (global, not store-scoped)
// =====================================================================
export const addonsApi = {
  async list(storeId: string | number): Promise<Addon[]> {
    // Admin's add_ons table is global (no store_id). We return all active ones.
    const { data, error } = await supabase
      .from('add_ons')
      .select('*')
      .eq('status', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapAddonRow);
  },
  async create(payload: Partial<Addon>) {
    const insertRow: Record<string, any> = {
      name: payload.name ?? '',
      price: payload.price ?? 0,
      status: payload.is_available ?? true,
    };
    const { data, error } = await supabase.from('add_ons').insert(insertRow).select().single();
    if (error) throw error;
    return mapAddonRow(data);
  },
  async update(id: string | number, patch: Partial<Addon>) {
    const updateRow: Record<string, any> = {};
    if (patch.name !== undefined) updateRow.name = patch.name;
    if (patch.price !== undefined) updateRow.price = patch.price;
    if (patch.is_available !== undefined) updateRow.status = patch.is_available;
    const { data, error } = await supabase.from('add_ons').update(updateRow).eq('id', id).select().single();
    if (error) throw error;
    return mapAddonRow(data);
  },
  async remove(id: string | number) {
    const { error } = await supabase.from('add_ons').delete().eq('id', id);
    if (error) throw error;
  },
};

// =====================================================================
// DELIVERY MEN — admin's `delivery_men` table (filtered by store_id)
// =====================================================================
export const deliveryMenApi = {
  async list(storeId: string | number): Promise<DeliveryMan[]> {
    const { data, error } = await supabase
      .from('delivery_men')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapDeliveryManRow);
  },
  async create(payload: Partial<DeliveryMan>) {
    const insertRow: Record<string, any> = {
      f_name: payload.full_name?.split(' ')[0] ?? '',
      l_name: payload.full_name?.split(' ').slice(1).join(' ') ?? '',
      phone: payload.phone ?? '',
      email: payload.email ?? '',
      image: payload.image_url,
      store_id: payload.store_id,
      status: payload.is_active ?? true,
      active: payload.is_active ?? false,
      earning: 0,
      current_orders: 0,
      type: 'delivery_man',
      application_status: 'pending',
      order_count: 0,
      is_delivery: true,
      is_ride: false,
      loyalty_point: 0,
    };
    const { data, error } = await supabase.from('delivery_men').insert(insertRow).select().single();
    if (error) throw error;
    return mapDeliveryManRow(data);
  },
  async update(id: string | number, patch: Partial<DeliveryMan>) {
    const updateRow: Record<string, any> = {};
    if (patch.full_name !== undefined) {
      const parts = patch.full_name.split(' ');
      updateRow.f_name = parts[0] ?? '';
      updateRow.l_name = parts.slice(1).join(' ') ?? '';
    }
    if (patch.phone !== undefined) updateRow.phone = patch.phone;
    if (patch.email !== undefined) updateRow.email = patch.email;
    if (patch.image_url !== undefined) updateRow.image = patch.image_url;
    if (patch.is_active !== undefined) {
      updateRow.active = patch.is_active;
      updateRow.status = patch.is_active;
    }
    const { data, error } = await supabase
      .from('delivery_men')
      .update(updateRow)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapDeliveryManRow(data);
  },
  async remove(id: string | number) {
    const { error } = await supabase.from('delivery_men').delete().eq('id', id);
    if (error) throw error;
  },
};

// =====================================================================
// DISBURSEMENTS — admin's `disbursements` table
// =====================================================================
export const disbursementsApi = {
  async list(storeId: string | number): Promise<Disbursement[]> {
    const { data, error } = await supabase
      .from('disbursements')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapDisbursementRow);
  },
  async create(payload: Partial<Disbursement>) {
    const insertRow: Record<string, any> = {
      store_id: payload.store_id,
      amount: payload.amount ?? 0,
      status: payload.status ?? 'pending',
      disbursement_date: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('disbursements').insert(insertRow).select().single();
    if (error) throw error;
    return mapDisbursementRow(data);
  },
};

// =====================================================================
// CHAT — admin's `conversations` + `messages` tables
// =====================================================================
export const chatApi = {
  async conversations(storeId: string | number): Promise<Conversation[]> {
    // Admin conversations are keyed by sender_id (vendor's id) + receiver_id (customer's id)
    // We query where sender_id = storeId OR receiver_id = storeId (the vendor side)
    const sid = String(storeId);
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`sender_id.eq.${sid},receiver_id.eq.${sid}`)
      .order('updated_at', { ascending: false, nullsFirst: false });
    if (error) throw error;
    return (data ?? []).map(mapConversationRow);
  },
  async messages(conversationId: string | number): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapMessageRow);
  },
  async send(conversationId: string | number, senderId: string, message: string, attachmentUrl?: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        message,
        file: attachmentUrl ?? null,
        is_seen: false,
      })
      .select()
      .single();
    if (error) throw error;
    // Update conversation's unread count + last_message_id
    await supabase
      .from('conversations')
      .update({
        last_message_id: data.id,
        unread_message_count: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId);
    return mapMessageRow(data);
  },
};

// =====================================================================
// NOTIFICATIONS — admin's `user_notifications` table (keyed by user_id)
// For vendor, user_id is the auth.users UUID of the vendor's auth account.
// =====================================================================
export const notificationsApi = {
  async list(userId: string, storeId?: string | number): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row: any) => mapNotificationRow(row, String(storeId ?? '')));
  },
  async markRead(id: string | number) {
    const { error } = await supabase.from('user_notifications').update({ is_seen: true }).eq('id', id);
    if (error) throw error;
  },
};

// =====================================================================
// STORAGE — uses admin's `public-assets` bucket
// =====================================================================
export const storageApi = {
  async upload(bucket: string, path: string, file: File | Blob | ArrayBuffer): Promise<string> {
    // Map legacy bucket names to admin's `public-assets` bucket
    const adminBucket = 'public-assets';
    const fullPath = `${bucket}/${path}`;
    const { data, error } = await supabase.storage
      .from(adminBucket)
      .upload(fullPath, file, { upsert: true });
    if (error) throw error;
    const { data: pub } = supabase.storage.from(adminBucket).getPublicUrl(data.path);
    return pub.publicUrl;
  },
};

// =====================================================================
// VENDORS — admin's `vendors` table (for profile lookup)
// =====================================================================
export const vendorsApi = {
  async getByEmail(email: string) {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
  async getById(id: string | number) {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
  async create(payload: { name: string; email: string; phone: string; password?: string }) {
    const { data, error } = await supabase
      .from('vendors')
      .insert({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        status: 'pending',
        application_status: 'pending',
        is_active: false,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async updateActive(id: string | number, isActive: boolean) {
    const { error } = await supabase
      .from('vendors')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },
};
