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
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Images } from '@/constants/images';
import { useAuth } from '@/hooks/useAuth';
import { productsApi } from '@/services/api';
import type { Product } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { CustomCard } from '@/components/ui/custom-card';
import { Shimmer } from '@/components/ui/shimmer';
import { RatingBar } from '@/components/ui/rating-bar';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { SmartImage } from '@/components/ui/smart-image';

export default function StoreScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { store } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!store) return;
    try {
      const list = await productsApi.list(store.id);
      setProducts(list);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [store]);

  useEffect(() => { load(); }, [load]);

  const renderItem = ({ item }: { item: Product }) => (
    <CustomCard style={styles.card}>
      <View style={styles.row}>
        <View style={styles.imgWrap}>
          <SmartImage
            source={item.image_url}
            style={styles.img}
            fallbackIcon="fast-food-outline"
            fallbackLabel={item.name}
            fallbackVariant="violet"
          />
          {!item.is_available && (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableText}>Unavailable</Text>
            </View>
          )}
          {item.discount_price ? (
            <View style={styles.discountTag}>
              <Text style={styles.discountText}>
                -{Math.round(((item.price - item.discount_price) / item.price) * 100)}%
              </Text>
            </View>
          ) : null}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          {item.description ? (
            <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
          ) : null}
          <View style={styles.ratingRow}>
            <RatingBar value={item.rating} size="small" />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)} ({item.total_ratings})</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatCurrency(item.discount_price ?? item.price)}</Text>
            {item.discount_price ? (
              <Text style={styles.priceStrike}>{formatCurrency(item.price)}</Text>
            ) : null}
            <View style={{ flex: 1 }} />
            <Text style={item.stock > 0 ? styles.stock : styles.stockOut}>
              {item.stock > 0 ? `Stock: ${item.stock}` : 'Out of stock'}
            </Text>
          </View>
        </View>
      </View>
    </CustomCard>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.default }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerEyebrow}>Catalog</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{store?.name ?? t('store')}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/products/add')} activeOpacity={0.85}>
          <LinearGradient
            colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons name="add" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 120 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListEmptyComponent={
          loading ? (
            <View style={{ gap: Spacing.default }}>
              {[1, 2, 3].map((i) => (
                <CustomCard key={i}>
                  <View style={{ flexDirection: 'row', gap: Spacing.default }}>
                    <Shimmer width={88} height={88} radius={18} />
                    <View style={{ flex: 1, gap: 6 }}>
                      <Shimmer width="60%" height={16} />
                      <Shimmer width="100%" height={12} />
                      <Shimmer width="40%" height={12} />
                    </View>
                  </View>
                </CustomCard>
              ))}
            </View>
          ) : (
            <EmptyState
              image={Images.emptyBox}
              title="No products yet"
              description="Add your first product to start selling."
              ctaLabel="Add Product"
              onCtaPress={() => router.push('/products/add')}
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background } as ViewStyle,
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: Spacing.default, marginBottom: Spacing.default } as ViewStyle,
  headerEyebrow: { fontSize: FontSize.small, color: Colors.textMuted, fontWeight: FontWeight.semiBold as any, letterSpacing: 1, textTransform: 'uppercase' } as any,
  headerTitle: { fontSize: FontSize.display, fontWeight: FontWeight.black as any, color: Colors.textPrimary, letterSpacing: -0.8 } as any,
  addBtn: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  } as ViewStyle,
  list: { padding: Spacing.default, gap: Spacing.default } as any,
  card: { marginBottom: 0 } as ViewStyle,
  row: { flexDirection: 'row', gap: Spacing.default } as ViewStyle,
  imgWrap: { width: 88, height: 88, borderRadius: 18, backgroundColor: Colors.surfaceAlt, position: 'relative', overflow: 'hidden' } as ViewStyle,
  img: { width: '100%', height: '100%' } as any,
  unavailableBadge: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,15,26,0.6)', justifyContent: 'center', alignItems: 'center' } as ViewStyle,
  unavailableText: { color: '#FFFFFF', fontSize: FontSize.extraSmall, fontWeight: FontWeight.bold as any } as any,
  discountTag: { position: 'absolute', top: 6, left: 6, backgroundColor: Colors.discountTag, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, shadowColor: Colors.discountTag, shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 } as ViewStyle,
  discountText: { color: '#FFFFFF', fontSize: 10, fontWeight: FontWeight.bold as any } as any,
  name: { fontSize: FontSize.default, fontWeight: FontWeight.bold as any, color: Colors.textPrimary, letterSpacing: -0.1 } as any,
  desc: { fontSize: FontSize.extraSmall, color: Colors.textSecondary, marginTop: 2, lineHeight: 16 } as any,
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.extraSmall, marginTop: Spacing.extraSmall } as ViewStyle,
  ratingText: { fontSize: FontSize.extraSmall, color: Colors.textSecondary, marginLeft: 4 } as any,
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.small, marginTop: Spacing.small } as ViewStyle,
  price: { fontSize: FontSize.default, fontWeight: FontWeight.bold as any, color: Colors.success } as any,
  priceStrike: { fontSize: FontSize.small, color: Colors.textMuted, textDecorationLine: 'line-through' } as any,
  stock: { fontSize: FontSize.extraSmall, color: Colors.textSecondary, fontWeight: FontWeight.semiBold as any } as any,
  stockOut: { fontSize: FontSize.extraSmall, color: Colors.danger, fontWeight: FontWeight.bold as any } as any,
});
