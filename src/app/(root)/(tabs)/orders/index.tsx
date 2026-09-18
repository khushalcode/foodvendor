import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Images } from '@/constants/images';
import { useAuth } from '@/hooks/useAuth';
import { ordersApi } from '@/services/api';
import type { Order } from '@/types';
import { formatCurrency, timeAgo } from '@/utils/formatters';
import { CustomCard } from '@/components/ui/custom-card';
import { Shimmer } from '@/components/ui/shimmer';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';

const TABS: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'all', label: 'All', icon: 'grid-outline' },
  { key: 'pending', label: 'Pending', icon: 'time-outline' },
  { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle-outline' },
  { key: 'processing', label: 'Processing', icon: 'sync-outline' },
  { key: 'delivered', label: 'Delivered', icon: 'cube-outline' },
  { key: 'canceled', label: 'Canceled', icon: 'close-circle-outline' },
];

// Deterministic accent color per order, picked from the existing palette so
// nothing outside the app's design tokens is introduced.
const AVATAR_PALETTE = [Colors.primary, Colors.success, Colors.primaryDark];
function avatarColorFor(seed: string) {
  const code = seed?.charCodeAt(0) ?? 0;
  return AVATAR_PALETTE[code % AVATAR_PALETTE.length];
}

// Left-edge accent color per order status. Falls back to a neutral tone for
// any status string not explicitly handled, so unknown statuses never crash.
function statusAccentFor(status: string) {
  switch (status) {
    case 'delivered':
      return Colors.success;
    case 'canceled':
      return Colors.textMuted;
    case 'pending':
      return Colors.primary;
    default:
      return Colors.primaryDark;
  }
}

export default function OrdersScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { store } = useAuth();
  const [tab, setTab] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!store) return;
    try {
      const list = await ordersApi.list(store.id, tab);
      setOrders(list);
    } catch (err) {
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [store, tab]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  const subtitle = useMemo(() => {
    if (loading) return 'Loading…';
    if (orders.length === 0) return 'No orders';
    return `${orders.length} order${orders.length === 1 ? '' : 's'}`;
  }, [loading, orders.length]);

  const renderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity onPress={() => router.push(`/orders/${item.id}` as any)} activeOpacity={0.85}>
      <CustomCard style={StyleSheet.flatten([styles.orderCard, { borderLeftColor: statusAccentFor(item.order_status) }])}>
        <View style={styles.row}>
          <View style={[styles.avatar, { backgroundColor: `${avatarColorFor(item.customer_name)}1A`, borderColor: `${avatarColorFor(item.customer_name)}33` }]}>
            <Text style={[styles.avatarText, { color: avatarColorFor(item.customer_name) }]}>
              {item.customer_name?.charAt(0)?.toUpperCase() ?? '#'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.headerRow}>
              <Text style={styles.orderNumber}>#{item.order_number}</Text>
              <StatusBadge status={item.order_status} small />
            </View>
            <Text style={styles.customerName} numberOfLines={1}>{item.customer_name}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="bag-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.meta}>{item.items?.length ?? 0} items</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.meta}>{item.order_type.replace('_', ' ')}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.meta}>{timeAgo(item.created_at)}</Text>
            </View>
          </View>
          <View style={styles.rightCol}>
            <Text style={styles.amount}>{formatCurrency(item.total_amount)}</Text>
            <View style={styles.paymentPill}>
              <Text style={styles.paymentStatus}>{item.payment_status}</Text>
            </View>
          </View>
        </View>
      </CustomCard>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.default }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerEyebrow}>Manage</Text>
          <View style={styles.titleRow}>
            <Text style={styles.headerTitle}>{t('orders')}</Text>
            <Text style={styles.headerSubtitle}>{subtitle}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.searchBtn} activeOpacity={0.8}>
          <Ionicons name="search-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={TABS}
        keyExtractor={(i) => i.key}
        renderItem={({ item }) => {
          const active = tab === item.key;
          return (
            <TouchableOpacity
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setTab(item.key)}
              activeOpacity={0.7}
            >
              <Ionicons name={item.icon} size={14} color={active ? '#FFFFFF' : Colors.textSecondary} />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        }}
        style={styles.tabsList}
        contentContainerStyle={styles.tabsContent}
        showsHorizontalScrollIndicator={false}
      />

      <FlatList
        data={orders}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 120 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
        ListEmptyComponent={
          loading ? (
            <View style={{ gap: Spacing.default, padding: Spacing.default }}>
              {[1, 2, 3].map((i) => (
                <CustomCard key={i}>
                  <Shimmer width="50%" height={16} />
                  <View style={{ height: Spacing.small }} />
                  <Shimmer width="80%" height={12} />
                  <View style={{ height: Spacing.small }} />
                  <Shimmer width="40%" height={12} />
                </CustomCard>
              ))}
            </View>
          ) : (
            <EmptyState
              image={Images.emptyBox}
              title="No orders yet"
              description="When customers place orders they will appear here."
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background } as ViewStyle,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.default,
    marginBottom: Spacing.default,
  } as ViewStyle,
  headerEyebrow: {
    fontSize: FontSize.small,
    color: Colors.textMuted,
    fontWeight: FontWeight.semiBold as any,
    letterSpacing: 1,
    textTransform: 'uppercase',
  } as any,
  titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.small } as ViewStyle,
  headerTitle: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.black as any,
    color: Colors.textPrimary,
    letterSpacing: -0.8,
  } as any,
  headerSubtitle: {
    fontSize: FontSize.small,
    color: Colors.textMuted,
    fontWeight: FontWeight.semiBold as any,
  } as any,
  searchBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: Colors.border,
  } as ViewStyle,
  // flexGrow/flexShrink: 0 stops the horizontal list from being stretched
  // by the flex:1 column it sits in — that stretch was what inflated each
  // pill into a tall oval instead of a compact tab.
  tabsList: {
    flexGrow: 0,
    flexShrink: 0,
  } as ViewStyle,
  tabsContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.default,
    gap: Spacing.small,
    paddingBottom: Spacing.default,
  } as ViewStyle,
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    height: 36,
    gap: 6,
    paddingHorizontal: Spacing.large,
    borderRadius: Radius.circular,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  } as ViewStyle,
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  } as ViewStyle,
  tabLabel: { fontSize: FontSize.small, color: Colors.textSecondary, fontWeight: FontWeight.semiBold as any } as any,
  tabLabelActive: { color: '#FFFFFF' } as any,
  list: { padding: Spacing.default, gap: Spacing.default } as any,
  orderCard: {
    marginBottom: 0,
    borderLeftWidth: 3,
    borderTopLeftRadius: Radius?.default ?? 16,
    borderBottomLeftRadius: Radius?.default ?? 16,
  } as ViewStyle,
  row: { flexDirection: 'row', gap: Spacing.default, alignItems: 'center' } as ViewStyle,
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  } as ViewStyle,
  avatarText: { fontSize: FontSize.medium, fontWeight: FontWeight.bold as any } as any,
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' } as ViewStyle,
  orderNumber: { fontSize: FontSize.default, fontWeight: FontWeight.bold as any, color: Colors.textPrimary, letterSpacing: -0.1 } as any,
  customerName: { fontSize: FontSize.small, color: Colors.textSecondary, marginTop: 2 } as any,
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 } as ViewStyle,
  meta: { fontSize: FontSize.extraSmall, color: Colors.textMuted } as any,
  metaDot: { fontSize: FontSize.extraSmall, color: Colors.textMuted } as any,
  rightCol: { alignItems: 'flex-end' } as ViewStyle,
  amount: { fontSize: FontSize.default, fontWeight: FontWeight.bold as any, color: Colors.success } as any,
  paymentPill: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.circular,
    backgroundColor: Colors.background,
  } as ViewStyle,
  paymentStatus: { fontSize: FontSize.extraSmall, color: Colors.textMuted, textTransform: 'capitalize' } as any,
});