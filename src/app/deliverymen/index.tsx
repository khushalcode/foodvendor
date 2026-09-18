import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image as RNImage,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Images } from '@/constants/images';
import { useAuth } from '@/hooks/useAuth';
import { deliveryMenApi } from '@/services/api';
import type { DeliveryMan } from '@/types';
import { CustomAppBar } from '@/components/ui/custom-app-bar';
import { CustomCard } from '@/components/ui/custom-card';
import { CustomButton } from '@/components/ui/custom-button';
import { CustomTextField } from '@/components/ui/custom-text-field';
import { CustomBottomSheet } from '@/components/ui/custom-bottom-sheet';
import { RatingBar } from '@/components/ui/rating-bar';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Shimmer } from '@/components/ui/shimmer';
import { useSnackbar } from '@/components/ui/custom-snackbar';
import { isValidEmail } from '@/utils/formatters';

const AVATAR_COLORS = ['#3B82F6', '#2BA672', '#FFB300', '#9333EA', '#0891B2', '#FF6D6D'];
function colorFor(name: string): string {
  const code = name?.charCodeAt(0) ?? 0;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

interface FormState {
  full_name: string;
  email: string;
  phone: string;
}

export default function DeliveryMenScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { store } = useAuth();
  const snack = useSnackbar();
  const [items, setItems] = useState<DeliveryMan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({ full_name: '', email: '', phone: '' });

  const load = useCallback(async () => {
    if (!store) return;
    try {
      const list = await deliveryMenApi.list(store.id);
      setItems(list);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [store]);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setForm({ full_name: '', email: '', phone: '' });
    setSheetOpen(true);
  };

  const onSave = async () => {
    if (!store) return;
    if (!form.full_name.trim()) return snack.showCustomSnackBar('Name is required', true);
    if (!isValidEmail(form.email)) return snack.showCustomSnackBar('Invalid email', true);
    if (!form.phone.trim()) return snack.showCustomSnackBar('Phone is required', true);
    setSaving(true);
    try {
      await deliveryMenApi.create({
        store_id: store.id,
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        image_url: null,
        is_active: true,
        total_deliveries: 0,
        rating: 0,
      });
      snack.showCustomSnackBar('Delivery man added', false);
      setSheetOpen(false);
      load();
    } catch (err: any) {
      snack.showCustomSnackBar(err?.message ?? 'Failed', true);
    } finally {
      setSaving(false);
    }
  };

  const onTapRow = () => {
    snack.showCustomSnackBar('Details coming soon', true);
  };

  const renderItem = ({ item }: { item: DeliveryMan }) => {
    const initial = item.full_name?.charAt(0)?.toUpperCase() ?? '?';
    return (
      <TouchableOpacity onPress={onTapRow} activeOpacity={0.85}>
        <CustomCard style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.avatar, { backgroundColor: colorFor(item.full_name) }]}>
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.avatarImg} contentFit="cover" />
              ) : (
                <Text style={styles.avatarText}>{initial}</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.headerRow}>
                <Text style={styles.name} numberOfLines={1}>{item.full_name}</Text>
                <StatusBadge status={item.is_active ? 'active' : 'inactive'} small />
              </View>
              <Text style={styles.phone} numberOfLines={1}>{item.phone}</Text>
              <View style={styles.metaRow}>
                <RatingBar value={item.rating} size="small" />
                <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.deliveries}>{item.total_deliveries} deliveries</Text>
              </View>
            </View>
          </View>
        </CustomCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <CustomAppBar title={t('delivery_man')} />
      <View style={styles.body}>
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
          }
          ListEmptyComponent={
            loading ? (
              <View style={{ gap: Spacing.default }}>
                {[1, 2, 3].map((i) => (
                  <CustomCard key={i}>
                    <View style={{ flexDirection: 'row', gap: Spacing.default, alignItems: 'center' }}>
                      <Shimmer width={48} height={48} radius={24} />
                      <View style={{ flex: 1, gap: 6 }}>
                        <Shimmer width="50%" height={14} />
                        <Shimmer width="80%" height={12} />
                      </View>
                    </View>
                  </CustomCard>
                ))}
              </View>
            ) : (
              <EmptyState
                image={Images.deliveryMan}
                title="No delivery men"
                description="Add delivery staff to handle your orders."
                ctaLabel="Add Delivery Man"
                onCtaPress={openAdd}
              />
            )
          }
        />
      </View>

      <TouchableOpacity style={styles.fab} onPress={openAdd}>
        <Text style={styles.fabPlus}>+</Text>
      </TouchableOpacity>

      <CustomBottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} height="70%">
        <Text style={styles.sheetTitle}>Add Delivery Man</Text>
        <CustomTextField
          label="Full Name"
          placeholder="John Doe"
          value={form.full_name}
          onChangeText={(v) => setForm({ ...form, full_name: v })}
          required
        />
        <CustomTextField
          label="Email"
          placeholder="john@vendor.com"
          keyboardType="email-address"
          value={form.email}
          onChangeText={(v) => setForm({ ...form, email: v })}
          required
        />
        <CustomTextField
          label="Phone"
          placeholder="+1 555 0100"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(v) => setForm({ ...form, phone: v })}
          required
        />
        <CustomButton label="Add" onPress={onSave} loading={saving} style={{ marginTop: Spacing.default }} />
      </CustomBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background } as ViewStyle,
  body: { flex: 1 } as ViewStyle,
  list: { padding: Spacing.default, gap: Spacing.default } as any,
  card: { marginBottom: 0 } as ViewStyle,
  row: { flexDirection: 'row', gap: Spacing.default, alignItems: 'center' } as ViewStyle,
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' } as ViewStyle,
  avatarImg: { width: '100%', height: '100%' } as any,
  avatarText: { color: '#FFFFFF', fontSize: FontSize.medium, fontWeight: FontWeight.bold as any } as any,
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' } as ViewStyle,
  name: { fontSize: FontSize.default, fontWeight: FontWeight.bold as any, color: Colors.textPrimary, flex: 1, marginRight: Spacing.small } as any,
  phone: { fontSize: FontSize.small, color: Colors.textSecondary, marginTop: 2 } as any,
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 } as ViewStyle,
  ratingText: { fontSize: FontSize.extraSmall, color: Colors.textSecondary, marginLeft: 4 } as any,
  dot: { fontSize: FontSize.extraSmall, color: Colors.textMuted } as any,
  deliveries: { fontSize: FontSize.extraSmall, color: Colors.textMuted } as any,
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: Colors.primary, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } } as ViewStyle,
  fabPlus: { color: '#FFFFFF', fontSize: 28, fontWeight: FontWeight.bold as any } as any,
  sheetTitle: { fontSize: FontSize.large, fontWeight: FontWeight.bold as any, color: Colors.textPrimary, marginBottom: Spacing.default } as any,
});
