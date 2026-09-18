import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Images } from '@/constants/images';
import { Image } from 'expo-image';
import { CustomButton } from '@/components/ui/custom-button';
import { CustomTextField } from '@/components/ui/custom-text-field';
import { CustomAppBar } from '@/components/ui/custom-app-bar';
import { useAuth } from '@/hooks/useAuth';
import { useSnackbar } from '@/components/ui/custom-snackbar';
import { isValidEmail } from '@/utils/formatters';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const { isConfigured } = useAuth();
  const snack = useSnackbar();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const onSubmit = async () => {
    if (!email) return setError('Email is required');
    if (!isValidEmail(email)) return setError('Enter a valid email');
    if (!isConfigured) {
      Alert.alert('Supabase not configured', 'Please add your Supabase env vars.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) throw error;
      snack.showCustomSnackBar('Reset link sent to your email', false);
      router.push({ pathname: '/(auth)/verification', params: { email: email.trim() } });
    } catch (err: any) {
      snack.showCustomSnackBar(err?.message ?? 'Failed to send reset link', true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top']}>
      <CustomAppBar title={t('forgot_password')} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.iconWrap}>
            <LinearGradient
              colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Image source={Images.passChange} style={styles.icon} contentFit="contain" />
          </View>
          <Text style={styles.title}>{t('forgot_password')}?</Text>
          <Text style={styles.subtitle}>
            Enter the email address associated with your account. We'll send you a verification code.
          </Text>
          <View style={styles.formCard}>
            <CustomTextField
              label={t('email')}
              placeholder="you@example.com"
              value={email}
              onChangeText={(t) => { setEmail(t); setError(undefined); }}
              keyboardType="email-address"
              iconImage="mail"
              error={error}
            />
            <CustomButton label={t('send')} onPress={onSubmit} loading={loading} style={{ marginTop: Spacing.small }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.large, alignItems: 'stretch' } as ViewStyle,
  iconWrap: {
    width: 132,
    height: 132,
    borderRadius: Radius.huge,
    alignSelf: 'center',
    marginBottom: Spacing.large,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOpacity: 0.32,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  } as ViewStyle,
  icon: { width: 76, height: 76, tintColor: '#FFFFFF' } as any,
  title: { fontSize: FontSize.display, fontWeight: FontWeight.black as any, color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.6 } as any,
  subtitle: { fontSize: FontSize.default, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.small, marginBottom: Spacing.large, lineHeight: 22, paddingHorizontal: Spacing.default } as any,
  formCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.extraLarge,
    padding: Spacing.large,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadowSoft,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  } as ViewStyle,
});
