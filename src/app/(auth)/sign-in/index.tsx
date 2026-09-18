import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
  Alert,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Images } from '@/constants/images';
import { CustomButton } from '@/components/ui/custom-button';
import { CustomTextField } from '@/components/ui/custom-text-field';
import { useAuth } from '@/hooks/useAuth';
import { useSnackbar } from '@/components/ui/custom-snackbar';
import { isValidEmail } from '@/utils/formatters';
import type { VendorType } from '@/types';

export default function SignInScreen() {
  const { t } = useTranslation();
  const { signIn, isConfigured } = useAuth();
  const snack = useSnackbar();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [vendorType, setVendorType] = useState<VendorType>('owner');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const onSubmit = async () => {
    const e: typeof errors = {};
    if (!email) e.email = 'Email is required';
    else if (!isValidEmail(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Min 6 characters';
    setErrors(e);
    if (Object.keys(e).length) return;

    if (!isConfigured) {
      Alert.alert(
        'Supabase not configured',
        'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file before signing in.',
      );
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password, vendorType, remember);
      snack.showCustomSnackBar('Welcome back!', false);
      router.replace('/(root)/home');
    } catch (err: any) {
      snack.showCustomSnackBar(err?.message ?? 'Sign in failed', true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Gradient hero */}
          <LinearGradient
            colors={[Colors.heroGradientStart, Colors.heroGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerBg}
          >
            {/* Decorative glow blobs */}
            <View style={styles.blob1} />
            <View style={styles.blob2} />
            <Image source={Images.logo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.heading}>{t('sign_in')}</Text>
            <Text style={styles.subheading}>Welcome back, please sign in to your account</Text>
          </LinearGradient>

          <View style={styles.formCard}>
            {/* Vendor type toggle (Owner / Employee) */}
            <View style={styles.toggleRow}>
              {(['owner', 'employee'] as VendorType[]).map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[styles.toggle, vendorType === v && styles.toggleActive]}
                  onPress={() => setVendorType(v)}
                >
                  <Text
                    style={[
                      styles.toggleLabel,
                      vendorType === v && styles.toggleLabelActive,
                    ]}
                  >
                    {v === 'owner' ? t('vendor_owner') : t('vendor_employee')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <CustomTextField
              label={t('email')}
              placeholder="you@example.com"
              required
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              iconImage="mail"
              error={errors.email}
            />
            <CustomTextField
              label={t('password')}
              placeholder="••••••••"
              required
              value={password}
              onChangeText={setPassword}
              isPassword
              iconImage="lock"
              error={errors.password}
            />

            <View style={styles.rememberRow}>
              <View style={styles.rememberWrap}>
                <Switch
                  value={remember}
                  onValueChange={setRemember}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor="#FFFFFF"
                />
                <Text style={styles.rememberText}>{t('remember_me')}</Text>
              </View>
              <Text style={styles.forgotLink} onPress={() => router.push('/(auth)/forgot-password')}>
                {t('forgot_password')}?
              </Text>
            </View>

            <CustomButton label={t('sign_in')} onPress={onSubmit} loading={loading} style={{ marginTop: Spacing.large }} />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>{t('join_as')} </Text>
              <Text style={styles.footerLink} onPress={() => router.push('/(auth)/sign-up')}>
                {t('vendor')}?
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background } as ViewStyle,
  scroll: { flexGrow: 1, paddingBottom: Spacing.extraLarge } as any,
  headerBg: {
    width: '100%',
    alignItems: 'center',
    paddingTop: Spacing.extremeLarge,
    paddingBottom: Spacing.extraOverLarge,
    paddingHorizontal: Spacing.default,
    borderBottomLeftRadius: Radius.extraOverLarge,
    borderBottomRightRadius: Radius.extraOverLarge,
    overflow: 'hidden',
    position: 'relative',
  } as ViewStyle,
  blob1: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.16)',
  } as ViewStyle,
  blob2: {
    position: 'absolute',
    bottom: -50,
    left: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.12)',
  } as ViewStyle,
  logo: { width: 76, height: 76, borderRadius: 18 } as any,
  heading: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.black as any,
    color: '#FFFFFF',
    marginTop: Spacing.default,
    letterSpacing: -0.8,
  } as any,
  subheading: {
    fontSize: FontSize.default,
    color: 'rgba(255,255,255,0.88)',
    marginTop: Spacing.extraSmall,
    textAlign: 'center',
    letterSpacing: 0.2,
  } as any,
  formCard: {
    padding: Spacing.large,
    marginTop: -Spacing.extraLarge,
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.default,
    borderRadius: Radius.extraLarge,
    shadowColor: Colors.shadowStrong,
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  } as any,
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.medium,
    padding: 4,
    marginBottom: Spacing.default,
  } as any,
  toggle: { flex: 1, paddingVertical: Spacing.small, alignItems: 'center', borderRadius: Radius.default } as any,
  toggleActive: { backgroundColor: Colors.card, shadowColor: Colors.shadow, shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 } as any,
  toggleLabel: { fontSize: FontSize.default, fontWeight: FontWeight.semiBold as any, color: Colors.textSecondary } as any,
  toggleLabelActive: { color: Colors.primary, fontWeight: FontWeight.bold as any } as any,
  rememberRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: Spacing.default } as any,
  rememberWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.small } as any,
  rememberText: { fontSize: FontSize.small, color: Colors.textSecondary, fontWeight: FontWeight.medium as any } as any,
  forgotLink: { fontSize: FontSize.small, color: Colors.primary, fontWeight: FontWeight.bold as any } as any,
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.large } as any,
  footerText: { fontSize: FontSize.default, color: Colors.textSecondary } as any,
  footerLink: { fontSize: FontSize.default, color: Colors.primary, fontWeight: FontWeight.bold as any } as any,
});
