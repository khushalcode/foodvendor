-- =====================================================================
-- FoodHub · fix_seed_v2.sql  —  CORRECT seed data for vendor + delivery apps
-- ---------------------------------------------------------------------
-- WHAT THIS DOES
--   1. Inserts 12 demo orders across all 3 stores, all 3 customers, all 3 delivery men
--   2. Inserts 18 order_details rows (linked via item_id → items.id)
--   3. Inserts 9 user_notifications rows for vendors
--   4. Idempotent — safe to run multiple times (uses NOT EXISTS guards)
--
-- RUN THIS IN: Supabase Dashboard → SQL Editor → New Query → Run
--
-- PREREQUISITES (already done on this DB):
--   ✅ cleanup.sql         — fixed auth.users rows
--   ✅ fix_rls.sql          — fixed RLS policies that referenced auth.users
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------
-- 1) Seed demo orders for vendor + delivery apps to display.
--    Schema reference (verified):
--      orders(id, user_id, store_id, delivery_man_id, order_amount,
--             order_status, payment_method, payment_status, order_type,
--             delivery_address, schedule_at, pending, accepted, confirmed,
--             processing, handover, delivered, canceled, refunded,
--             coupon_code, coupon_discount_amount, zone_id, module_id,
--             canceled_by, created_at, updated_at)
-- ---------------------------------------------------------------

INSERT INTO orders (
  id, user_id, store_id, delivery_man_id,
  order_amount, order_status, payment_method, payment_status, order_type,
  delivery_address, schedule_at,
  pending, accepted, confirmed, processing, handover, delivered, canceled, refunded,
  coupon_code, coupon_discount_amount, zone_id, module_id, created_at, updated_at
)
SELECT * FROM (VALUES
  -- Store 1: Burger Junction (vendor1@demo.com, user_id f992c9ec-...)
  -- Order 1 — pending, customer1 (c53419cb-...), dm1
  (1001, 'c53419cb-107a-4797-b1dc-995d8c166f54'::uuid, 1, 1,
   540.00, 'pending', 'cash_on_delivery', 'unpaid', 'delivery',
   '123 Main Street, Apt 4B, Downtown', NULL,
   true, false, false, false, false, false, false, false,
   NULL, 0, 1, 1,
   NOW() - INTERVAL '15 minutes', NOW()),

  -- Order 2 — confirmed, customer1, dm1
  (1002, 'c53419cb-107a-4797-b1dc-995d8c166f54'::uuid, 1, 1,
   290.00, 'confirmed', 'cash_on_delivery', 'unpaid', 'delivery',
   '123 Main Street, Apt 4B, Downtown', NULL,
   false, true, true, false, false, false, false, false,
   NULL, 0, 1, 1,
   NOW() - INTERVAL '1 hour', NOW()),

  -- Order 3 — processing, customer2 (b7cb4b46-...), dm1
  (1003, 'b7cb4b46-b96a-4abd-aa03-7026ad9f9477'::uuid, 1, 1,
   480.00, 'processing', 'digital_payment', 'paid', 'delivery',
   '456 Oak Avenue, Suite 12, Midtown', NULL,
   false, true, true, true, false, false, false, false,
   NULL, 0, 1, 1,
   NOW() - INTERVAL '2 hours', NOW()),

  -- Order 4 — delivered, customer3 (10d3d17d-...), dm1
  (1004, '10d3d17d-8f78-4b72-8cc8-0f8e75398b6c'::uuid, 1, 1,
   740.00, 'delivered', 'digital_payment', 'paid', 'delivery',
   '789 Pine Street, Westside', NULL,
   false, true, true, true, true, true, false, false,
   NULL, 0, 1, 1,
   NOW() - INTERVAL '1 day', NOW()),

  -- Store 2: Pizza Palace (vendor2@demo.com, user_id 7f8585db-...)
  -- Order 5 — pending, customer2, dm2
  (1005, 'b7cb4b46-b96a-4abd-aa03-7026ad9f9477'::uuid, 2, 2,
   1200.00, 'pending', 'cash_on_delivery', 'unpaid', 'delivery',
   '321 Elm Street, Riverside', NULL,
   true, false, false, false, false, false, false, false,
   NULL, 0, 1, 1,
   NOW() - INTERVAL '20 minutes', NOW()),

  -- Order 6 — confirmed, customer3, dm2
  (1006, '10d3d17d-8f78-4b72-8cc8-0f8e75398b6c'::uuid, 2, 2,
   600.00, 'confirmed', 'cash_on_delivery', 'unpaid', 'take_away',
   'Pickup at Pizza Palace', NULL,
   false, true, true, false, false, false, false, false,
   NULL, 0, 1, 1,
   NOW() - INTERVAL '3 hours', NOW()),

  -- Order 7 — delivered, customer1, dm2
  (1007, 'c53419cb-107a-4797-b1dc-995d8c166f54'::uuid, 2, 2,
   1750.00, 'delivered', 'digital_payment', 'paid', 'delivery',
   '555 Maple Drive, Uptown', NULL,
   false, true, true, true, true, true, false, false,
   'WELCOME10', 100.00, 1, 1,
   NOW() - INTERVAL '2 days', NOW()),

  -- Order 8 — canceled, customer2, dm2
  (1008, 'b7cb4b46-b96a-4abd-aa03-7026ad9f9477'::uuid, 2, 2,
   550.00, 'canceled', 'cash_on_delivery', 'unpaid', 'delivery',
   '321 Elm Street, Riverside', NULL,
   false, true, true, false, false, false, true, false,
   NULL, 0, 1, 1,
   NOW() - INTERVAL '12 hours', NOW()),

  -- Store 3: Sushi World (vendor3@demo.com, user_id c6e2f1c8-...)
  -- Order 9 — confirmed, customer1, dm3
  (1009, 'c53419cb-107a-4797-b1dc-995d8c166f54'::uuid, 3, 3,
   900.00, 'confirmed', 'cash_on_delivery', 'unpaid', 'delivery',
   '123 Main Street, Apt 4B, Downtown', NULL,
   false, true, true, false, false, false, false, false,
   NULL, 0, 1, 1,
   NOW() - INTERVAL '45 minutes', NOW()),

  -- Order 10 — processing, customer2, dm3
  (1010, 'b7cb4b46-b96a-4abd-aa03-7026ad9f9477'::uuid, 3, 3,
   840.00, 'processing', 'digital_payment', 'paid', 'delivery',
   '456 Oak Avenue, Suite 12, Midtown', NULL,
   false, true, true, true, false, false, false, false,
   NULL, 0, 1, 1,
   NOW() - INTERVAL '90 minutes', NOW()),

  -- Order 11 — delivered, customer3, dm3
  (1011, '10d3d17d-8f78-4b72-8cc8-0f8e75398b6c'::uuid, 3, 3,
   1320.00, 'delivered', 'digital_payment', 'paid', 'delivery',
   '789 Pine Street, Westside', NULL,
   false, true, true, true, true, true, false, false,
   NULL, 0, 1, 1,
   NOW() - INTERVAL '3 days', NOW()),

  -- Order 12 — handover, customer1, dm3
  (1012, 'c53419cb-107a-4797-b1dc-995d8c166f54'::uuid, 3, 3,
   480.00, 'handover', 'cash_on_delivery', 'unpaid', 'delivery',
   '123 Main Street, Apt 4B, Downtown', NULL,
   false, true, true, true, true, false, false, false,
   NULL, 0, 1, 1,
   NOW() - INTERVAL '30 minutes', NOW())
) AS v(
  id, user_id, store_id, delivery_man_id,
  order_amount, order_status, payment_method, payment_status, order_type,
  delivery_address, schedule_at,
  pending, accepted, confirmed, processing, handover, delivered, canceled, refunded,
  coupon_code, coupon_discount_amount, zone_id, module_id, created_at, updated_at
)
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = v.id);

-- ---------------------------------------------------------------
-- 2) Seed order_details for each order.
--    Schema reference (verified):
--      order_details(id, order_id, item_id, item_details, quantity, price,
--                    discount_on_item, discount_type, created_at, updated_at)
--    `item_details` is a JSONB column holding the product snapshot.
-- ---------------------------------------------------------------

INSERT INTO order_details (
  id, order_id, item_id, item_details, quantity, price,
  discount_on_item, discount_type, created_at, updated_at
)
SELECT * FROM (VALUES
  -- Order 1001 (store 1) — 2x Classic Beef Burger ($250 ea) + 1x Veggie Burger ($200)
  (1001, 1001, 1, '{"name":"Classic Beef Burger","image_url":null}'::jsonb, 2, 250.00, 0, NULL, NOW(), NOW()),
  (1002, 1001, 3, '{"name":"Veggie Burger","image_url":null}'::jsonb,  1, 200.00, 0, NULL, NOW(), NOW()),

  -- Order 1002 (store 1) — 1x Cheese Burger ($290)
  (1003, 1002, 2, '{"name":"Cheese Burger","image_url":null}'::jsonb,  1, 290.00, 0, NULL, NOW(), NOW()),

  -- Order 1003 (store 1) — 1x Classic Beef Burger + 1x Veggie Burger
  (1004, 1003, 1, '{"name":"Classic Beef Burger","image_url":null}'::jsonb, 1, 250.00, 0, NULL, NOW(), NOW()),
  (1005, 1003, 3, '{"name":"Veggie Burger","image_url":null}'::jsonb,  1, 200.00, 0, NULL, NOW(), NOW()),

  -- Order 1004 (store 1) — 2x Cheese Burger + 1x Classic Beef Burger
  (1006, 1004, 2, '{"name":"Cheese Burger","image_url":null}'::jsonb,  2, 290.00, 0, NULL, NOW(), NOW()),
  (1007, 1004, 1, '{"name":"Classic Beef Burger","image_url":null}'::jsonb, 1, 250.00, 0, NULL, NOW(), NOW()),

  -- Order 1005 (store 2) — 2x Margherita Pizza + 1x Pepperoni Pizza
  (1008, 1005, 4, '{"name":"Margherita Pizza","image_url":null}'::jsonb, 2, 550.00, 0, NULL, NOW(), NOW()),
  (1009, 1005, 5, '{"name":"Pepperoni Pizza","image_url":null}'::jsonb, 1, 650.00, 0, NULL, NOW(), NOW()),

  -- Order 1006 (store 2) — 1x Margherita Pizza
  (1010, 1006, 4, '{"name":"Margherita Pizza","image_url":null}'::jsonb, 1, 550.00, 0, NULL, NOW(), NOW()),

  -- Order 1007 (store 2) — 2x Pepperoni Pizza + 1x Chicken Pizza
  (1011, 1007, 5, '{"name":"Pepperoni Pizza","image_url":null}'::jsonb,  2, 650.00, 0, NULL, NOW(), NOW()),
  (1012, 1007, 6, '{"name":"Chicken Pizza","image_url":null}'::jsonb,  1, 600.00, 0, NULL, NOW(), NOW()),

  -- Order 1008 (store 2) — 1x Margherita Pizza (canceled order)
  (1013, 1008, 4, '{"name":"Margherita Pizza","image_url":null}'::jsonb, 1, 550.00, 0, NULL, NOW(), NOW()),

  -- Order 1009 (store 3) — 2x Salmon Sushi
  (1014, 1009, 7, '{"name":"Salmon Sushi","image_url":null}'::jsonb, 2, 480.00, 0, NULL, NOW(), NOW()),

  -- Order 1010 (store 3) — 2x California Roll
  (1015, 1010, 8, '{"name":"California Roll","image_url":null}'::jsonb, 2, 420.00, 0, NULL, NOW(), NOW()),

  -- Order 1011 (store 3) — 1x Salmon Sushi + 2x California Roll
  (1016, 1011, 7, '{"name":"Salmon Sushi","image_url":null}'::jsonb, 1, 480.00, 0, NULL, NOW(), NOW()),
  (1017, 1011, 8, '{"name":"California Roll","image_url":null}'::jsonb, 2, 420.00, 0, NULL, NOW(), NOW()),

  -- Order 1012 (store 3) — 1x Salmon Sushi (handover)
  (1018, 1012, 7, '{"name":"Salmon Sushi","image_url":null}'::jsonb, 1, 480.00, 0, NULL, NOW(), NOW())
) AS v(
  id, order_id, item_id, item_details, quantity, price,
  discount_on_item, discount_type, created_at, updated_at
)
WHERE NOT EXISTS (SELECT 1 FROM order_details WHERE id = v.id);

-- ---------------------------------------------------------------
-- 3) Seed notifications for each vendor.
--    Schema reference (verified):
--      user_notifications(id, user_id, title, description, notification_type,
--                         data, is_seen, created_at)
-- ---------------------------------------------------------------

INSERT INTO user_notifications (
  id, user_id, title, description, notification_type, data, is_seen, created_at
)
SELECT * FROM (VALUES
  -- Vendor 1 (f992c9ec-...)
  (2001, 'f992c9ec-bade-4ffe-9624-e9728915adb5'::uuid,
   'New order received',
   'Order #1001 from customer1 — 2x Classic Beef Burger + 1x Veggie Burger',
   'order', '{"order_id":1001}'::jsonb, false, NOW() - INTERVAL '15 minutes'),
  (2002, 'f992c9ec-bade-4ffe-9624-e9728915adb5'::uuid,
   'Order confirmed',
   'Order #1002 has been confirmed by the customer',
   'order', '{"order_id":1002}'::jsonb, true, NOW() - INTERVAL '1 hour'),
  (2003, 'f992c9ec-bade-4ffe-9624-e9728915adb5'::uuid,
   'Order delivered',
   'Order #1004 has been delivered successfully',
   'order', '{"order_id":1004}'::jsonb, true, NOW() - INTERVAL '1 day'),

  -- Vendor 2 (7f8585db-...)
  (2004, '7f8585db-ce4e-493c-bf4c-21a75f42c3bc'::uuid,
   'New order received',
   'Order #1005 from customer2 — 2x Margherita Pizza + 1x Pepperoni Pizza',
   'order', '{"order_id":1005}'::jsonb, false, NOW() - INTERVAL '20 minutes'),
  (2005, '7f8585db-ce4e-493c-bf4c-21a75f42c3bc'::uuid,
   'Order delivered',
   'Order #1007 has been delivered — total $1,750.00',
   'order', '{"order_id":1007}'::jsonb, true, NOW() - INTERVAL '2 days'),
  (2006, '7f8585db-ce4e-493c-bf4c-21a75f42c3bc'::uuid,
   'Order canceled',
   'Order #1008 has been canceled by the customer',
   'order', '{"order_id":1008}'::jsonb, false, NOW() - INTERVAL '12 hours'),

  -- Vendor 3 (c6e2f1c8-...)
  (2007, 'c6e2f1c8-68b7-479f-9fcb-2f89bac2068e'::uuid,
   'New order received',
   'Order #1009 from customer1 — 2x Salmon Sushi',
   'order', '{"order_id":1009}'::jsonb, false, NOW() - INTERVAL '45 minutes'),
  (2008, 'c6e2f1c8-68b7-479f-9fcb-2f89bac2068e'::uuid,
   'Order in handover',
   'Order #1012 is ready for handover to delivery driver',
   'order', '{"order_id":1012}'::jsonb, false, NOW() - INTERVAL '30 minutes'),
  (2009, 'c6e2f1c8-68b7-479f-9fcb-2f89bac2068e'::uuid,
   'Weekly summary',
   'You completed 3 deliveries this week — total revenue $3,540.00',
   'summary', '{"week":"current"}'::jsonb, true, NOW() - INTERVAL '1 day')
) AS v(
  id, user_id, title, description, notification_type, data, is_seen, created_at
)
WHERE NOT EXISTS (SELECT 1 FROM user_notifications WHERE id = v.id);

-- ---------------------------------------------------------------
-- 4) Final summary
-- ---------------------------------------------------------------
DO $$
DECLARE
  n_orders int; n_od int; n_un int;
BEGIN
  SELECT count(*) INTO n_orders FROM orders WHERE id BETWEEN 1001 AND 1012;
  SELECT count(*) INTO n_od     FROM order_details WHERE order_id BETWEEN 1001 AND 1012;
  SELECT count(*) INTO n_un     FROM user_notifications WHERE id BETWEEN 2001 AND 2009;
  RAISE NOTICE '============================';
  RAISE NOTICE '  fix_seed_v2.sql complete';
  RAISE NOTICE '============================';
  RAISE NOTICE '  orders         : % / 12', n_orders;
  RAISE NOTICE '  order_details  : % / 18', n_od;
  RAISE NOTICE '  notifications  : % / 9',  n_un;
  RAISE NOTICE '============================';
END $$;

COMMIT;
