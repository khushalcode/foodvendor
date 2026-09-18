import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Images } from '@/constants/images';
import { CustomButton } from '@/components/ui/custom-button';
import { CustomTextField } from '@/components/ui/custom-text-field';
import { CustomAppBar } from '@/components/ui/custom-app-bar';
import { useSnackbar } from '@/components/ui/custom-snackbar';
import { useAuth } from '@/hooks/useAuth';
import { storesApi } from '@/services/api';
import { isValidEmail } from '@/utils/formatters';

const STEPS = [
  { id: 0.1, title: 'vendor_info', subtitle: 'provide_vendor_information_to_proceed_next' },
  { id: 0.6, title: 'owner_info', subtitle: 'provide_owner_information_to_confirm' },
  { id: 1.0, title: 'business_plan', subtitle: 'you_are_one_step_away_choose_your_business_plan' },
];

const PLANS = [
  { id: 'starter', name: 'Starter', price: 0, period: 'mo', features: ['Up to 100 products', '1 branch', 'Basic analytics'] },
  { id: 'growth', name: 'Growth', price: 29, period: 'mo', features: ['Unlimited products', '5 branches', 'Advanced analytics', 'Priority support'] },
  { id: 'enterprise', name: 'Enterprise', price: 99, period: 'mo', features: ['Everything in Growth', 'Unlimited branches', 'Dedicated manager', 'Custom integrations'] },
];

export default function StoreRegistrationScreen() {
  const { t } = useTranslation();
  const { user, signUp } = useAuth();
  const snack = useSnackbar();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [vendorName, setVendorName] = useState('');
  const [vendorAddress, setVendorAddress] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [vat, setVat] = useState('');

  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');

  const [planId, setPlanId] = useState('growth');

  const progress = STEPS[step].id;

  const onNext = async () => {
    if (step === 0) {
      if (!vendorName) return snack.showCustomSnackBar('Vendor name is required', true);
      if (!vendorEmail) return snack.showCustomSnackBar('Email is required', true);
      if (!isValidEmail(vendorEmail)) return snack.showCustomSnackBar('Enter a valid email', true);
      if (!vendorPhone) return snack.showCustomSnackBar('Phone is required', true);
      setStep(1);
    } else if (step === 1) {
      if (!ownerName) return snack.showCustomSnackBar('Owner name is required', true);
      if (!ownerEmail) return snack.showCustomSnackBar('Email is required', true);
      if (!isValidEmail(ownerEmail)) return snack.showCustomSnackBar('Enter a valid email', true);
      if (!ownerPassword || ownerPassword.length < 8) return snack.showCustomSnackBar('Min 8 characters', true);
      setStep(2);
    } else {
      await submit();
    }
  };

  const submit = async () => {
    setLoading(true);
    try {
      await signUp(ownerEmail.trim(), ownerPassword, {
        full_name: ownerName,
        vendor_type: 'owner',
        phone: ownerPhone,
        name: vendorName,
        store_name: vendorName,
        store_email: vendorEmail,
        store_phone: vendorPhone,
        store_address: vendorAddress,
      });

      const { vendorsApi } = await import('@/services/api');
      const vendor = await vendorsApi.getByEmail(ownerEmail.trim());
      if (vendor?.id) {
        const { data: defaultZone } = await import('@/lib/supabase').then((m) =>
          m.supabase.from('zones').select('id').eq('is_default', true).limit(1).maybeSingle(),
        );
        const { data: defaultModule } = await import('@/lib/supabase').then((m) =>
          m.supabase.from('modules').select('id').limit(1).maybeSingle(),
        );

        await storesApi.create({
          vendor_id: vendor.id,
          name: vendorName,
          description: null,
          address: vendorAddress || null,
          contact_email: vendorEmail,
          contact_phone: vendorPhone,
          vat_percent: vat ? Number(vat) : 0,
          min_order_amount: 0,
          is_active: false,
          is_open: false,
          rating: 0,
          total_ratings: 0,
          module: 'store',
          ...(defaultModule?.id ? { module_id: defaultModule.id } : {}),
        });

        if (defaultZone?.id) {
          const { data: newStore } = await vendorsApi.getByEmail(ownerEmail.trim()).then(async (v) => {
            if (!v) return { data: null };
            return await import('@/lib/supabase').then((m) =>
              m.supabase.from('stores').select('id').eq('vendor_id', v.id).maybeSingle(),
            );
          });
          if (newStore?.id) {
            const { supabase: s } = await import('@/lib/supabase');
            await s.from('stores').update({ zone_id: defaultZone.id }).eq('id', newStore.id);
          }
        }
      }

      snack.showCustomSnackBar('Registration successful! Pending admin approval.', false);
      router.replace('/(root)/home');
    } catch (err: any) {
      snack.showCustomSnackBar(err?.message ?? 'Registration failed', true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top']}>
      <CustomAppBar title={t('vendor_registration')} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Progress block */}
          <View style={styles.progressWrap}>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[StyleSheet.absoluteFillObject, { width: `${progress * 100}%` }]}
              />
            </View>
            <View style={styles.progressMeta}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>Step {step + 1} / {STEPS.length}</Text>
              </View>
              <Text style={styles.progressLabel}>{t(STEPS[step].title)}</Text>
            </View>
            <Text style={styles.progressSubtitle}>{t(STEPS[step].subtitle)}</Text>
          </View>

          {step === 0 ? (
            <View style={styles.stepCard}>
              <CustomTextField label={t('vendor_name')} placeholder="e.g. Fresh Mart" value={vendorName} onChangeText={setVendorName} required />
              <CustomTextField label={t('email')} placeholder="vendor@example.com" value={vendorEmail} onChangeText={setVendorEmail} keyboardType="email-address" iconImage="mail" required />
              <CustomTextField label={t('phone')} placeholder="+1 555 0100" value={vendorPhone} onChangeText={setVendorPhone} keyboardType="phone-pad" required />
              <CustomTextField label={t('address')} placeholder="123 Main Street" value={vendorAddress} onChangeText={setVendorAddress} multiline numberOfLines={2} />
              <CustomTextField label={t('vat_tax')} placeholder="0" value={vat} onChangeText={setVat} keyboardType="number-pad" />
            </View>
          ) : null}

          {step === 1 ? (
            <View style={styles.stepCard}>
              <CustomTextField label={t('owner_name')} placeholder="John Doe" value={ownerName} onChangeText={setOwnerName} required />
              <CustomTextField label={t('email')} placeholder="owner@example.com" value={ownerEmail} onChangeText={setOwnerEmail} keyboardType="email-address" iconImage="mail" required />
              <CustomTextField label={t('phone')} placeholder="+1 555 0100" value={ownerPhone} onChangeText={setOwnerPhone} keyboardType="phone-pad" />
              <CustomTextField label={t('password')} placeholder="••••••••" value={ownerPassword} onChangeText={setOwnerPassword} isPassword iconImage="lock" required />
            </View>
          ) : null}

          {step === 2 ? (
            <View style={styles.plansContainer}>
              {PLANS.map((p) => {
                const active = planId === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.planCard, active && styles.planCardActive]}
                    onPress={() => setPlanId(p.id)}
                    activeOpacity={0.85}
                  >
                    {active ? (
                      <View style={styles.planActiveCheck}>
                        <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                      </View>
                    ) : null}
                    <View style={styles.planHeader}>
                      <Text style={styles.planName}>{p.name}</Text>
                      <Text style={styles.planPrice}>${p.price}<Text style={styles.planPeriod}>/{p.period}</Text></Text>
                    </View>
                    <View style={styles.planFeatures}>
                      {p.features.map((f) => (
                        <View key={f} style={styles.planFeatureRow}>
                          <Image source={Images.checked} style={styles.checkIcon} />
                          <Text style={styles.planFeatureText}>{f}</Text>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}

          <View style={styles.actionsRow}>
            {step > 0 ? (
              <CustomButton label={t('back')} variant="outline" onPress={() => setStep((s) => Math.max(0, s - 1))} style={{ flex: 1 }} />
            ) : null}
            {step > 0 ? <View style={{ width: Spacing.small }} /> : null}
            <CustomButton
              label={step < 2 ? t('next') : t('submit')}
              onPress={onNext}
              loading={loading}
              style={{ flex: 1 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.large } as ViewStyle,
  progressWrap: { marginBottom: Spacing.large } as ViewStyle,
  progressTrack: { height: 8, backgroundColor: Colors.surfaceAlt, borderRadius: 4, overflow: 'hidden' } as ViewStyle,
  progressMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.small, marginTop: Spacing.default } as ViewStyle,
  stepBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 6,
    paddingHorizontal: Spacing.small,
    paddingVertical: 4,
  } as ViewStyle,
  stepBadgeText: { fontSize: FontSize.extraSmall, color: Colors.primaryDark, fontWeight: FontWeight.bold as any, letterSpacing: 0.4 } as any,
  progressLabel: { fontSize: FontSize.medium, fontWeight: FontWeight.bold as any, color: Colors.textPrimary, letterSpacing: -0.2 } as any,
  progressSubtitle: { fontSize: FontSize.small, color: Colors.textSecondary, marginTop: 4 } as any,
  stepCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.extraLarge,
    padding: Spacing.large,
    marginBottom: Spacing.default,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadowSoft,
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  } as ViewStyle,
  plansContainer: { gap: Spacing.default } as ViewStyle,
  planCard: {
    position: 'relative',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.large,
    padding: Spacing.large,
    backgroundColor: Colors.card,
  } as ViewStyle,
  planCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySofter,
    shadowColor: Colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  } as ViewStyle,
  planActiveCheck: {
    position: 'absolute',
    top: -10,
    right: Spacing.default,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  } as ViewStyle,
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: Spacing.small } as ViewStyle,
  planName: { fontSize: FontSize.extraLarge, fontWeight: FontWeight.black as any, color: Colors.textPrimary, letterSpacing: -0.3 } as any,
  planPrice: { fontSize: FontSize.large, fontWeight: FontWeight.bold as any, color: Colors.primary } as any,
  planPeriod: { fontSize: FontSize.small, color: Colors.textSecondary, fontWeight: FontWeight.regular as any } as any,
  planFeatures: { marginTop: Spacing.small, gap: 6 } as ViewStyle,
  planFeatureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.small } as ViewStyle,
  planFeatureText: { fontSize: FontSize.small, color: Colors.textSecondary } as any,
  checkIcon: { width: 16, height: 16, tintColor: Colors.success } as any,
  actionsRow: { flexDirection: 'row', marginTop: Spacing.default } as ViewStyle,
});
