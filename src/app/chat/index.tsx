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
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Images } from '@/constants/images';
import { useAuth } from '@/hooks/useAuth';
import { chatApi } from '@/services/api';
import type { Conversation } from '@/types';
import { timeAgo } from '@/utils/formatters';
import { CustomAppBar } from '@/components/ui/custom-app-bar';
import { CustomCard } from '@/components/ui/custom-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Shimmer } from '@/components/ui/shimmer';

// Stable palette for avatar backgrounds (picked deterministically by name initial).
const AVATAR_COLORS = ['#7C5CFF', '#10C997', '#FFB020', '#9333EA', '#06B6D4', '#FF4D6D', '#C026D3'];

function colorFor(name: string): string {
  const code = name?.charCodeAt(0) ?? 0;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

export default function ChatScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { store } = useAuth();
  const [items, setItems] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!store) return;
    try {
      const list = await chatApi.conversations(store.id);
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

  const renderItem = ({ item }: { item: Conversation }) => {
    const initial = item.customer_name?.charAt(0)?.toUpperCase() ?? '#';
    return (
      <TouchableOpacity
        onPress={() => router.push(`/chat/${item.id}` as any)}
        activeOpacity={0.85}
      >
        <CustomCard style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.avatar, { backgroundColor: colorFor(item.customer_name) }]}>
              {item.customer_image_url ? (
                <Image source={{ uri: item.customer_image_url }} style={styles.avatarImg} contentFit="cover" />
              ) : (
                <Text style={styles.avatarText}>{initial}</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.headerRow}>
                <Text style={styles.name} numberOfLines={1}>{item.customer_name}</Text>
                <Text style={styles.time}>{item.last_message_at ? timeAgo(item.last_message_at) : ''}</Text>
              </View>
              <View style={styles.msgRow}>
                <Text style={styles.lastMsg} numberOfLines={1}>
                  {item.last_message ?? 'No messages yet'}
                </Text>
                {item.unread_count > 0 ? (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unread_count > 99 ? '99+' : item.unread_count}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </CustomCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <CustomAppBar title={t('chat')} />
      <View style={styles.body}>
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 32 }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
          }
          ListEmptyComponent={
            loading ? (
              <View style={{ gap: Spacing.default }}>
                {[1, 2, 3, 4].map((i) => (
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
                image={Images.chat}
                title="No conversations"
                description="When customers message you they will appear here."
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
  row: { flexDirection: 'row', gap: Spacing.default, alignItems: 'center' } as ViewStyle,
  avatar: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' } as ViewStyle,
  avatarImg: { width: '100%', height: '100%' } as any,
  avatarText: { color: '#FFFFFF', fontSize: FontSize.medium, fontWeight: FontWeight.bold as any } as any,
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' } as ViewStyle,
  name: { fontSize: FontSize.default, fontWeight: FontWeight.bold as any, color: Colors.textPrimary, flex: 1, marginRight: Spacing.small, letterSpacing: -0.1 } as any,
  time: { fontSize: FontSize.extraSmall, color: Colors.textMuted } as any,
  msgRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.small, marginTop: 4 } as ViewStyle,
  lastMsg: { flex: 1, fontSize: FontSize.small, color: Colors.textSecondary } as any,
  unreadBadge: { minWidth: 22, height: 22, paddingHorizontal: 7, borderRadius: 11, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primary, shadowOpacity: 0.4, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 } as ViewStyle,
  unreadText: { color: '#FFFFFF', fontSize: FontSize.extraSmall, fontWeight: FontWeight.bold as any } as any,
});
