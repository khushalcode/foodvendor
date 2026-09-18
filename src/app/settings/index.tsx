import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { CustomAppBar } from '@/components/ui/custom-app-bar';
import { CustomCard } from '@/components/ui/custom-card';
import { CustomButton } from '@/components/ui/custom-button';
import { CustomTextField } from '@/components/ui/custom-text-field';
import { useSnackbar } from '@/components/ui/custom-snackbar';
import { isValidEmail } from '@/utils/formatters';

interface FormState {
  full_name: string;
  phone: string;
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { profile, store, updateStoreStatus, refreshProfile } = useAuth();
  const snack = useSnackbar();
  const [form, setForm] = useState<FormState>({ full_name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [togglingStore, setTogglingStore] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? '',
        phone: profile.phone ?? '',
      });
    }
  }, [profile]);

  const onSave = async () => {
    if (!profile) return;
    if (!form.full_name.trim()) {
      return snack.showCustomSnackBar('Name is required', true);
    }
    if (form.phone && !isValidEmail(`${form.phone}@x.com`)) {
      // Phone is loose — just ensure non-empty if provided.
    }
    setSaving(true);
    try {
      // Update the admin's `vendors` table by email (the vendor row is
      // keyed by email, not by auth.users.id)
      const { error } = await supabase
        .from('vendors')
        .update({
          name: form.full_name.trim(),
          phone: form.phone.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('email', profile.email);
      if (error) throw error;
      await refreshProfile();
      snack.showCustomSnackBar('Profile updated', false);
      router.back();
    } catch (err: any) {
      snack.showCustomSnackBar(err?.message ?? 'Failed', true);
    } finally {
      setSaving(false);
    }
  };

  const onToggleStore = async (value: boolean) => {
    setTogglingStore(true);
    try {
      await updateStoreStatus(value);
      snack.showCustomSnackBar(value ? 'Store is now open' : 'Store is now closed', false);
    } catch (err: any) {
      snack.showCustomSnackBar(err?.message ?? 'Failed', true);
    } finally {
      setTogglingStore(false);
    }
  };

  return (
    <View style={styles.container}>
      <CustomAppBar title={t('settings')} />
      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>Profile</Text>
        <CustomCard>
          <CustomTextField
            label="Full Name"
            placeholder="John Doe"
            value={form.full_name}
            onChangeText={(v) => setForm({ ...form, full_name: v })}
            required
          />
          <CustomTextField
            label="Phone"
            placeholder="+1 555 0100"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(v) => setForm({ ...form, phone: v })}
          />
          <CustomTextField
            label="Email"
            placeholder="vendor@example.com"
            value={profile?.email ?? ''}
            editable={false}
          />
        </CustomCard>

        <CustomButton label="Save Changes" onPress={onSave} loading={saving} style={{ marginTop: Spacing.default }} />

        {store ? (
          <>
            <Text style={[styles.sectionTitle, { marginTop: Spacing.extraLarge }]}>Store</Text>
            <CustomCard style={styles.storeRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.storeName} numberOfLines={1}>{store.name}</Text>
                <Text style={styles.storeStatus}>
                  Store is currently {store.is_open ? 'open' : 'closed'}
                </Text>
              </View>
              <Switch
                value={store.is_open}
                onValueChange={onToggleStore}
                disabled={togglingStore}
                trackColor={{ false: Colors.surfaceAlt, true: Colors.primary }}
                thumbColor="#FFFFFF"
              />
            </CustomCard>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background } as ViewStyle,
  body: { padding: Spacing.default } as any,
  sectionTitle: { fontSize: FontSize.small, fontWeight: FontWeight.bold as any, color: Colors.textSecondary, marginBottom: Spacing.small, marginLeft: Spacing.extraSmall, textTransform: 'uppercase', letterSpacing: 0.5 } as any,
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.default, marginBottom: 0 } as ViewStyle,
  storeName: { fontSize: FontSize.default, fontWeight: FontWeight.bold as any, color: Colors.textPrimary } as any,
  storeStatus: { fontSize: FontSize.small, color: Colors.textSecondary, marginTop: 2 } as any,
});
