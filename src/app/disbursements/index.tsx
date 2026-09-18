import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Spacing } from '@/constants/theme';
import { Images } from '@/constants/images';
import { useAuth } from '@/hooks/useAuth';
import { disbursementsApi } from '@/services/api';
import type { Disbursement } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { CustomAppBar } from '@/components/ui/custom-app-bar';
import { CustomCard } from '@/components/ui/custom-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Shimmer } from '@/components/ui/shimmer';

export default function DisbursementsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { store } = useAuth();
  const [items, setItems] = useState<Disbursement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!store) return;
    try {
      const list = await disbursementsApi.list(store.id);
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

  return (
    <View style={styles.container}>
      <CustomAppBar title={t('disbursement')} />
      <View style={styles.body}>
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 32 }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
          }
          renderItem={({ item }) => (
            <CustomCard style={styles.card}>
              <View style={styles.headerRow}>
                <View style={styles.amountWrap}>
                  <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
                  <Text style={styles.method}>{item.method}</Text>
                </View>
                <StatusBadge status={item.status} small />
              </View>
              <View style={styles.footerRow}>
                <Text style={styles.date}>{formatDate(item.created_at)}</Text>
                {item.reference ? (
                  <Text style={styles.reference} numberOfLines={1}>Ref: {item.reference}</Text>
                ) : null}
              </View>
              {item.note ? (
                <Text style={styles.note} numberOfLines={2}>{item.note}</Text>
              ) : null}
            </CustomCard>
          )}
          ListEmptyComponent={
            loading ? (
              <View style={{ gap: Spacing.default }}>
                {[1, 2, 3].map((i) => (
                  <CustomCard key={i}>
                    <View style={{ gap: 6 }}>
                      <Shimmer width="40%" height={18} />
                      <Shimmer width="80%" height={12} />
                      <Shimmer width="60%" height={12} />
                    </View>
                  </CustomCard>
                ))}
              </View>
            ) : (
              <EmptyState
                image={Images.disbursement}
                title="No disbursements"
                description="Your withdrawal history will appear here."
              />
            )
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background } as ViewStyle,
  body: { flex: 1 } as ViewStyle,
  list: { padding: Spacing.default, gap: Spacing.default } as any,
  card: { marginBottom: 0 } as ViewStyle,
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.default } as ViewStyle,
  amountWrap: { flex: 1 } as ViewStyle,
  amount: { fontSize: FontSize.large, fontWeight: FontWeight.bold as any, color: Colors.success } as any,
  method: { fontSize: FontSize.small, color: Colors.textSecondary, marginTop: 2, textTransform: 'capitalize' } as any,
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.small, paddingTop: Spacing.small, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border } as ViewStyle,
  date: { fontSize: FontSize.extraSmall, color: Colors.textMuted } as any,
  reference: { fontSize: FontSize.extraSmall, color: Colors.textSecondary, flex: 1, textAlign: 'right' } as any,
  note: { fontSize: FontSize.extraSmall, color: Colors.textSecondary, marginTop: Spacing.small, fontStyle: 'italic' } as any,
});
