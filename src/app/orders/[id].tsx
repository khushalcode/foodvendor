import React, { useCallback, useEffect, useState } from 'react';
import {
  Image as RNImage,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Images } from '@/constants/images';
import { ordersApi } from '@/services/api';
import type { Order, OrderStatus } from '@/types';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { CustomAppBar } from '@/components/ui/custom-app-bar';
import { CustomCard } from '@/components/ui/custom-card';
import { CustomButton } from '@/components/ui/custom-button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { StatusBadge } from '@/components/ui/status-badge';
import { Shimmer } from '@/components/ui/shimmer';
import { SmartImage } from '@/components/ui/smart-image';
import { useSnackbar } from '@/components/ui/custom-snackbar';

// Map an order status to the next status button label + target status.
function nextAction(status: OrderStatus): { label: string; next: OrderStatus } | null {
  switch (status) {
    case 'pending': return { label: 'Confirm Order', next: 'confirmed' };
    case 'confirmed': return { label: 'Start Processing', next: 'processing' };
    case 'processing': return { label: 'Mark Handover', next: 'handover' };
    case 'handover': return { label: 'Mark Delivered', next: 'delivered' };
    default: return null;
  }
}

export default function OrderDetailScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const snack = useSnackbar();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await ordersApi.get(id);
      setOrder(data);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const onUpdateStatus = async (status: OrderStatus) => {
    if (!order) return;
    setBusy(true);
    try {
      const updated = await ordersApi.updateStatus(order.id, status);
      setOrder(updated);
      snack.showCustomSnackBar(`Order ${status}`, false);
    } catch (err: any) {
      snack.showCustomSnackBar(err?.message ?? 'Failed', true);
    } finally {
      setBusy(false);
    }
  };

  const onConfirmCancel = async () => {
    setCancelOpen(false);
    if (!order) return;
    setBusy(true);
    try {
      const updated = await ordersApi.updateStatus(order.id, 'canceled');
      setOrder(updated);
      snack.showCustomSnackBar('Order canceled', false);
    } catch (err: any) {
      snack.showCustomSnackBar(err?.message ?? 'Failed', true);
    } finally {
      setBusy(false);
    }
  };

  if (loading || !order) {
    return (
      <View style={styles.container}>
        <CustomAppBar title={`Order #...`} right={
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        } />
        <View style={styles.body}>
          <View style={{ gap: Spacing.default, padding: Spacing.default }}>
            <Shimmer width="40%" height={20} />
            <Shimmer width="100%" height={120} radius={14} />
            <Shimmer width="100%" height={80} radius={14} />
            <Shimmer width="100%" height={60} radius={14} />
          </View>
        </View>
      </View>
    );
  }

  const action = nextAction(order.order_status);
  const isFinal = order.order_status === 'delivered' || order.order_status === 'canceled' || order.order_status === 'failed';

  return (
    <View style={styles.container}>
      <CustomAppBar
        title={`Order #${order.order_number}`}
        right={
          !isFinal && order.order_status !== 'delivered' ? (
            <TouchableOpacity onPress={() => setCancelOpen(true)} disabled={busy}>
              <Ionicons name="close-circle-outline" size={24} color={Colors.danger} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 24 }} />
          )
        }
      />
      <ScrollView
        style={styles.body}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
        }
      >
        {/* Hero gradient header card */}
        <View style={styles.heroCardOuter}>
          <LinearGradient
            colors={[Colors.heroGradientStart, Colors.heroGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroBlob} />
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.orderNoLabel}>Order</Text>
                <Text style={styles.orderNo}>#{order.order_number}</Text>
                <Text style={styles.orderDate}>{formatDateTime(order.created_at)}</Text>
              </View>
              <StatusBadge status={order.order_status} />
            </View>
            <View style={styles.tagsRow}>
              <View style={styles.tag}>
                <Ionicons name="bag-outline" size={12} color="#FFFFFF" />
                <Text style={styles.tagText}>{order.order_type.replace('_', ' ')}</Text>
              </View>
              <View style={styles.tag}>
                <Ionicons name="card-outline" size={12} color="#FFFFFF" />
                <Text style={styles.tagText}>{order.payment_method.replace('_', ' ')}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Customer info */}
        <CustomCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <View style={styles.customerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{order.customer_name?.charAt(0)?.toUpperCase() ?? '#'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.customerName} numberOfLines={1}>{order.customer_name}</Text>
              {order.customer_phone ? (
                <Text style={styles.customerMeta}>{order.customer_phone}</Text>
              ) : null}
              <View style={styles.paymentStatusRow}>
                <Text style={styles.customerMeta}>Payment: </Text>
                <StatusBadge status={order.payment_status} small />
              </View>
            </View>
          </View>
        </CustomCard>

        {/* Items list */}
        <CustomCard style={styles.sectionCard} padded={false}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Items ({order.items?.length ?? 0})</Text>
          </View>
          {(order.items ?? []).map((it) => (
            <View key={it.id} style={styles.itemRow}>
              <View style={styles.itemImgWrap}>
                <SmartImage
                  source={it.product_image_url}
                  style={styles.itemImg}
                  fallbackIcon="fast-food-outline"
                  fallbackLabel={it.product_name?.slice(0, 12) || 'Item'}
                  fallbackVariant="violet"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={2}>{it.product_name}</Text>
                <Text style={styles.itemQty}>Qty: {it.quantity} × {formatCurrency(it.price)}</Text>
                {it.addon_details && it.addon_details.length > 0 ? (
                  <Text style={styles.itemAddons} numberOfLines={2}>
                    {it.addon_details.map((a) => a.name).join(', ')}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.itemTotal}>{formatCurrency(it.price * it.quantity)}</Text>
            </View>
          ))}
        </CustomCard>

        {/* Totals */}
        <CustomCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.lineRow}>
            <Text style={styles.lineLabel}>Subtotal</Text>
            <Text style={styles.lineValue}>{formatCurrency(order.total_amount)}</Text>
          </View>
          <View style={[styles.lineRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.total_amount)}</Text>
          </View>
          <View style={styles.lineRow}>
            <Text style={styles.lineLabel}>Payment Status</Text>
            <StatusBadge status={order.payment_status} small />
          </View>
        </CustomCard>

        {/* Delivery info */}
        {order.delivery_address ? (
          <CustomCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.addressRow}>
              <View style={styles.addressIconWrap}>
                <Ionicons name="location-outline" size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.addressText}>{order.delivery_address}</Text>
            </View>
            {order.note ? (
              <View style={styles.noteRow}>
                <Ionicons name="chatbubble-outline" size={16} color={Colors.textMuted} />
                <Text style={styles.noteText}>{order.note}</Text>
              </View>
            ) : null}
          </CustomCard>
        ) : null}
      </ScrollView>

      {/* Bottom action bar */}
      {action ? (
        <View style={[styles.actionBar, { paddingBottom: insets.bottom + Spacing.small }]}>
          <CustomButton
            label={action.label}
            onPress={() => onUpdateStatus(action.next)}
            loading={busy}
            disabled={busy}
          />
        </View>
      ) : null}

      <ConfirmationDialog
        visible={cancelOpen}
        title="Cancel this order?"
        description="The customer will be notified that this order has been canceled. This action cannot be undone."
        icon="delete"
        confirmText="Cancel Order"
        cancelText="Keep"
        onConfirm={onConfirmCancel}
        onCancel={() => setCancelOpen(false)}
        loading={busy}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background } as ViewStyle,
  body: { flex: 1 } as ViewStyle,
  scroll: { padding: Spacing.default, gap: Spacing.default } as any,
  heroCardOuter: { marginBottom: 0 } as ViewStyle,
  heroCard: {
    padding: Spacing.large,
    borderRadius: Radius.extraLarge,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  } as ViewStyle,
  heroBlob: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.14)',
  } as ViewStyle,
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.default } as ViewStyle,
  orderNoLabel: { fontSize: FontSize.extraSmall, color: 'rgba(255,255,255,0.75)', fontWeight: FontWeight.semiBold as any, letterSpacing: 1, textTransform: 'uppercase' } as any,
  orderNo: { fontSize: FontSize.extraLarge, fontWeight: FontWeight.black as any, color: '#FFFFFF', letterSpacing: -0.4, marginTop: 2 } as any,
  orderDate: { fontSize: FontSize.extraSmall, color: 'rgba(255,255,255,0.85)', marginTop: 4 } as any,
  tagsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.small, flexWrap: 'wrap' } as ViewStyle,
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.small, paddingVertical: 4, borderRadius: Radius.circular, backgroundColor: 'rgba(255,255,255,0.18)' } as ViewStyle,
  tagText: { fontSize: FontSize.extraSmall, color: '#FFFFFF', fontWeight: FontWeight.semiBold as any, textTransform: 'capitalize' } as any,
  sectionCard: { marginBottom: 0 } as ViewStyle,
  sectionHeader: { paddingHorizontal: Spacing.default, paddingTop: Spacing.default, paddingBottom: Spacing.small, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border } as ViewStyle,
  sectionTitle: { fontSize: FontSize.extraSmall, fontWeight: FontWeight.bold as any, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 } as any,
  customerRow: { flexDirection: 'row', gap: Spacing.default, alignItems: 'center', marginTop: Spacing.small } as ViewStyle,
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderPrimary,
  } as ViewStyle,
  avatarText: { fontSize: FontSize.medium, fontWeight: FontWeight.bold as any, color: Colors.primaryDark } as any,
  customerName: { fontSize: FontSize.default, fontWeight: FontWeight.bold as any, color: Colors.textPrimary, letterSpacing: -0.1 } as any,
  customerMeta: { fontSize: FontSize.small, color: Colors.textSecondary, marginTop: 2, textTransform: 'capitalize' } as any,
  paymentStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 } as ViewStyle,
  itemRow: { flexDirection: 'row', gap: Spacing.default, alignItems: 'center', paddingHorizontal: Spacing.default, paddingVertical: Spacing.default, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.borderLight } as ViewStyle,
  itemImgWrap: { width: 52, height: 52, borderRadius: Radius.default, backgroundColor: Colors.surfaceAlt, overflow: 'hidden' } as ViewStyle,
  itemImg: { width: '100%', height: '100%' } as any,
  itemName: { fontSize: FontSize.default, color: Colors.textPrimary, fontWeight: FontWeight.semiBold as any } as any,
  itemQty: { fontSize: FontSize.extraSmall, color: Colors.textSecondary, marginTop: 4 } as any,
  itemAddons: { fontSize: FontSize.extraSmall, color: Colors.textMuted, marginTop: 2, fontStyle: 'italic' } as any,
  itemTotal: { fontSize: FontSize.default, fontWeight: FontWeight.bold as any, color: Colors.success } as any,
  lineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.extraSmall } as ViewStyle,
  totalRow: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border, marginTop: Spacing.small, paddingTop: Spacing.default } as ViewStyle,
  lineLabel: { fontSize: FontSize.small, color: Colors.textSecondary } as any,
  lineValue: { fontSize: FontSize.small, color: Colors.textPrimary, fontWeight: FontWeight.bold as any } as any,
  totalLabel: { fontSize: FontSize.default, color: Colors.textPrimary, fontWeight: FontWeight.bold as any } as any,
  totalValue: { fontSize: FontSize.extraLarge, color: Colors.success, fontWeight: FontWeight.bold as any, letterSpacing: -0.2 } as any,
  addressRow: { flexDirection: 'row', gap: Spacing.small, alignItems: 'flex-start', marginTop: Spacing.small } as ViewStyle,
  addressIconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
  addressText: { flex: 1, fontSize: FontSize.small, color: Colors.textPrimary, lineHeight: 20 } as any,
  noteRow: { flexDirection: 'row', gap: Spacing.small, alignItems: 'flex-start', marginTop: Spacing.default, paddingTop: Spacing.default, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border } as ViewStyle,
  noteText: { flex: 1, fontSize: FontSize.extraSmall, color: Colors.textSecondary, lineHeight: 18, fontStyle: 'italic' } as any,
  actionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: Spacing.default, paddingTop: Spacing.default, backgroundColor: Colors.card, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border, shadowColor: Colors.shadow, shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: -3 }, elevation: 8 } as ViewStyle,
});
