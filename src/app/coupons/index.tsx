import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Images } from '@/constants/images';
import { useAuth } from '@/hooks/useAuth';
import { couponsApi } from '@/services/api';
import type { Coupon } from '@/types';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { CustomAppBar } from '@/components/ui/custom-app-bar';
import { CustomCard } from '@/components/ui/custom-card';
import { CustomButton } from '@/components/ui/custom-button';
import { CustomTextField } from '@/components/ui/custom-text-field';
import { CustomBottomSheet } from '@/components/ui/custom-bottom-sheet';
import { useSnackbar } from '@/components/ui/custom-snackbar';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Shimmer } from '@/components/ui/shimmer';

export default function CouponsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { store } = useAuth();
  const snack = useSnackbar();
  const [items, setItems] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState({ code: '', title: '', discount_amount: '', min_purchase: '' });

  const load = useCallback(async () => {
    if (!store) return;
    try {
      const list = await couponsApi.list(store.id);
      setItems(list);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [store]);

  useEffect(() => { load(); }, [load]);

  const onCreate = async () => {
    if (!store) return;
    if (!form.code || !form.title || !form.discount_amount) {
      return snack.showCustomSnackBar('Fill all required fields', true);
    }
    try {
      await couponsApi.create({
        store_id: store.id,
        code: form.code.toUpperCase().trim(),
        title: form.title,
        discount_type: 'percentage',
        discount_amount: Number(form.discount_amount),
        min_purchase: Number(form.min_purchase || 0),
        max_discount: null,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        usage_limit: null,
        used_count: 0,
        is_active: true,
      });
      snack.showCustomSnackBar('Coupon created', false);
      setSheetOpen(false);
      setForm({ code: '', title: '', discount_amount: '', min_purchase: '' });
      load();
    } catch (err: any) {
      snack.showCustomSnackBar(err?.message ?? 'Failed', true);
    }
  };

  const onToggle = async (c: Coupon) => {
    try {
      await couponsApi.update(c.id, { is_active: !c.is_active });
      snack.showCustomSnackBar(`Coupon ${!c.is_active ? 'activated' : 'deactivated'}`, false);
      load();
    } catch (err: any) {
      snack.showCustomSnackBar(err?.message ?? 'Failed', true);
    }
  };

  const onDelete = async (c: Coupon) => {
    try {
      await couponsApi.remove(c.id);
      snack.showCustomSnackBar('Coupon deleted', false);
      load();
    } catch (err: any) {
      snack.showCustomSnackBar(err?.message ?? 'Failed', true);
    }
  };

  return (
    <View style={styles.container}>
      <CustomAppBar title={t('coupons')} />
      <View style={styles.body}>
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 32 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          renderItem={({ item }) => (
            <CustomCard style={styles.couponCard}>
              <View style={styles.couponHeader}>
                <View>
                  <Text style={styles.couponTitle}>{item.title}</Text>
                  <Text style={styles.couponCode}>{item.code}</Text>
                </View>
                <StatusBadge status={item.is_active ? 'active' : 'inactive'} small />
              </View>
              <View style={styles.couponMeta}>
                <Text style={styles.metaText}>
                  {item.discount_type === 'percentage' ? `${item.discount_amount}% OFF` : `${formatCurrency(item.discount_amount)} OFF`}
                </Text>
                <Text style={styles.metaText}>Min: {formatCurrency(item.min_purchase)}</Text>
              </View>
              <View style={styles.couponFooter}>
                <Text style={styles.dateText}>
                  {formatDate(item.start_date)} - {formatDate(item.end_date)}
                </Text>
                <View style={{ flexDirection: 'row', gap: Spacing.small }}>
                  <TouchableOpacity onPress={() => onToggle(item)}>
                    <Text style={styles.toggleBtn}>{item.is_active ? 'Disable' : 'Enable'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onDelete(item)}>
                    <Text style={styles.deleteBtn}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </CustomCard>
          )}
          ListEmptyComponent={
            loading ? (
              <View style={{ gap: Spacing.default }}>
                {[1, 2].map((i) => (
                  <CustomCard key={i}>
                    <Shimmer width="40%" height={16} />
                    <View style={{ height: Spacing.small }} />
                    <Shimmer width="80%" height={12} />
                  </CustomCard>
                ))}
              </View>
            ) : (
              <EmptyState
                image={Images.coupon}
                title="No coupons yet"
                description="Create your first coupon to attract customers."
                ctaLabel="Create Coupon"
                onCtaPress={() => setSheetOpen(true)}
              />
            )
          }
        />
      </View>

      <TouchableOpacity style={styles.fab} onPress={() => setSheetOpen(true)}>
        <Text style={styles.fabPlus}>+</Text>
      </TouchableOpacity>

      <CustomBottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} height="80%">
        <Text style={styles.sheetTitle}>New Coupon</Text>
        <CustomTextField label="Code" placeholder="SUMMER25" value={form.code} onChangeText={(v) => setForm({ ...form, code: v })} required />
        <CustomTextField label="Title" placeholder="Summer Sale 25% OFF" value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} required />
        <CustomTextField label="Discount (%)" placeholder="25" keyboardType="number-pad" value={form.discount_amount} onChangeText={(v) => setForm({ ...form, discount_amount: v })} required />
        <CustomTextField label="Min Purchase ($)" placeholder="50" keyboardType="number-pad" value={form.min_purchase} onChangeText={(v) => setForm({ ...form, min_purchase: v })} />
        <CustomButton label="Create" onPress={onCreate} style={{ marginTop: Spacing.large }} />
      </CustomBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background } as ViewStyle,
  body: { flex: 1 } as ViewStyle,
  list: { padding: Spacing.default, gap: Spacing.default } as any,
  couponCard: { marginBottom: 0 } as ViewStyle,
  couponHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.default } as ViewStyle,
  couponTitle: { fontSize: FontSize.medium, fontWeight: FontWeight.bold as any, color: Colors.textPrimary } as any,
  couponCode: { fontSize: FontSize.small, color: Colors.primary, fontWeight: FontWeight.bold as any, marginTop: 4, letterSpacing: 1 } as any,
  couponMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.default } as ViewStyle,
  metaText: { fontSize: FontSize.small, color: Colors.textSecondary } as any,
  couponFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Spacing.default, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border } as ViewStyle,
  dateText: { fontSize: FontSize.extraSmall, color: Colors.textMuted } as any,
  toggleBtn: { fontSize: FontSize.small, color: Colors.primary, fontWeight: FontWeight.bold as any } as any,
  deleteBtn: { fontSize: FontSize.small, color: Colors.danger, fontWeight: FontWeight.bold as any } as any,
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: Colors.primary, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } } as ViewStyle,
  fabPlus: { color: '#FFFFFF', fontSize: 28, fontWeight: FontWeight.bold as any } as any,
  sheetTitle: { fontSize: FontSize.large, fontWeight: FontWeight.bold as any, color: Colors.textPrimary, marginBottom: Spacing.default } as any,
});
