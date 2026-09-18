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
import { notificationsApi } from '@/services/api';
import type { Notification } from '@/types';
import { timeAgo } from '@/utils/formatters';
import { CustomAppBar } from '@/components/ui/custom-app-bar';
import { CustomCard } from '@/components/ui/custom-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Shimmer } from '@/components/ui/shimmer';
import { SmartImage } from '@/components/ui/smart-image';
import { useSnackbar } from '@/components/ui/custom-snackbar';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { store, user } = useAuth();
  const snack = useSnackbar();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    // Notifications are keyed by auth.users.id (user_id), not by store_id.
    // Fall back to the legacy store_id call when user is unavailable.
    if (!user?.id) return;
    try {
      const list = await notificationsApi.list(user.id, store?.id);
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

  const onTap = async (n: Notification) => {
    setExpandedId((prev) => (prev === n.id ? null : n.id));
    if (!n.is_read) {
      try {
        await notificationsApi.markRead(n.id);
        setItems((prev) => prev.map((it) => (it.id === n.id ? { ...it, is_read: true } : it)));
      } catch (err: any) {
        snack.showCustomSnackBar(err?.message ?? 'Failed to mark read', true);
      }
    }
  };

  return (
    <View style={styles.container}>
      <CustomAppBar title={t('notification')} />
      <View style={styles.scrollBody}>
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 32 }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => onTap(item)} activeOpacity={0.85}>
              <CustomCard style={StyleSheet.flatten([styles.card, !item.is_read && styles.cardUnread])}>
                <View style={styles.row}>
                  <View style={styles.iconWrap}>
                    <SmartImage
                      source={item.image_url}
                      style={styles.icon}
                      fallbackIcon="notifications-outline"
                      fallbackLabel=""
                      fallbackVariant="violet"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.headerRow}>
                      <Text style={styles.title} numberOfLines={expandedId === item.id ? 0 : 1}>{item.title}</Text>
                      {!item.is_read ? <View style={styles.unreadDot} /> : null}
                    </View>
                    <Text
                      style={styles.bodyText}
                      numberOfLines={expandedId === item.id ? 0 : 2}
                    >
                      {item.body}
                    </Text>
                    <Text style={styles.time}>{timeAgo(item.created_at)}</Text>
                  </View>
                </View>
              </CustomCard>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            loading ? (
              <View style={{ gap: Spacing.default }}>
                {[1, 2, 3].map((i) => (
                  <CustomCard key={i}>
                    <View style={{ flexDirection: 'row', gap: Spacing.default, alignItems: 'flex-start' }}>
                      <Shimmer width={40} height={40} radius={20} />
                      <View style={{ flex: 1, gap: 6 }}>
                        <Shimmer width="60%" height={14} />
                        <Shimmer width="100%" height={12} />
                        <Shimmer width="30%" height={10} />
                      </View>
                    </View>
                  </CustomCard>
                ))}
              </View>
            ) : (
              <EmptyState
                image={Images.notification}
                title="No notifications"
                description="New order updates and announcements will appear here."
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
  scrollBody: { flex: 1 } as ViewStyle,
  list: { padding: Spacing.default, gap: Spacing.default } as any,
  card: { marginBottom: 0 } as ViewStyle,
  cardUnread: { borderLeftWidth: 4, borderLeftColor: Colors.primary, backgroundColor: Colors.primarySofter } as ViewStyle,
  row: { flexDirection: 'row', gap: Spacing.default, alignItems: 'flex-start' } as ViewStyle,
  iconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: Colors.borderPrimary } as ViewStyle,
  icon: { width: 20, height: 20 } as any,
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.small } as ViewStyle,
  title: { flex: 1, fontSize: FontSize.default, fontWeight: FontWeight.bold as any, color: Colors.textPrimary } as any,
  unreadDot: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: Colors.primary, shadowColor: Colors.primary, shadowOpacity: 0.5, shadowRadius: 6, elevation: 3 } as ViewStyle,
  bodyText: { fontSize: FontSize.small, color: Colors.textSecondary, marginTop: 4, lineHeight: 18 } as any,
  time: { fontSize: FontSize.extraSmall, color: Colors.textMuted, marginTop: Spacing.extraSmall } as any,
});
