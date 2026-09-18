# Vendor App V1.0 — Unified with Admin Panel Database

Vendor mobile app (Expo + React Native + TypeScript + Supabase).

## ⚡ What's New in This Update

The vendor app now uses the **SAME Supabase database** as the admin panel, customer app, and delivery app. Previously it had its own private `profiles` + `stores` + `products` + `orders` schema with UUID PKs; now it uses the admin's `vendors` + `stores` + `items` + `orders` tables with BIGINT PKs.

### Key Changes

- **Auth model**: After login, the app looks up the `vendors` row by the auth user's email (was: a separate `profiles` table with UUID PK = auth.users.id).
- **Profile lookup**: `useAuth.loadProfile({ id, email })` queries `vendors WHERE email = $1` to find the business-owner row.
- **Store ownership**: Looked up via `stores.vendor_id` (was `stores.owner_id`). The vendor-app `Store.owner_id` is preserved as a backward-compat alias that maps to `vendors.id`.
- **Profile update**: Settings screen now writes to the `vendors` table by email (was `profiles.update()` by user_id).
- **Sign-up flow**: Creates (1) a Supabase auth user, (2) updates `user_profiles` role to `vendor`, (3) inserts a `vendors` row keyed by email, (4) creates the `stores` row with `vendor_id = vendors.id` and default `zone_id`/`module_id`.
- **Store open/close toggle**: Maps `is_open` boolean → `stores.status` (and also flips `stores.active` to keep them in sync).
- **Categories**: Now queries `store_categories` (was `categories`) — store-scoped, name + priority + status.
- **Products**: Now queries `items` (was `products`). Field-name mappers handle `image_url`→`image`, `discount_price`→`discount`, `is_available`→`status`, `is_veg`→`veg`, `rating`→`avg_rating`.
- **Orders**: Now joins `order_details` (was `order_items`). Status updates also flip the admin's boolean columns (`confirmed`, `processing`, `handover`, `picked_up`, `delivered`, `canceled`).
- **Coupons**: Field-name mappers handle `discount_amount`→`discount`, `end_date`→`expire_date`, `usage_limit`→`limit`, `used_count`→`total_uses`, `is_active`→`status`.
- **Campaigns**: Use the `campaign_store` join table for join/leave (was a boolean `is_joined` flag on campaigns). The list endpoint reads all `campaigns` with `status='running'` and left-joins `campaign_store` to compute the join state.
- **Banners**: Admin's `banners` table is global (not store-scoped). The vendor app now shows all active banners (read-only); `bannersApi.create` will be rejected by RLS unless the user is an admin.
- **Addons**: Admin's `add_ons` table is global (not store-scoped). The vendor app shows all active add-ons (read-only).
- **Notifications**: Now queries `user_notifications` keyed by `user_id` (was `notifications` keyed by `store_id`).
- **Storage**: All uploads now go to the admin's `public-assets` bucket (with a `<bucket>/path` prefix), instead of separate buckets per feature.

### Demo Login (after running `admin_panel/supabase/bootstrap_combined.sql`)
```
Email:    vendor@demo.com
Password: Vendor@1234
```

This vendor owns the demo "Fresh Mart" grocery store. After login you'll see:
- 4 products (apple, banana, tomato, milk)
- 1 coupon (`VENDOR10` — 10% off, max $5)
- 2 disbursements ($450 completed, $280 pending)
- 2 notifications
- 1 demo order (ORD-DEMO-001 — delivered)
- 4 active banners (read-only)
- 1 active campaign (read-only — can join/leave via campaign_store)

---

## 🚀 Setup

1. **Run the unified SQL bootstrap first** — see `admin_panel/README.md`:
   - Create a Supabase project at https://supabase.com
   - Open Supabase SQL Editor → New query
   - Paste `admin_panel/supabase/bootstrap_combined.sql` and Run
   - This creates the demo vendor + 4 demo users total (admin, customer, delivery, vendor)

2. **Set Supabase env vars in this app**:
   - Edit `app.json` → set `expo.extra.supabaseUrl` and `expo.extra.supabaseAnonKey` to the SAME values as the admin's `.env.local`

3. **Install & run**:
   ```bash
   npm install
   npx expo start
   ```
   Press `i` (iOS), `a` (Android), or `w` (web). Log in with `vendor@demo.com / Vendor@1234`.

---

## 🗄️ Database Tables Used (with RLS)

| Table | Access | RLS Filter |
|---|---|---|
| `auth.users` (built-in) | login via `signInWithPassword({email})` | n/a |
| `user_profiles` | signup updates role to `vendor` | own row only |
| `vendors` | SELECT + UPDATE own row (by email) | `email = auth.user.email` |
| `stores` | SELECT + UPDATE own store | `vendor_id = current_vendor_id()` |
| `store_categories` | full CRUD | `store_id IN (SELECT id FROM stores WHERE vendor_id = current_vendor_id())` |
| `items` | full CRUD | `store_id IN (SELECT id FROM stores WHERE vendor_id = current_vendor_id())` |
| `orders` | SELECT + UPDATE (status changes) | `store_id IN (...)` |
| `order_details` | SELECT (via parent order) | via parent order ownership |
| `coupons` | full CRUD | `store_id IN (...)` |
| `campaign_store` | INSERT/DELETE (join/leave) | `store_id IN (...)` |
| `campaigns` | SELECT (read-only, all running) | `status = 'running'` (public read) |
| `banners` | SELECT only | `status = true` (public read) |
| `add_ons` | SELECT only | `status = true` (public read) |
| `delivery_men` | full CRUD | `store_id IN (...)` |
| `disbursements` | SELECT | `store_id IN (...)` |
| `conversations` | SELECT + INSERT + UPDATE | `sender_id OR receiver_id IN (vendor's store ids)` |
| `messages` | SELECT + INSERT | via parent conversation ownership |
| `user_notifications` | SELECT + UPDATE (own only) | `user_id = auth.uid()` |
| `withdraw_requests` | INSERT + SELECT own | `vendor_id = current_vendor_id()` |
| `withdrawal_methods` | SELECT only (global) | `is_active = true` |
| `wallet_transactions` | INSERT + SELECT own | `user_id = auth.uid()` |
| `loyalty_point_transactions` | INSERT + SELECT own | `user_id = auth.uid()` |

The `current_vendor_id()` SQL helper function looks up `vendors.id` from the auth user's email — see `admin_panel/supabase/base_schema.sql`.

---

## 📁 File Structure

```
vendor_app/
├── app.json               ← set expo.extra.supabaseUrl + supabaseAnonKey
├── supabase/schema.sql    ← pointer (real schema lives in admin_panel/supabase/)
├── src/
│   ├── lib/supabase.ts        ← reads app.json `extra` (same convention as other apps)
│   ├── hooks/useAuth.tsx      ← vendor auth via `vendors` table, email-based lookup
│   ├── services/api.ts        ← unified DB access (with row ↔ admin-column mappers)
│   ├── types/index.ts         ← TS interfaces (backward-compat with screens)
│   ├── app/                   ← Expo Router screens (44 screens)
│   │   ├── (auth)/            ← sign-in, sign-up, forgot-password, verification, new-password
│   │   ├── (root)/(tabs)/     ← home, orders, store, wallet, menu
│   │   ├── orders/[id].tsx
│   │   ├── products/add.tsx
│   │   ├── categories/, addons/, banners/, coupons/, campaigns/
│   │   ├── deliverymen/, disbursements/, chat/, notifications/
│   │   └── settings/, business/, language/, ads/
│   └── constants/, components/, utils/, locale/
└── package.json
```

## 🔒 RLS Notes

- A vendor can ONLY see stores where `stores.vendor_id = vendors.id` (matched by email).
- A vendor can ONLY read/write items, orders, coupons, store_categories, etc. for their own store.
- Items inserted by a vendor start with `is_approved = false` — the admin must approve them before they appear in the customer app.
- Withdraw requests are scoped to the vendor (via `vendor_id`).
- Notifications and wallet/loyalty transactions are scoped to the auth user's UUID.

## 📝 Notes

- The vendor app's `VendorProfile` and `Store` types are preserved for backward-compatibility with screens; the `mapStoreRow()`, `mapProductRow()`, `mapOrderRow()`, etc. helpers in `services/api.ts` translate between the admin's column names and these legacy types.
- Sign-up creates a `vendors` row with `status='pending'`, `application_status='pending'`, `is_active=false` — the admin must approve the vendor before they can log in successfully. The demo vendor (`vendor@demo.com`) is pre-approved by `seed_demo.sql`.
- The vendor app's old `app.json` had no `extra` block — this update adds one with `supabaseUrl` + `supabaseAnonKey` placeholders, mirroring the customer and delivery apps.
- The `bannersApi.create` and `addonsApi.create` calls will fail under RLS unless the user is an admin — admin banners/addons are global. The vendor app's banners/addons screens should be read-only in production.

## 📦 Related Apps

- `admin_panel/` — Next.js 16 admin panel (manages vendors, stores, items, orders, delivery_men, banners, campaigns, coupons, disbursements)
- `customer_app/customar/` — Expo customer app (places orders)
- `delivery_app/delivry_app/` — Expo delivery-man app (fulfills orders)
- `vendor_app/` — **this app** — Expo vendor app (manages their store, items, orders, coupons)
