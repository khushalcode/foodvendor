import React, { useCallback, useEffect, useState } from 'react';
import {
  Image as RNImage,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Images } from '@/constants/images';
import { useAuth } from '@/hooks/useAuth';
import { categoriesApi, productsApi, storageApi } from '@/services/api';
import type { Category } from '@/types';
import { CustomAppBar } from '@/components/ui/custom-app-bar';
import { CustomCard } from '@/components/ui/custom-card';
import { CustomButton } from '@/components/ui/custom-button';
import { CustomTextField } from '@/components/ui/custom-text-field';
import { CustomBottomSheet } from '@/components/ui/custom-bottom-sheet';
import { Shimmer } from '@/components/ui/shimmer';
import { useSnackbar } from '@/components/ui/custom-snackbar';

interface FormState {
  name: string;
  description: string;
  price: string;
  discount_price: string;
  stock: string;
  is_veg: boolean;
  is_available: boolean;
}

export default function AddProductScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { store } = useAuth();
  const snack = useSnackbar();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    stock: '',
    is_veg: true,
    is_available: true,
  });

  const loadCategories = useCallback(async () => {
    if (!store) return;
    try {
      const list = await categoriesApi.list(store.id);
      setCategories(list);
    } catch {
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, [store]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const onPickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        snack.showCustomSnackBar('Permission required to access photos', true);
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!res.canceled && res.assets?.length > 0) {
        setImageUri(res.assets[0].uri);
      }
    } catch (err: any) {
      snack.showCustomSnackBar(err?.message ?? 'Failed to pick image', true);
    }
  };

  const onSave = async () => {
    if (!store) return;
    if (!form.name.trim()) return snack.showCustomSnackBar('Name is required', true);
    const price = Number(form.price);
    if (Number.isNaN(price) || price <= 0) return snack.showCustomSnackBar('Valid price required', true);
    const stockNum = Number(form.stock || 0);
    if (Number.isNaN(stockNum)) return snack.showCustomSnackBar('Invalid stock', true);
    const discountPrice = form.discount_price ? Number(form.discount_price) : null;
    if (discountPrice != null && (Number.isNaN(discountPrice) || discountPrice >= price)) {
      return snack.showCustomSnackBar('Discount must be less than price', true);
    }

    setSaving(true);
    try {
      let imageUrl: string | null = null;
      if (imageUri) {
        // Try uploading to the products bucket; if storage fails, fall back to local URI.
        try {
          const ext = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
          const path = `${store.id}/${Date.now()}.${ext}`;
          const fetchRes = await fetch(imageUri);
          const blob = await fetchRes.blob();
          imageUrl = await storageApi.upload('products', path, blob);
        } catch (uploadErr: any) {
          imageUrl = imageUri;
        }
      }
      await productsApi.create({
        store_id: store.id,
        category_id: selectedCategory?.id ?? null,
        name: form.name.trim(),
        description: form.description.trim() || null,
        image_url: imageUrl,
        price,
        discount_price: discountPrice,
        unit: null,
        stock: stockNum,
        is_available: form.is_available,
        is_veg: form.is_veg,
        rating: 0,
        total_ratings: 0,
      });
      snack.showCustomSnackBar('Product created', false);
      router.back();
    } catch (err: any) {
      snack.showCustomSnackBar(err?.message ?? 'Failed', true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <CustomAppBar title={t('add_product')} />
      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image picker */}
          <TouchableOpacity style={styles.imagePicker} onPress={onPickImage} activeOpacity={0.85}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} contentFit="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <RNImage source={Images.uploadIcon} style={styles.uploadIcon} />
                <Text style={styles.imageHint}>Upload product image</Text>
              </View>
            )}
          </TouchableOpacity>

          <CustomCard>
            <CustomTextField
              label="Name"
              placeholder="Margherita Pizza"
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
              required
            />
            <CustomTextField
              label="Description"
              placeholder="Classic pizza with tomato & cheese"
              value={form.description}
              onChangeText={(v) => setForm({ ...form, description: v })}
              multiline
              numberOfLines={3}
            />
            <View style={styles.row2}>
              <View style={{ flex: 1, marginRight: Spacing.small }}>
                <CustomTextField
                  label="Price ($)"
                  placeholder="12.99"
                  keyboardType="number-pad"
                  value={form.price}
                  onChangeText={(v) => setForm({ ...form, price: v })}
                  required
                />
              </View>
              <View style={{ flex: 1 }}>
                <CustomTextField
                  label="Discount ($)"
                  placeholder="9.99"
                  keyboardType="number-pad"
                  value={form.discount_price}
                  onChangeText={(v) => setForm({ ...form, discount_price: v })}
                />
              </View>
            </View>
            <View style={styles.row2}>
              <View style={{ flex: 1, marginRight: Spacing.small }}>
                <CustomTextField
                  label="Stock"
                  placeholder="50"
                  keyboardType="number-pad"
                  value={form.stock}
                  onChangeText={(v) => setForm({ ...form, stock: v })}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pickerLabel}>Category</Text>
                <TouchableOpacity style={styles.pickerField} onPress={() => setPickerOpen(true)}>
                  <Text
                    style={[styles.pickerValue, !selectedCategory && styles.pickerPlaceholder]}
                    numberOfLines={1}
                  >
                    {selectedCategory ? selectedCategory.name : 'Select category'}
                  </Text>
                  <Text style={styles.chevron}>▾</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Vegetarian</Text>
              <Switch
                value={form.is_veg}
                onValueChange={(v) => setForm({ ...form, is_veg: v })}
                trackColor={{ false: Colors.surfaceAlt, true: Colors.success }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Available</Text>
              <Switch
                value={form.is_available}
                onValueChange={(v) => setForm({ ...form, is_available: v })}
                trackColor={{ false: Colors.surfaceAlt, true: Colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </CustomCard>

          <CustomButton label="Save Product" onPress={onSave} loading={saving} style={{ marginTop: Spacing.default }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomBottomSheet visible={pickerOpen} onClose={() => setPickerOpen(false)} height="60%">
        <Text style={styles.sheetTitle}>Select Category</Text>
        {categoriesLoading ? (
          <View style={{ gap: Spacing.small }}>
            {[1, 2, 3].map((i) => (
              <Shimmer key={i} width="60%" height={18} />
            ))}
          </View>
        ) : categories.length === 0 ? (
          <Text style={styles.emptyText}>No categories found. Create one first.</Text>
        ) : (
          categories.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.categoryItem, selectedCategory?.id === c.id && styles.categoryItemSelected]}
              onPress={() => {
                setSelectedCategory(c);
                setPickerOpen(false);
              }}
            >
              <Text style={styles.categoryItemText}>{c.name}</Text>
              {selectedCategory?.id === c.id ? (
                <Text style={styles.checkMark}>✓</Text>
              ) : null}
            </TouchableOpacity>
          ))
        )}
      </CustomBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background } as ViewStyle,
  body: { flex: 1 } as ViewStyle,
  scroll: { padding: Spacing.default } as any,
  imagePicker: { alignSelf: 'center', width: 168, height: 168, borderRadius: Radius.extraLarge, marginBottom: Spacing.default, overflow: 'hidden', shadowColor: Colors.primary, shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 4 } as ViewStyle,
  imagePreview: { width: '100%', height: '100%' } as any,
  imagePlaceholder: { width: '100%', height: '100%', backgroundColor: Colors.primarySofter, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.borderPrimary, borderStyle: 'dashed', borderRadius: Radius.extraLarge, gap: Spacing.small } as ViewStyle,
  uploadIcon: { width: 36, height: 36, tintColor: Colors.primary } as any,
  imageHint: { fontSize: FontSize.small, color: Colors.primary, fontWeight: FontWeight.semiBold as any } as any,
  row2: { flexDirection: 'row', alignItems: 'flex-end' } as ViewStyle,
  pickerLabel: { fontSize: FontSize.small, color: Colors.textSecondary, marginBottom: Spacing.extraSmall, fontWeight: FontWeight.medium as any } as any,
  pickerField: { height: 54, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.default, paddingHorizontal: Spacing.default, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.surfaceAlt } as ViewStyle,
  pickerValue: { flex: 1, fontSize: FontSize.default, color: Colors.textPrimary } as any,
  pickerPlaceholder: { color: Colors.textMuted } as any,
  chevron: { fontSize: FontSize.small, color: Colors.textMuted } as any,
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.small, marginTop: Spacing.small, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border } as ViewStyle,
  switchLabel: { fontSize: FontSize.default, color: Colors.textPrimary, fontWeight: FontWeight.medium as any } as any,
  sheetTitle: { fontSize: FontSize.large, fontWeight: FontWeight.bold as any, color: Colors.textPrimary, marginBottom: Spacing.default } as any,
  categoryItem: { paddingVertical: Spacing.default, paddingHorizontal: Spacing.default, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' } as ViewStyle,
  categoryItemSelected: { backgroundColor: Colors.primaryLight, borderRadius: Radius.default } as ViewStyle,
  categoryItemText: { fontSize: FontSize.default, color: Colors.textPrimary } as any,
  checkMark: { color: Colors.primary, fontSize: FontSize.default, fontWeight: FontWeight.bold as any } as any,
  emptyText: { fontSize: FontSize.small, color: Colors.textSecondary, textAlign: 'center', padding: Spacing.large } as any,
});
