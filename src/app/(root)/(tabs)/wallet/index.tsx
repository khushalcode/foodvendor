import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Images } from '@/constants/images';
import { useAuth } from '@/hooks/useAuth';
import { disbursementsApi } from '@/services/api';
import type { Disbursement } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { CustomCard } from '@/components/ui/custom-card';
import { Shimmer } from '@/components/ui/shimmer';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';

export default function WalletScreen() {
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

  useEffect(() => { load(); }, [load]);

  const balance = 12450.75;
  const pending = 850.00;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.default }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerEyebrow}>Balance</Text>
          <Text style={styles.headerTitle}>{t('wallet')}</Text>
        </View>
        <TouchableOpacity style={styles.historyTopBtn} onPress={() => router.push('/disbursements')} activeOpacity={0.8}>
          <Ionicons name="time-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Gradient balance card */}
      <View style={styles.balanceCardOuter}>
        <LinearGradient
          colors={[Colors.heroGradientStart, Colors.heroGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceBlob1} />
          <View style={styles.balanceBlob2} />
          <View style={styles.balanceChipRow}>
            <View style={styles.balanceChip}>
              <Ionicons name="wallet" size={14} color="#FFFFFF" />
              <Text style={styles.balanceChipText}>Available</Text>
            </View>
            <Image source={Images.creditCard} style={styles.cardChipIcon} />
          </View>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceValue}>{formatCurrency(balance)}</Text>
          <View style={styles.subRow}>
            <View>
              <Text style={styles.subLabel}>Pending</Text>
              <Text style={styles.subValue}>{formatCurrency(pending)}</Text>
            </View>
            <View style={styles.subRowDivider} />
            <View>
              <Text style={styles.subLabel}>This month</Text>
              <Text style={styles.subValue}>{formatCurrency(balance + pending)}</Text>
            </View>
          </View>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.withdrawBtn} onPress={() => router.push('/disbursements')} activeOpacity={0.85}>
              <Image source={Images.disbursement} style={styles.withdrawIcon} />
              <Text style={styles.withdrawText}>Withdraw</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.historyBtn} onPress={() => router.push('/disbursements')} activeOpacity={0.85}>
              <Image source={Images.transactionReportIcon} style={styles.withdrawIcon} />
              <Text style={styles.historyText}>History</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <TouchableOpacity onPress={() => router.push('/disbursements')}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items.slice(0, 8)}
        keyExtractor={(i) => i.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 120 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        renderItem={({ item }) => (
          <CustomCard style={styles.txnCard}>
            <View style={[styles.txnIconWrap, item.status === 'completed' ? styles.txnIconWrapSuccess : styles.txnIconWrapPending]}>
              <Image source={item.status === 'completed' ? Images.deliveredSuccess : Images.pendingItem} style={styles.txnIcon} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.txnAmount}>{formatCurrency(item.amount)}</Text>
              <Text style={styles.txnMethod}>{item.method}</Text>
              <Text style={styles.txnDate}>{formatDate(item.created_at)}</Text>
            </View>
            <StatusBadge status={item.status} small />
          </CustomCard>
        )}
        ListEmptyComponent={
          loading ? (
            <View style={{ gap: Spacing.default }}>
              {[1, 2, 3].map((i) => (
                <CustomCard key={i}>
                  <View style={{ flexDirection: 'row', gap: Spacing.default, alignItems: 'center' }}>
                    <Shimmer width={48} height={48} radius={16} />
                    <View style={{ flex: 1, gap: 6 }}>
                      <Shimmer width="40%" height={14} />
                      <Shimmer width="80%" height={12} />
                    </View>
                  </View>
                </CustomCard>
              ))}
            </View>
          ) : (
            <EmptyState
              image={Images.transaction}
              title="No transactions yet"
              description="Your withdrawal history will appear here."
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
  historyTopBtn: {
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
  balanceCardOuter: { paddingHorizontal: Spacing.default, marginBottom: Spacing.large } as ViewStyle,
  balanceCard: {
    padding: Spacing.extraLarge,
    borderRadius: Radius.extraOverLarge,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOpacity: 0.32,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  } as ViewStyle,
  balanceBlob1: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.14)',
  } as ViewStyle,
  balanceBlob2: {
    position: 'absolute',
    bottom: -50,
    left: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.10)',
  } as ViewStyle,
  balanceChipRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.default } as ViewStyle,
  balanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.extraSmall,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.small,
    paddingVertical: 4,
    borderRadius: Radius.circular,
  } as ViewStyle,
  balanceChipText: { fontSize: FontSize.extraSmall, color: '#FFFFFF', fontWeight: FontWeight.semiBold as any, letterSpacing: 0.3 } as any,
  cardChipIcon: { width: 28, height: 22, tintColor: 'rgba(255,255,255,0.4)' } as any,
  balanceLabel: { fontSize: FontSize.small, color: 'rgba(255,255,255,0.85)', letterSpacing: 0.3 } as any,
  balanceValue: { fontSize: FontSize.display, fontWeight: FontWeight.black as any, color: '#FFFFFF', marginTop: Spacing.extraSmall, letterSpacing: -1, marginBottom: Spacing.default } as any,
  subRow: { flexDirection: 'row', gap: Spacing.large, marginTop: Spacing.default, paddingTop: Spacing.default, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.18)' } as ViewStyle,
  subRowDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.12)' } as ViewStyle,
  subLabel: { fontSize: FontSize.extraSmall, color: 'rgba(255,255,255,0.75)', letterSpacing: 0.3 } as any,
  subValue: { fontSize: FontSize.medium, fontWeight: FontWeight.bold as any, color: '#FFFFFF', marginTop: 2 } as any,
  actionsRow: { flexDirection: 'row', gap: Spacing.default, marginTop: Spacing.large } as ViewStyle,
  withdrawBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.default,
    borderRadius: Radius.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.small,
  } as ViewStyle,
  withdrawIcon: { width: 18, height: 18, tintColor: Colors.primaryDark } as any,
  withdrawText: { fontSize: FontSize.default, fontWeight: FontWeight.bold as any, color: Colors.primaryDark } as any,
  historyBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingVertical: Spacing.default,
    borderRadius: Radius.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.small,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  } as ViewStyle,
  historyText: { fontSize: FontSize.default, fontWeight: FontWeight.bold as any, color: '#FFFFFF' } as any,
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.default, marginBottom: Spacing.default } as ViewStyle,
  sectionTitle: { fontSize: FontSize.extraLarge, fontWeight: FontWeight.bold as any, color: Colors.textPrimary, letterSpacing: -0.3 } as any,
  seeAll: { fontSize: FontSize.small, color: Colors.primary, fontWeight: FontWeight.bold as any } as any,
  list: { padding: Spacing.default, gap: Spacing.default } as any,
  txnCard: { marginBottom: 0 } as ViewStyle,
  txnIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  txnIconWrapSuccess: { backgroundColor: Colors.successSoft } as ViewStyle,
  txnIconWrapPending: { backgroundColor: Colors.warningSoft } as ViewStyle,
  txnIcon: { width: 22, height: 22 } as any,
  txnAmount: { fontSize: FontSize.default, fontWeight: FontWeight.bold as any, color: Colors.textPrimary, letterSpacing: -0.1 } as any,
  txnMethod: { fontSize: FontSize.extraSmall, color: Colors.textSecondary, marginTop: 2, textTransform: 'capitalize' } as any,
  txnDate: { fontSize: FontSize.extraSmall, color: Colors.textMuted, marginTop: 2 } as any,
});
