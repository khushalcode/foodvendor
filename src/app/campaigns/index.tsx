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
import { campaignsApi } from '@/services/api';
import type { Campaign } from '@/types';
import { formatDate } from '@/utils/formatters';
import { CustomAppBar } from '@/components/ui/custom-app-bar';
import { CustomCard } from '@/components/ui/custom-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Shimmer } from '@/components/ui/shimmer';
import { SmartImage } from '@/components/ui/smart-image';
import { useSnackbar } from '@/components/ui/custom-snackbar';

export default function CampaignsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { store } = useAuth();
  const snack = useSnackbar();
  const [items, setItems] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!store) return;
    try {
      const list = await campaignsApi.list(store.id);
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

  const onToggleJoin = async (c: Campaign) => {
    if (!store) return;
    setBusyId(c.id);
    try {
      if (c.is_joined) {
        await campaignsApi.leave(store.id, c.id);
        snack.showCustomSnackBar('Left campaign', false);
      } else {
        await campaignsApi.join(store.id, c.id);
        snack.showCustomSnackBar('Joined campaign', false);
      }
      load();
    } catch (err: any) {
      snack.showCustomSnackBar(err?.message ?? 'Failed', true);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <View style={styles.container}>
      <CustomAppBar title={t('campaigns')} />
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
              <View style={styles.row}>
                <View style={styles.thumbWrap}>
                  <SmartImage
                    source={item.image_url}
                    style={styles.thumb}
                    fallbackIcon="megaphone-outline"
                    fallbackLabel="Campaign"
                    fallbackVariant="sunset"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.headerRow}>
                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                    <StatusBadge status={item.is_active ? 'active' : 'inactive'} small />
                  </View>
                  {item.description ? (
                    <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
                  ) : null}
                  <Text style={styles.dateText}>
                    {formatDate(item.start_date)} - {formatDate(item.end_date)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.joinBtn, item.is_joined && styles.leaveBtn, busyId === item.id && styles.busyBtn]}
                onPress={() => onToggleJoin(item)}
                disabled={busyId === item.id}
              >
                <Text style={[styles.joinText, item.is_joined && styles.leaveText]}>
                  {item.is_joined ? 'Leave' : 'Join'}
                </Text>
              </TouchableOpacity>
            </CustomCard>
          )}
          ListEmptyComponent={
            loading ? (
              <View style={{ gap: Spacing.default }}>
                {[1, 2].map((i) => (
                  <CustomCard key={i}>
                    <View style={{ flexDirection: 'row', gap: Spacing.default }}>
                      <Shimmer width={80} height={80} radius={8} />
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
                image={Images.campaign}
                title="No campaigns"
                description="Campaigns from your platform will appear here."
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
  row: { flexDirection: 'row', gap: Spacing.default, marginBottom: Spacing.default } as ViewStyle,
  thumbWrap: { width: 80, height: 80, borderRadius: Radius.default, backgroundColor: Colors.surfaceAlt, overflow: 'hidden' } as ViewStyle,
  thumb: { width: '100%', height: '100%' } as any,
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' } as ViewStyle,
  title: { fontSize: FontSize.medium, fontWeight: FontWeight.bold as any, color: Colors.textPrimary, flex: 1, marginRight: Spacing.small } as any,
  desc: { fontSize: FontSize.extraSmall, color: Colors.textSecondary, marginTop: 4, lineHeight: 16 } as any,
  dateText: { fontSize: FontSize.extraSmall, color: Colors.textMuted, marginTop: Spacing.extraSmall } as any,
  joinBtn: { paddingVertical: Spacing.small, borderRadius: Radius.default, backgroundColor: Colors.primary, alignItems: 'center' } as ViewStyle,
  leaveBtn: { backgroundColor: Colors.surfaceAlt } as ViewStyle,
  busyBtn: { opacity: 0.5 } as ViewStyle,
  joinText: { color: '#FFFFFF', fontSize: FontSize.default, fontWeight: FontWeight.bold as any } as any,
  leaveText: { color: Colors.danger } as any,
});
