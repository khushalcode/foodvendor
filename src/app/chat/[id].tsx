import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image as RNImage,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Images } from '@/constants/images';
import { useAuth } from '@/hooks/useAuth';
import { chatApi } from '@/services/api';
import type { ChatMessage, Conversation } from '@/types';
import { supabase } from '@/lib/supabase';
import { formatTime } from '@/utils/formatters';
import { CustomAppBar } from '@/components/ui/custom-app-bar';
import { Shimmer } from '@/components/ui/shimmer';
import { useSnackbar } from '@/components/ui/custom-snackbar';

const AVATAR_COLORS = ['#3B82F6', '#2BA672', '#FFB300', '#9333EA', '#0891B2', '#FF6D6D'];
function colorFor(name: string): string {
  const code = name?.charCodeAt(0) ?? 0;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

export default function ChatDetailScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const snack = useSnackbar();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [msgs, conv] = await Promise.all([
        chatApi.messages(id),
        // Look up conversation directly (admin's `conversations` table)
        supabase.from('conversations').select('*').eq('id', id).maybeSingle().then(({ data }) => {
          if (!data) return null;
          // Map admin row → vendor-app Conversation shape
          return {
            id: String(data.id),
            store_id: '',
            customer_id: data.receiver_type === 'customer' ? String(data.receiver_id) : String(data.sender_id),
            customer_name: '',
            customer_image_url: null,
            last_message: '',
            last_message_at: data.updated_at ?? data.created_at,
            unread_count: Number(data.unread_message_count ?? 0),
            created_at: data.created_at ?? new Date().toISOString(),
          } as Conversation;
        }),
      ]);
      setMessages(msgs);
      setConversation(conv);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const onSend = async () => {
    if (!id || !user?.id || !draft.trim()) return;
    const text = draft.trim();
    setDraft('');
    setSending(true);
    try {
      const sent = await chatApi.send(id, user.id, text);
      setMessages((prev) => [...prev, sent]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    } catch (err: any) {
      snack.showCustomSnackBar(err?.message ?? 'Failed to send', true);
      // Restore draft on failure so the user can retry.
      setDraft(text);
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isVendor = item.sender_type === 'vendor';
    return (
      <View style={[styles.msgRow, isVendor ? styles.msgRowRight : styles.msgRowLeft]}>
        <View style={[styles.bubble, isVendor ? styles.bubbleRight : styles.bubbleLeft]}>
          {item.attachment_url ? (
            <Image source={{ uri: item.attachment_url }} style={styles.attachment} contentFit="cover" />
          ) : null}
          <Text style={[styles.msgText, isVendor ? styles.msgTextRight : styles.msgTextLeft]}>
            {item.message}
          </Text>
          <Text style={[styles.msgTime, isVendor ? styles.msgTimeRight : styles.msgTimeLeft]}>
            {formatTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  const customerName = conversation?.customer_name ?? 'Chat';
  const initial = customerName.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <CustomAppBar
        title={customerName}
        right={
          <View style={[styles.appBarAvatar, { backgroundColor: colorFor(customerName) }]}>
            <Text style={styles.appBarAvatarText}>{initial}</Text>
          </View>
        }
      />
      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
          }
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            loading ? (
              <View style={{ gap: Spacing.small, padding: Spacing.default }}>
                {[1, 2, 3].map((i) => (
                  <Shimmer key={i} width="40%" height={14} style={{ alignSelf: i % 2 === 0 ? 'flex-end' : 'flex-start' }} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyWrap}>
                <RNImage source={Images.chat} style={styles.emptyImg} />
                <Text style={styles.emptyText}>Say hello to start the conversation</Text>
              </View>
            )
          }
        />

        <View style={[styles.inputBar, { paddingBottom: insets.bottom + Spacing.small }]}>
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            placeholderTextColor={Colors.textMuted}
            value={draft}
            onChangeText={setDraft}
            multiline
            maxLength={500}
            editable={!sending}
          />
          <TouchableOpacity style={[styles.sendBtn, (!draft.trim() || sending) && styles.sendBtnDisabled]} onPress={onSend} disabled={!draft.trim() || sending}>
            <RNImage source={Images.send} style={styles.sendIcon} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background } as ViewStyle,
  body: { flex: 1 } as ViewStyle,
  list: { padding: Spacing.default, gap: Spacing.small } as any,
  msgRow: { flexDirection: 'row', marginVertical: 2 } as ViewStyle,
  msgRowRight: { justifyContent: 'flex-end' } as ViewStyle,
  msgRowLeft: { justifyContent: 'flex-start' } as ViewStyle,
  bubble: { maxWidth: '80%', paddingHorizontal: Spacing.default, paddingVertical: Spacing.small, borderRadius: Radius.medium } as ViewStyle,
  bubbleRight: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 } as ViewStyle,
  bubbleLeft: { backgroundColor: Colors.surfaceAlt, borderBottomLeftRadius: 4 } as ViewStyle,
  msgText: { fontSize: FontSize.default, lineHeight: 20 } as any,
  msgTextRight: { color: '#FFFFFF' } as any,
  msgTextLeft: { color: Colors.textPrimary } as any,
  msgTime: { fontSize: 9, marginTop: 4, alignSelf: 'flex-end' } as any,
  msgTimeRight: { color: 'rgba(255,255,255,0.85)' } as any,
  msgTimeLeft: { color: Colors.textMuted } as any,
  attachment: { width: 200, height: 140, borderRadius: Radius.default, marginBottom: Spacing.extraSmall } as any,
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.extraLarge } as ViewStyle,
  emptyImg: { width: 120, height: 120, marginBottom: Spacing.default } as any,
  emptyText: { fontSize: FontSize.default, color: Colors.textSecondary } as any,
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.small, paddingHorizontal: Spacing.default, paddingTop: Spacing.small, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border, backgroundColor: Colors.card } as ViewStyle,
  input: { flex: 1, minHeight: 40, maxHeight: 120, paddingHorizontal: Spacing.default, paddingVertical: 8, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.medium, fontSize: FontSize.default, color: Colors.textPrimary, backgroundColor: Colors.background } as any,
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
  sendBtnDisabled: { opacity: 0.4 } as ViewStyle,
  sendIcon: { width: 20, height: 20, tintColor: '#FFFFFF' } as any,
  appBarAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
  appBarAvatarText: { color: '#FFFFFF', fontSize: FontSize.default, fontWeight: FontWeight.bold as any } as any,
});
