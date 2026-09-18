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
import { bannersApi } from '@/services/api';
import type { Banner } from '@/types';
import { CustomAppBar } from '@/components/ui/custom-app-bar';
import { CustomCard } from '@/components/ui/custom-card';
import { CustomButton } from '@/components/ui/custom-button';
import { CustomTextField } from '@/components/ui/custom-text-field';
import { CustomBottomSheet } from '@/components/ui/custom-bottom-sheet';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Shimmer } from '@/components/ui/shimmer';
import { SmartImage } from '@/components/ui/smart-image';
import { useSnackbar } from '@/components/ui/custom-snackbar';

interface FormState {
  title: string;
  priority: string;
}

export default function BannersScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { store } = useAuth();
  const snack = useSnackbar();
  const [items, setItems] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({ title: '', priority: '0' });

  const load = useCallback(async () => {
    if (!store) return;
    try {
      const list = await bannersApi.list(store.id);
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
    setForm({ title: '', priority: '0' });
    setSheetOpen(true);
  };

  const onSave = async () => {
    if (!store) return;
    if (!form.title.trim()) {
      return snack.showCustomSnackBar('Title is required', true);
    }
    const priority = Number(form.priority || 0);
    if (Number.isNaN(priority)) {
      return snack.showCustomSnackBar('Invalid priority', true);
    }
    setSaving(true);
    try {
      // Image picker kept simple — placeholder URL until image upload UX is wired.
      await bannersApi.create({
        store_id: store.id,
        title: form.title.trim(),
        image_url: null,
        url: null,
        priority,
        is_active: true,
      });
      snack.showCustomSnackBar('Banner created', false);
      setSheetOpen(false);
      load();
    } catch (err: any) {
      snack.showCustomSnackBar(err?.message ?? 'Failed', true);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (b: Banner) => {
    try {
      await bannersApi.remove(b.id);
      snack.showCustomSnackBar('Banner deleted', false);
      load();
    } catch (err: any) {
      snack.showCustomSnackBar(err?.message ?? 'Failed', true);
    }
  };

  return (
    <View style={styles.container}>
      <CustomAppBar title={t('banner')} />
      <View style={styles.body}>
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
          }
          renderItem={({ item }) => (
            <CustomCard style={styles.card}>
              <View style={styles.previewWrap}>
                <SmartImage
                  source={item.image_url}
                  style={styles.preview}
                  fallbackIcon="image-outline"
                  fallbackLabel="Banner"
                  fallbackVariant="ocean"
                />
                <View style={styles.priorityBadge}>
                  <Text style={styles.priorityText}>#{item.priority}</Text>
                </View>
              </View>
              <View style={styles.footer}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                  <View style={styles.metaRow}>
                    <StatusBadge status={item.is_active ? 'active' : 'inactive'} small />
                  </View>
                </View>
                <TouchableOpacity onPress={() => onDelete(item)} style={styles.deleteBtn}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </CustomCard>
          )}
          ListEmptyComponent={
            loading ? (
              <View style={{ gap: Spacing.default }}>
                {[1, 2].map((i) => (
                  <CustomCard key={i}>
                    <Shimmer width="100%" height={120} radius={8} />
                    <View style={{ height: Spacing.small }} />
                    <Shimmer width="60%" height={14} />
                  </CustomCard>
                ))}
              </View>
            ) : (
              <EmptyState
                image={Images.bannerIcon}
                title="No banners"
                description="Add promotional banners to highlight deals."
                ctaLabel="Add Banner"
                onCtaPress={openAdd}
              />
            )
          }
        />
      </View>

      <TouchableOpacity style={styles.fab} onPress={openAdd}>
        <Text style={styles.fabPlus}>+</Text>
      </TouchableOpacity>

      <CustomBottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} height="60%">
        <Text style={styles.sheetTitle}>New Banner</Text>
        <CustomTextField
          label="Title"
          placeholder="Summer Sale"
          value={form.title}
          onChangeText={(v) => setForm({ ...form, title: v })}
          required
        />
        <CustomTextField
          label="Priority"
          placeholder="0"
          keyboardType="number-pad"
          value={form.priority}
          onChangeText={(v) => setForm({ ...form, priority: v })}
        />
        <CustomButton label="Create" onPress={onSave} loading={saving} style={{ marginTop: Spacing.default }} />
      </CustomBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background } as ViewStyle,
  body: { flex: 1 } as ViewStyle,
  list: { padding: Spacing.default, gap: Spacing.default } as any,
  card: { marginBottom: 0, padding: 0, overflow: 'hidden' } as ViewStyle,
  previewWrap: { width: '100%', height: 140, backgroundColor: Colors.surfaceAlt, position: 'relative' } as ViewStyle,
  preview: { width: '100%', height: '100%' } as any,
  placeholderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
  placeholderIcon: { width: 40, height: 40, tintColor: Colors.textMuted } as any,
  priorityBadge: { position: 'absolute', top: Spacing.small, right: Spacing.small, backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: Spacing.small, paddingVertical: 3, borderRadius: Radius.small } as ViewStyle,
  priorityText: { color: '#FFFFFF', fontSize: FontSize.extraSmall, fontWeight: FontWeight.bold as any } as any,
  footer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.default, padding: Spacing.default } as ViewStyle,
  title: { fontSize: FontSize.default, fontWeight: FontWeight.bold as any, color: Colors.textPrimary, marginBottom: 6 } as any,
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.small } as ViewStyle,
  deleteBtn: { paddingVertical: 4 } as ViewStyle,
  deleteText: { fontSize: FontSize.extraSmall, color: Colors.danger, fontWeight: FontWeight.bold as any } as any,
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: Colors.primary, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } } as ViewStyle,
  fabPlus: { color: '#FFFFFF', fontSize: 28, fontWeight: FontWeight.bold as any } as any,
  sheetTitle: { fontSize: FontSize.large, fontWeight: FontWeight.bold as any, color: Colors.textPrimary, marginBottom: Spacing.default } as any,
});
