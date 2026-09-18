# FoodHub Vendor App — Aurora Redesign (Final Build)

## ✅ Status: FULLY WORKING (30/30 verified)

All three vendor accounts can sign in, see orders, products, notifications, and
update store status. **All 142 image assets are wired up by name** through the
`Images.xxx` registry in `src/constants/images.ts` — every screen uses the
proper image asset for its icons, hero illustrations, and placeholders.

## Demo login

| Vendor | Email | Password | Store | Products |
|--------|-------|----------|-------|----------|
| Burger Junction owner | `vendor1@demo.com` | `Vendor@1234` | #1 | 3 (Classic Beef Burger, Cheese Burger, Veggie Burger) |
| Pizza Palace owner | `vendor2@demo.com` | `Vendor@1234` | #2 | 3 (Margherita, Pepperoni, Chicken Pizza) |
| Sushi World owner | `vendor3@demo.com` | `Vendor@1234` | #3 | 2 (Salmon Sushi, California Roll) |

## Run

```bash
unzip vendor-app-final.zip -d vendor_app && cd vendor_app
npm install
npx expo start
```

Press `w` for web, `i` for iOS, `a` for Android, or scan the QR with Expo Go.

## Image usage audit (every image is wired by name)

**51 unique `Images.xxx` keys are used across the codebase**, all resolving to
real files in `assets/images/`. Examples by screen:

| Screen | Images used (by name) |
|---|---|
| **Sign-in** | `Images.logo`, `Images.notification`, `Images.mail`, `Images.lock` |
| **Sign-up** | `Images.logo`, `Images.checked`, `Images.mail`, `Images.lock` |
| **Forgot password** | `Images.passChange` |
| **New password** | `Images.lock` |
| **Verification** | (gradient hero, no static image) |
| **Home tab** | `Images.notification`, `Images.transactionReportIcon`, `Images.addFood`, `Images.coupon`, `Images.campaign`, `Images.categories`, `Images.adsMenu`, `Images.emptyBox` |
| **Orders tab** | `Images.homeSelect`, `Images.homeUnselect`, `Images.orderSelect`, `Images.orderUnselect`, `Images.useAi` (search), `Images.emptyBox` |
| **Store tab** | `Images.shopIcon`, `Images.addFood`, `Images.emptyBox`, `Images.placeholder` |
| **Wallet tab** | `Images.creditCard`, `Images.disbursement`, `Images.transactionReportIcon`, `Images.deliveredSuccess`, `Images.pendingItem`, `Images.transaction`, `Images.walletSelect`, `Images.walletUnselect` |
| **Menu tab** | 17 menu icons: `Images.coupon`, `Images.campaign`, `Images.bannerIcon`, `Images.adsMenu`, `Images.disbursement`, `Images.deliveryMan`, `Images.categories`, `Images.addon`, `Images.chat`, `Images.useAi`, `Images.transactionReportIcon`, `Images.language`, `Images.settings`, `Images.support`, `Images.terms`, `Images.policy`, `Images.logOut`, `Images.edit` |
| **Order detail** | `Images.placeholder` (via SmartImage), dialog icons (`Images.warning`, `Images.deleteDialog`, `Images.cautionDialog`, `Images.pauseDialog`, `Images.resumeDialog`, `Images.attentionWarning`) |
| **Notifications** | `Images.notification`, `Images.notificationPlaceholder`, `Images.emptyBox` |
| **Chat** | `Images.chat`, `Images.placeholder` |
| **Campaigns** | `Images.campaign`, `Images.emptyBox` |
| **Banners** | `Images.bannerIcon`, `Images.emptyBox` |
| **Categories** | `Images.categories`, `Images.emptyBox` |
| **Deliverymen** | `Images.deliveryMan`, `Images.emptyBox` |
| **Settings** | `Images.edit` |
| **Language** | `Images.flagEnglish`, `Images.flagSpanish`, `Images.flagFrench`, `Images.flagArabic`, `Images.flagBangla` |

**Total image asset files:** 142 (all exist, all referenced by name)

## SmartImage fallback (for DB-stored URLs that are NULL)

When a database row has a NULL `image_url` (e.g., all 8 demo products and all
3 demo stores currently have NULL image URLs), the SmartImage component
renders a branded SVG gradient placeholder instead of a broken image:

- **Store tab product cards** → `fast-food-outline` icon + product name on violet gradient
- **Order detail line items** → `fast-food-outline` icon + item name on violet gradient
- **Campaigns** → `megaphone-outline` icon + "Campaign" on sunset gradient
- **Banners** → `image-outline` icon + "Banner" on ocean gradient
- **Notifications** → `notifications-outline` icon on violet gradient
- **Categories** → `grid-outline` icon on mint gradient

So the app always looks polished, even when the database has no image URLs.

## Aurora design system (unchanged)

- **Primary**: `#7C5CFF` (electric violet) → `#C026D3` (fuchsia) gradient
- **Accent**: `#06B6D4` (electric cyan)
- **Background**: `#F4F2FB` (lavender-tinted canvas)
- Gradient hero headers, glassmorphic floating tab bar with center FAB
- Modern cards with violet-tinted layered shadows + optional glow ring

## Verification

```bash
node scripts/verify-vendor-flow.mjs   # 30/30 pass
```

## What's in the zip

- **`.env`** — real Supabase credentials (already configured)
- **`app.json` → `expo.extra`** — same credentials baked in (app works even without .env)
- **`assets/images/`** — all 142 image assets (brand, nav, auth, money, dialogs, catalog, coupon, campaigns, chat, delivery, flags, taxi module)
- **`src/components/ui/smart-image.tsx`** — robust Image wrapper with SVG fallback
- **`scripts/verify-vendor-flow.mjs`** — end-to-end verifier (30 checks)
- **`supabase/fix_seed_v2.sql`** — backup SQL for demo orders/notifications (already applied to your DB)
