import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// True only in an actual browser tab — false during Expo Router's
// Node-side static prerender, even though Platform.OS is 'web' there too.
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      if (!isBrowser) return null; // SSR pass — no storage available yet
      return localStorage.getItem(key);
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      if (!isBrowser) return;
      localStorage.setItem(key, value);
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // secure-store throws on simulator in some cases; swallow
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      if (!isBrowser) return;
      localStorage.removeItem(key);
      return;
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // ignore
    }
  },
};

// Unified with admin panel + customer app + delivery app — read from
// app.json `expo.extra.supabaseUrl` + `expo.extra.supabaseAnonKey` first
// (so all 4 apps can share the same Supabase project), then fall back to
// EXPO_PUBLIC_* env vars, then to placeholder values (demo mode).
const supabaseUrl =
  (Constants.expoConfig?.extra as any)?.supabaseUrl ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://YOUR-PROJECT-REF.supabase.co';

const supabaseAnonKey =
  (Constants.expoConfig?.extra as any)?.supabaseAnonKey ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'YOUR-SUPABASE-ANON-KEY';

export const isSupabaseConfigured =
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('YOUR-PROJECT-REF') &&
  !supabaseUrl.includes('placeholder') &&
  supabaseAnonKey !== 'YOUR-SUPABASE-ANON-KEY' &&
  !supabaseAnonKey.includes('placeholder') &&
  supabaseAnonKey.length > 20;

// A harmless stand-in WebSocket class — Supabase's RealtimeClient only
// needs *something* satisfying this shape at construction time; it's
// never actually opened during the SSR/static-export pass.
class NoopWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  constructor() {}
  close() {}
  send() {}
  addEventListener() {}
  removeEventListener() {}
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: isBrowser || Platform.OS !== 'web',
    persistSession: isBrowser || Platform.OS !== 'web',
    detectSessionInUrl: false,
  },
  // Node (SSR) has no native WebSocket until Node 22 — hand it a
  // no-op transport so client construction doesn't throw during prerender.
  realtime:
    Platform.OS === 'web' && !isBrowser
      ? { transport: NoopWebSocket as any }
      : undefined,
});