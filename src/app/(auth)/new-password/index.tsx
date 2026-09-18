import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Image } from 'expo-image';
import { Images } from '@/constants/images';
import { CustomButton } from '@/components/ui/custom-button';
import { CustomTextField } from '@/components/ui/custom-text-field';
import { CustomAppBar } from '@/components/ui/custom-app-bar';
import { useSnackbar } from '@/components/ui/custom-snackbar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function NewPasswordScreen() {
  const { t } = useTranslation();
  const { refreshProfile } = useAuth();
  const snack = useSnackbar();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (password.length < 8) return snack.showCustomSnackBar('Min 8 characters', true);
    if (password !== confirm) return snack.showCustomSnackBar('Passwords do not match', true);
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      snack.showCustomSnackBar('Password updated', false);
      router.replace('/(auth)/sign-in');
    } catch (err: any) {
      snack.showCustomSnackBar(err?.message ?? 'Failed', true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top']}>
      <CustomAppBar title={t('set_a_new_password')} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.iconWrap}>
            <LinearGradient
              colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Image source={Images.lock} style={styles.icon} contentFit="contain" />
          </View>
          <Text style={styles.title}>Set a new password</Text>
          <Text style={styles.subtitle}>Choose a strong password you haven't used before.</Text>
          <View style={styles.formCard}>
            <CustomTextField label={t('new_password')} placeholder="••••••••" value={password} onChangeText={setPassword} isPassword iconImage="lock" />
            <CustomTextField label={t('confirm_password')} placeholder="••••••••" value={confirm} onChangeText={setConfirm} isPassword iconImage="lock" />
            <CustomButton label={t('save')} onPress={onSubmit} loading={loading} style={{ marginTop: Spacing.small }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.large } as ViewStyle,
  iconWrap: {
    width: 124,
    height: 124,
    borderRadius: Radius.huge,
    alignSelf: 'center',
    marginBottom: Spacing.large,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOpacity: 0.32,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  } as ViewStyle,
  icon: { width: 64, height: 64, tintColor: '#FFFFFF' } as any,
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
