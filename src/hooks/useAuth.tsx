import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import * as SecureStore from 'expo-secure-store';
import { Platform, Alert } from 'react-native';
import type { Profile, Store, VendorType } from '@/types';

const REMEMBER_KEY = 'vendor_app_remember_creds';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  store: Store | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string, vendorType: VendorType, remember: boolean) => Promise<void>;
  signUp: (email: string, password: string, metadata: Record<string, any>) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateStoreStatus: (isOpen: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Unified with admin panel — load the vendor's `vendors` row by EMAIL
   * (not by auth.users.id). Then look up the store owned by that vendor
   * via `stores.vendor_id`.
   */
  const loadProfile = useCallback(async (authUser: { id: string; email?: string }) => {
    try {
      const email = authUser.email;
      if (!email) {
        console.warn('[auth] loadProfile: no email in auth user');
        return;
      }

      // Look up the vendors row by email
      const { data: vendorRow, error: vErr } = await supabase
        .from('vendors')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      if (vErr) throw vErr;
      if (!vendorRow) {
        console.warn('[auth] No vendors row found for email:', email);
        // Update user_profiles role to vendor (in case the auth trigger created it as 'customer')
        try {
          await supabase
            .from('user_profiles')
            .update({ role: 'vendor', is_active: true })
            .eq('user_id', authUser.id);
        } catch {}
        return;
      }

      // Build a Profile shape from the vendors row (preserve vendor-app type)
      const p: Profile = {
        id: String(vendorRow.id), // bigint → string
        email: vendorRow.email,
        full_name: vendorRow.name,
        phone: vendorRow.phone ?? '',
        vendor_type: 'owner' as VendorType,
        store_id: '', // resolved below
        is_active: Boolean(vendorRow.is_active),
        created_at: vendorRow.created_at ?? new Date().toISOString(),
      };

      // Look up the store owned by this vendor
      if (vendorRow.id) {
        const { data: storeRow, error: sErr } = await supabase
          .from('stores')
          .select('*')
          .eq('vendor_id', vendorRow.id)
          .maybeSingle();
        if (sErr) throw sErr;
        if (storeRow) {
          p.store_id = String(storeRow.id);
          setStore({
            id: String(storeRow.id),
            owner_id: String(vendorRow.id),
            name: storeRow.name ?? '',
            description: storeRow.announcement ?? null,
            logo_url: storeRow.logo ?? null,
            cover_url: storeRow.cover_photo ?? null,
            address: storeRow.address ?? '',
            latitude: storeRow.lat ? Number(storeRow.lat) : null,
            longitude: storeRow.lng ? Number(storeRow.lng) : null,
            contact_phone: storeRow.phone ?? '',
            contact_email: storeRow.email ?? '',
            vat_percent: Number(storeRow.tax ?? 0),
            min_order_amount: Number(storeRow.minimum_order ?? 0),
            is_active: Boolean(storeRow.active ?? true),
            is_open: Boolean(storeRow.status ?? true),
            opening_time: null,
            closing_time: null,
            rating: Number(storeRow.rating ?? 0),
            total_ratings: Number(storeRow.rating_count ?? 0),
            module: 'store',
          } as Store);
        } else {
          setStore(null);
        }
      }
      setProfile(p);
    } catch (err) {
      console.warn('[auth] loadProfile failed', err);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(data.session);
        setUser(data.session?.user ?? null);
        if (data.session?.user) {
          await loadProfile({ id: data.session.user.id, email: data.session.user.email });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    const { data: sub } = supabase.auth.onAuthStateChange(async (_evt, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        await loadProfile({ id: newSession.user.id, email: newSession.user.email });
      } else {
        setProfile(null);
        setStore(null);
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string, vendorType: VendorType, remember: boolean) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // Stash credentials for "remember me" re-login on subsequent app launches
    if (remember && Platform.OS !== 'web') {
      try {
        await SecureStore.setItemAsync(REMEMBER_KEY, JSON.stringify({ email, password, vendorType }));
      } catch {
        // ignore
      }
    }
    if (data.user) await loadProfile({ id: data.user.id, email: data.user.email });
  }, [loadProfile]);

  /**
   * Sign-up creates:
   *   1. A Supabase auth user (via supabase.auth.signUp)
   *   2. A `user_profiles` row (auto-created by the auth trigger with role='customer')
   *      — we explicitly update it to role='vendor'
   *   3. A `vendors` row (the admin panel's business-owner table) keyed by email
   *
   * After sign-up, the caller can use `storesApi.create({ vendor_id })` to
   * create the store owned by this vendor (see sign-up screen).
   */
  const signUp = useCallback(async (email: string, password: string, metadata: Record<string, any>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { ...metadata, role: 'vendor' } },
    });
    if (error) throw error;

    if (data.user) {
      // The auth trigger auto-creates a user_profiles row with role='customer', is_active=false
      // — explicitly upgrade it to vendor
      try {
        await supabase
          .from('user_profiles')
          .update({ role: 'vendor', is_active: false }) // not active until admin approves
          .eq('user_id', data.user.id);
      } catch (e) {
        console.warn('[auth] failed to update user_profiles role', e);
      }

      // Create the vendors row keyed by email (admin panel's business-owner table)
      try {
        await supabase.from('vendors').insert({
          name: metadata.full_name || metadata.name || email.split('@')[0],
          email,
          phone: metadata.phone ?? '',
          status: 'pending',
          application_status: 'pending',
          is_active: false, // requires admin approval
        });
      } catch (e) {
        console.warn('[auth] failed to create vendors row', e);
      }

      await loadProfile({ id: data.user.id, email: data.user.email });
    }
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[auth] signOut error', err);
    }
    if (Platform.OS !== 'web') {
      try {
        await SecureStore.deleteItemAsync(REMEMBER_KEY);
      } catch { /* ignore */ }
    }
    setProfile(null);
    setStore(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile({ id: user.id, email: user.email ?? undefined });
  }, [user, loadProfile]);

  /**
   * Update the store's open/closed status. Maps the vendor-app's `is_open`
   * boolean to the admin's `status` column on the `stores` table.
   */
  const updateStoreStatus = useCallback(async (isOpen: boolean) => {
    if (!store) return;
    const { error } = await supabase
      .from('stores')
      .update({
        status: isOpen,
        active: isOpen, // also flip `active` to keep them in sync
        updated_at: new Date().toISOString(),
      })
      .eq('id', store.id);
    if (error) throw error;
    setStore((prev) => (prev ? { ...prev, is_open: isOpen, is_active: isOpen } : prev));
  }, [store]);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user,
    profile,
    store,
    loading,
    isConfigured: isSupabaseConfigured,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    updateStoreStatus,
  }), [session, user, profile, store, loading, isSupabaseConfigured, signIn, signUp, signOut, refreshProfile, updateStoreStatus]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

// Demo mode helper — surfaces a clear warning if the app was launched
// without Supabase env vars configured.
export function warnIfNotConfigured() {
  if (!isSupabaseConfigured && Platform.OS !== 'web') {
    Alert.alert(
      'Supabase not configured',
      'Add supabaseUrl and supabaseAnonKey to app.json → expo.extra, OR set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY env vars. The app is running in offline demo mode.',
    );
  }
}
