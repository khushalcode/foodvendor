import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Images } from '@/constants/images';
import { useAuth } from '@/hooks/useAuth';
import { categoriesApi } from '@/services/api';
import type { Category } from '@/types';
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
  name: string;
  description: string;
  editingId: string | null;
}

export default function CategoriesScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { store } = useAuth();
  const snack = useSnackbar();
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({ name: '', description: '', editingId: null });

  const load = useCallback(async () => {
    if (!store) return;
    try {
      const list = await categoriesApi.list(store.id);
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
    setForm({ name: '', description: '', editingId: null });
    setSheetOpen(true);
  };

  const openEdit = (c: Category) => {
    setForm({ name: c.name, description: c.description ?? '', editingId: c.id });
    setSheetOpen(true);
  };

  const onSave = async () => {
    if (!store) return;
    if (!form.name.trim()) {
      return snack.showCustomSnackBar('Name is required', true);
    }
    setSaving(true);
    try {
      if (form.editingId) {
        await categoriesApi.update(form.editingId, {
          name: form.name.trim(),
          description: form.description.trim() || null,
        });
        snack.showCustomSnackBar('Category updated', false);
      } else {
        await categoriesApi.create({
          store_id: store.id,
          name: form.name.trim(),
          description: form.description.trim() || null,
          image_url: null,
          is_active: true,
          priority: items.length,
        });
        snack.showCustomSnackBar('Category created', false);
      }
      setSheetOpen(false);
      load();
    } catch (err: any) {
      snack.showCustomSnackBar(err?.message ?? 'Failed', true);
    } finally {
      setSaving(false);
    }
  };

  const onToggle = async (c: Category) => {
    try {
      await categoriesApi.update(c.id, { is_active: !c.is_active });
      snack.showCustomSnackBar(`Category ${!c.is_active ? 'activated' : 'deactivated'}`, false);
      load();
    } catch (err: any) {
      snack.showCustomSnackBar(err?.message ?? 'Failed', true);
    }
  };

  const onDelete = async (c: Category) => {
    try {
      await categoriesApi.remove(c.id);
      snack.showCustomSnackBar('Category deleted', false);
      load();
    } catch (err: any) {
      snack.showCustomSnackBar(err?.message ?? 'Failed', true);
    }
  };

  return (
    <View style={styles.container}>
      <CustomAppBar title={t('categories')} />
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
              <View style={styles.row}>
                <View style={styles.iconWrap}>
                  <SmartImage
                    source={item.image_url}
                    style={styles.icon}
                    fallbackIcon="grid-outline"
                    fallbackLabel=""
                    fallbackVariant="mint"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                  {item.description ? (
                    <Text style={styles.desc} numberOfLines={1}>{item.description}</Text>
                  ) : null}
                  <View style={styles.metaRow}>
                    <StatusBadge status={item.is_active ? 'active' : 'inactive'} small />
                    <Text style={styles.priority}>Priority {item.priority}</Text>
                  </View>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => onToggle(item)} style={styles.actionBtn}>
                    <Text style={styles.toggleText}>{item.is_active ? 'Disable' : 'Enable'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onDelete(item)} style={styles.actionBtn}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </CustomCard>
          )}
          ListEmptyComponent={
            loading ? (
              <View style={{ gap: Spacing.default }}>
                {[1, 2, 3].map((i) => (
                  <CustomCard key={i}>
                    <View style={{ flexDirection: 'row', gap: Spacing.default, alignItems: 'center' }}>
                      <Shimmer width={44} height={44} radius={8} />
                      <View style={{ flex: 1, gap: 6 }}>
                        <Shimmer width="60%" height={16} />
                        <Shimmer width="80%" height={12} />
                      </View>
                    </View>
                  </CustomCard>
                ))}
              </View>
            ) : (
              <EmptyState
                image={Images.categories}
                title="No categories"
                description="Add categories to organize your products."
                ctaLabel="Add Category"
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
        <Text style={styles.sheetTitle}>{form.editingId ? 'Edit Category' : 'New Category'}</Text>
        <CustomTextField
          label="Name"
          placeholder="e.g. Beverages"
          value={form.name}
          onChangeText={(v) => setForm({ ...form, name: v })}
          required
        />
        <CustomTextField
          label="Description"
          placeholder="Optional short description"
          value={form.description}
          onChangeText={(v) => setForm({ ...form, description: v })}
          multiline
          numberOfLines={3}
        />
        <CustomButton label="Save" onPress={onSave} loading={saving} style={{ marginTop: Spacing.default }} />
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
  iconWrap: { width: 44, height: 44, borderRadius: Radius.default, backgroundColor: Colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' } as ViewStyle,
  icon: { width: 24, height: 24 } as any,
  name: { fontSize: FontSize.default, fontWeight: FontWeight.bold as any, color: Colors.textPrimary } as any,
  desc: { fontSize: FontSize.extraSmall, color: Colors.textSecondary, marginTop: 2 } as any,
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.small, marginTop: 6 } as ViewStyle,
  priority: { fontSize: FontSize.extraSmall, color: Colors.textMuted } as any,
  actions: { flexDirection: 'row', gap: Spacing.small } as ViewStyle,
  actionBtn: { paddingVertical: 4 } as ViewStyle,
  toggleText: { fontSize: FontSize.extraSmall, color: Colors.primary, fontWeight: FontWeight.bold as any } as any,
  editText: { fontSize: FontSize.extraSmall, color: Colors.textSecondary, fontWeight: FontWeight.bold as any } as any,
  deleteText: { fontSize: FontSize.extraSmall, color: Colors.danger, fontWeight: FontWeight.bold as any } as any,
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: Colors.primary, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } } as ViewStyle,
  fabPlus: { color: '#FFFFFF', fontSize: 28, fontWeight: FontWeight.bold as any } as any,
  sheetTitle: { fontSize: FontSize.large, fontWeight: FontWeight.bold as any, color: Colors.textPrimary, marginBottom: Spacing.default } as any,
});
