// Full end-to-end verification — exactly mirrors what the vendor app does.
import { createClient } from '@supabase/supabase-js';

const URL  = 'https://xtoinftyvasmixgywngv.supabase.co';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0b2luZnR5dmFzbWl4Z3l3bmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMTYwMjgsImV4cCI6MjEwMjc5MjAyOH0.dpe2My40IQ5ZzDjsWDKpaa3-0WVcGhONH0qvgvPbRGQ';

// anon client — exactly what the vendor app uses
const supabase = createClient(URL, ANON, { auth: { persistSession: false } });

const VENDORS = [
  { email: 'vendor1@demo.com', password: 'Vendor@1234', label: 'Burger Junction', expectedStore: 1 },
  { email: 'vendor2@demo.com', password: 'Vendor@1234', label: 'Pizza Palace', expectedStore: 2 },
  { email: 'vendor3@demo.com', password: 'Vendor@1234', label: 'Sushi World', expectedStore: 3 },
];

const SEP = '═'.repeat(72);
let pass = 0, fail = 0;
const ok = (m) => { pass++; console.log('   ✅ ' + m); };
const no = (m) => { fail++; console.log('   ❌ ' + m); };

async function verifyVendor({ email, password, label, expectedStore }) {
  console.log('\n' + '─'.repeat(72));
  console.log(`  Vendor: ${email}  (${label})`);
  console.log('─'.repeat(72));

  // 1) sign-in
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
  if (authErr) { no('Auth sign-in: ' + authErr.message); return; }
  ok(`Auth sign-in OK (uid=${auth.user.id.substring(0,8)}...)`);

  // 2) loadProfile — query vendors by email
  const { data: vendor, error: vErr } = await supabase.from('vendors').select('*').eq('email', email).maybeSingle();
  if (vErr) { no('vendors query: ' + vErr.message); await supabase.auth.signOut(); return; }
  if (!vendor) { no('No vendors row'); await supabase.auth.signOut(); return; }
  ok(`vendors row OK: #${vendor.id} (${vendor.name})`);

  // 3) loadProfile — query stores by vendor_id
  const { data: store, error: sErr } = await supabase.from('stores').select('*').eq('vendor_id', vendor.id).maybeSingle();
  if (sErr) { no('stores query: ' + sErr.message); await supabase.auth.signOut(); return; }
  if (!store) { no('No stores row'); await supabase.auth.signOut(); return; }
  ok(`stores row OK: #${store.id} (${store.name})`);

  // 4) Home screen — ongoing orders for this store
  const { data: orders, error: oErr } = await supabase
    .from('orders')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false });
  if (oErr) { no('orders query: ' + oErr.message); }
  else {
    ok(`orders query OK: ${orders.length} total orders for store #${store.id}`);
    const ongoing = orders.filter(o => o.order_status === 'pending' || o.order_status === 'confirmed');
    ok(`Ongoing (pending+confirmed): ${ongoing.length} — what home screen shows`);
    orders.slice(0, 5).forEach(o => {
      const amount = typeof o.order_amount === 'string' ? parseFloat(o.order_amount) : o.order_amount;
      console.log(`      - #${o.id} ${o.order_status.padEnd(10)} $${amount}`);
    });
  }

  // 5) Orders tab — filtered by status
  const { data: pending, error: pErr } = await supabase
    .from('orders')
    .select('*')
    .eq('store_id', store.id)
    .eq('order_status', 'pending');
  if (pErr) no('pending filter: ' + pErr.message);
  else ok(`Pending orders tab: ${pending.length}`);

  // 6) Store tab — products (items table)
  const { data: products, error: prErr } = await supabase
    .from('items')
    .select('*')
    .eq('store_id', store.id);
  if (prErr) no('items query: ' + prErr.message);
  else ok(`Products (items) for store: ${products.length}`);

  // 7) Order detail screen — fetch order_details for first order
  if (orders && orders.length > 0) {
    const firstOrderId = orders[0].id;
    const { data: details, error: dErr } = await supabase
      .from('order_details')
      .select('*')
      .eq('order_id', firstOrderId);
    if (dErr) no('order_details query: ' + dErr.message);
    else ok(`order_details for order #${firstOrderId}: ${details.length} line items`);
  }

  // 8) Notifications screen
  const { data: notifs, error: nErr } = await supabase
    .from('user_notifications')
    .select('*')
    .eq('user_id', auth.user.id);
  if (nErr) no('notifications query: ' + nErr.message);
  else ok(`Notifications for vendor: ${notifs.length}`);

  // 9) Update store status (Open/Close toggle)
  const { error: updErr } = await supabase
    .from('stores')
    .update({ status: true, active: true, updated_at: new Date().toISOString() })
    .eq('id', store.id);
  if (updErr) no('store update: ' + updErr.message);
  else ok('Store open/close toggle works');

  await supabase.auth.signOut();
}

async function main() {
  console.log(SEP);
  console.log('  VENDOR APP · FULL END-TO-END VERIFICATION');
  console.log('  Target: ' + URL);
  console.log(SEP);

  for (const v of VENDORS) {
    await verifyVendor(v);
  }

  console.log('\n' + SEP);
  console.log(`  RESULT · ${pass} passed, ${fail} failed`);
  console.log(SEP);
  process.exit(fail > 0 ? 1 : 0);
}
main();
