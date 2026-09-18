import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Images } from '@/constants/images';
import { useAuth } from '@/hooks/useAuth';
import { ordersApi } from '@/services/api';
import type { Order } from '@/types';
import { formatCurrency, formatNumber, timeAgo } from '@/utils/formatters';
import { CustomCard } from '@/components/ui/custom-card';
import { Shimmer } from '@/components/ui/shimmer';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';

export default function HomeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { store, profile, updateStoreStatus } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!store) return;
    try {
      const list = await ordersApi.list(store.id);
      setOrders(list.filter((o) => o.order_status === 'pending' || o.order_status === 'confirmed'));
    } catch (err) {
      // silent fail — show empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [store]);

  useEffect(() => { load(); }, [load]);

  const stats = {
    todaySales: 1248.50,
    todayOrders: orders.length,
    monthSales: 24560.25,
    monthOrders: 142,
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingTop: 0 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
    >
      {/* Hero gradient header */}
      <LinearGradient
        colors={[Colors.heroGradientStart, Colors.heroGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + Spacing.default, paddingBottom: Spacing.extremeLarge, borderBottomLeftRadius: Radius.extraOverLarge, borderBottomRightRadius: Radius.extraOverLarge }]}
      >
        {/* Decorative blobs */}
        <View style={styles.heroBlob1} />
        <View style={styles.heroBlob2} />
        {/* Header: logo + notification */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroGreeting}>Good morning,</Text>
            <Text style={styles.heroName}>{store?.name ?? 'Your Store'}</Text>
          </View>
          <TouchableOpacity style={styles.bellBtn} onPress={() => router.push('/notifications')} activeOpacity={0.8}>
            <Image source={Images.notification} style={styles.bell} />
            <View style={styles.dot} />
          </TouchableOpacity>
        </View>

        {/* Store availability toggle */}
        <View style={styles.storeRow}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.small }}>
            <View style={[styles.statusPulse, store?.is_open ? styles.statusPulseOn : styles.statusPulseOff]} />
            <View>
              <Text style={styles.storeStatus}>
                {store?.is_open ? 'Store is open' : 'Store is closed'}
              </Text>
              <Text style={styles.storeSub}>{store?.is_open ? 'Accepting orders now' : 'Tap to start accepting'}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.toggle, store?.is_open ? styles.toggleOn : styles.toggleOff]}
            onPress={() => store && updateStoreStatus(!store.is_open)}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, store?.is_open ? styles.toggleTextOn : styles.toggleTextOff]}>
              {store?.is_open ? 'Open' : 'Close'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Analytics card overlapping hero */}
      <View style={styles.analyticsOuter}>
        <CustomCard style={styles.analyticsCard} glow>
          <View style={styles.analyticsHeader}>
            <View style={styles.analyticsIconWrap}>
              <LinearGradient
                colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Image source={Images.transactionReportIcon} style={styles.analyticsIcon} />
            </View>
            <Text style={styles.analyticsTitle}>{t('business_analytics')}</Text>
          </View>
          <View style={styles.analyticsRow}>
            <StatBlock label="Today's Sales" value={formatCurrency(stats.todaySales)} accent={Colors.success} />
            <StatBlock label="Today's Orders" value={formatNumber(stats.todayOrders)} accent={Colors.primary} />
            <StatBlock label="Month Sales" value={formatCurrency(stats.monthSales)} accent={Colors.warning} />
            <StatBlock label="Month Orders" value={formatNumber(stats.monthOrders)} accent={Colors.danger} />
          </View>
        </CustomCard>
      </View>

      {/* Quick actions */}
      <View style={styles.quickRow}>
        <QuickAction icon={Images.addFood} label="Add Product" onPress={() => router.push('/products/add')} />
        <QuickAction icon={Images.coupon} label="Coupons" onPress={() => router.push('/coupons')} />
        <QuickAction icon={Images.campaign} label="Campaigns" onPress={() => router.push('/campaigns')} />
        <QuickAction icon={Images.categories} label="Categories" onPress={() => router.push('/categories')} />
      </View>

      {/* Ads section */}
      <LinearGradient
        colors={[Colors.sunsetStart, Colors.sunsetEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.adsCard}
      >
        <View style={styles.adsBlob} />
        <View style={styles.adsHeader}>
          <View style={styles.adsIconWrap}>
            <Image source={Images.adsMenu} style={styles.adsIcon} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.adsTitle}>Boost your reach</Text>
            <Text style={styles.adsSubtitle}>Create an advertisement to attract more customers</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.adsCta} onPress={() => router.push('/ads')} activeOpacity={0.85}>
          <Text style={styles.adsCtaText}>Create Ad</Text>
          <Text style={styles.adsCtaArrow}>→</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Ongoing orders */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Ongoing Orders</Text>
        <TouchableOpacity onPress={() => router.push('/(root)/(tabs)/orders')}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ gap: Spacing.default }}>
          {[1, 2, 3].map((i) => (
            <CustomCard key={i} style={styles.orderCard}>
              <Shimmer width="40%" height={16} />
              <View style={{ height: Spacing.small }} />
              <Shimmer width="80%" height={12} />
              <View style={{ height: Spacing.small }} />
              <Shimmer width="60%" height={12} />
            </CustomCard>
          ))}
        </View>
      ) : orders.length === 0 ? (
        <EmptyState image={Images.emptyBox} title="No ongoing orders" description="New orders will appear here." />
      ) : (
        <View style={{ gap: Spacing.default }}>
          {orders.slice(0, 5).map((o) => (
            <OrderMiniCard key={o.id} order={o} onPress={() => router.push(`/orders/${o.id}`)} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function StatBlock({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <View style={styles.statBlock}>
      <View style={[styles.statBar, { backgroundColor: accent }]} />
      <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function QuickAction({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.quickBtn} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.quickIconWrap}>
        <LinearGradient
          colors={[Colors.primarySofter, Colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Image source={icon} style={styles.quickIcon} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function OrderMiniCard({ order, onPress }: { order: Order; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <CustomCard style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderNumber}>#{order.order_number}</Text>
          <StatusBadge status={order.order_status} small />
        </View>
        <View style={styles.orderMetaRow}>
          <Text style={styles.orderCustomer} numberOfLines={1}>{order.customer_name}</Text>
          <Text style={styles.orderAmount}>{formatCurrency(order.total_amount)}</Text>
        </View>
        <View style={styles.orderFooter}>
          <Text style={styles.orderItems}>{order.items?.length ?? 0} items · {order.order_type}</Text>
          <Text style={styles.orderTime}>{timeAgo(order.created_at)}</Text>
        </View>
      </CustomCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background } as ViewStyle,
  content: { padding: 0, paddingBottom: 140 } as ViewStyle,
  hero: {
    paddingHorizontal: Spacing.default,
    position: 'relative',
    overflow: 'hidden',
  } as ViewStyle,
  heroBlob1: {
    position: 'absolute',
    top: -40,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.14)',
  } as ViewStyle,
  heroBlob2: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.10)',
  } as ViewStyle,
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.default } as ViewStyle,
  heroGreeting: { fontSize: FontSize.default, color: 'rgba(255,255,255,0.85)', fontWeight: FontWeight.medium as any, letterSpacing: 0.2 } as any,
  heroName: { fontSize: FontSize.display, fontWeight: FontWeight.black as any, color: '#FFFFFF', letterSpacing: -0.6, marginTop: 2 } as any,
  bellBtn: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  } as ViewStyle,
  bell: { width: 22, height: 22, tintColor: '#FFFFFF' } as any,
  dot: { position: 'absolute', top: 12, right: 14, width: 9, height: 9, borderRadius: 4.5, backgroundColor: Colors.warning, borderWidth: 2, borderColor: '#FFFFFF' } as ViewStyle,
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    padding: Spacing.default,
    borderRadius: Radius.medium,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backdropFilter: 'blur(10px)',
  } as ViewStyle,
  statusPulse: { width: 12, height: 12, borderRadius: 6 } as ViewStyle,
  statusPulseOn: { backgroundColor: '#4ADE80', shadowColor: '#4ADE80', shadowOpacity: 0.6, shadowRadius: 8, elevation: 4 } as ViewStyle,
  statusPulseOff: { backgroundColor: '#94A3B8' } as ViewStyle,
  storeStatus: { fontSize: FontSize.default, fontWeight: FontWeight.bold as any, color: '#FFFFFF' } as any,
  storeSub: { fontSize: FontSize.extraSmall, color: 'rgba(255,255,255,0.78)', marginTop: 2 } as any,
  toggle: { paddingHorizontal: Spacing.large, paddingVertical: Spacing.small, borderRadius: Radius.default } as ViewStyle,
  toggleOn: { backgroundColor: '#FFFFFF' } as ViewStyle,
  toggleOff: { backgroundColor: 'rgba(255,255,255,0.2)' } as ViewStyle,
  toggleText: { fontSize: FontSize.small, fontWeight: FontWeight.bold as any } as any,
  toggleTextOn: { color: Colors.primaryDark } as any,
  toggleTextOff: { color: '#FFFFFF' } as any,
  analyticsOuter: { paddingHorizontal: Spacing.default, marginTop: -Spacing.extraLarge } as ViewStyle,
  analyticsCard: { marginBottom: Spacing.large } as ViewStyle,
  analyticsHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.small, marginBottom: Spacing.default } as ViewStyle,
  analyticsIconWrap: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' } as ViewStyle,
  analyticsIcon: { width: 18, height: 18, tintColor: '#FFFFFF' } as any,
  analyticsTitle: { fontSize: FontSize.default, fontWeight: FontWeight.bold as any, color: Colors.textPrimary, letterSpacing: -0.1 } as any,
  analyticsRow: { flexDirection: 'row', gap: Spacing.small } as ViewStyle,
  statBlock: { flex: 1, paddingVertical: Spacing.small } as ViewStyle,
  statBar: { width: 28, height: 4, borderRadius: 2, marginBottom: Spacing.small } as ViewStyle,
  statValue: { fontSize: FontSize.medium, fontWeight: FontWeight.bold as any, color: Colors.textPrimary, letterSpacing: -0.2 } as any,
  statLabel: { fontSize: FontSize.extraSmall, color: Colors.textSecondary, marginTop: 2 } as any,
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.large, paddingHorizontal: Spacing.default, gap: Spacing.small } as ViewStyle,
  quickBtn: { alignItems: 'center', flex: 1 } as ViewStyle,
  quickIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  } as ViewStyle,
  quickIcon: { width: 26, height: 26 } as any,
  quickLabel: { fontSize: FontSize.extraSmall, color: Colors.textSecondary, marginTop: Spacing.small, textAlign: 'center', fontWeight: FontWeight.medium as any } as any,
  adsCard: {
    marginHorizontal: Spacing.default,
    padding: Spacing.large,
    borderRadius: Radius.extraLarge,
    marginBottom: Spacing.large,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: Colors.sunsetEnd,
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  } as ViewStyle,
  adsBlob: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.18)',
  } as ViewStyle,
  adsHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.default } as ViewStyle,
  adsIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  adsIcon: { width: 26, height: 26, tintColor: '#FFFFFF' } as any,
  adsTitle: { fontSize: FontSize.medium, fontWeight: FontWeight.bold as any, color: '#FFFFFF', letterSpacing: -0.2 } as any,
  adsSubtitle: { fontSize: FontSize.extraSmall, color: 'rgba(255,255,255,0.9)', marginTop: 2, lineHeight: 16 } as any,
  adsCta: {
    marginTop: Spacing.default,
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.large,
    paddingVertical: Spacing.small,
    borderRadius: Radius.circular,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.small,
  } as ViewStyle,
  adsCtaText: { color: Colors.sunsetEnd, fontSize: FontSize.small, fontWeight: FontWeight.bold as any } as any,
  adsCtaArrow: { color: Colors.sunsetEnd, fontSize: FontSize.medium, fontWeight: FontWeight.bold as any } as any,
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.default, marginTop: Spacing.small, paddingHorizontal: Spacing.default } as ViewStyle,
  sectionTitle: { fontSize: FontSize.extraLarge, fontWeight: FontWeight.bold as any, color: Colors.textPrimary, letterSpacing: -0.3 } as any,
  seeAll: { fontSize: FontSize.small, color: Colors.primary, fontWeight: FontWeight.bold as any } as any,
  orderCard: { marginBottom: 0 } as ViewStyle,
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.small } as ViewStyle,
  orderNumber: { fontSize: FontSize.default, fontWeight: FontWeight.bold as any, color: Colors.textPrimary, letterSpacing: -0.1 } as any,
  orderMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.small } as ViewStyle,
  orderCustomer: { fontSize: FontSize.small, color: Colors.textSecondary, flex: 1 } as any,
  orderAmount: { fontSize: FontSize.default, fontWeight: FontWeight.bold as any, color: Colors.success } as any,
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' } as ViewStyle,
  orderItems: { fontSize: FontSize.extraSmall, color: Colors.textMuted } as any,
  orderTime: { fontSize: FontSize.extraSmall, color: Colors.textMuted } as any,
});
