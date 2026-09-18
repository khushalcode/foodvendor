import React, { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, TextInput, ViewStyle } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { CustomButton } from '@/components/ui/custom-button';
import { CustomAppBar } from '@/components/ui/custom-app-bar';
import { useSnackbar } from '@/components/ui/custom-snackbar';
import { useAuth } from '@/hooks/useAuth';

const CODE_LENGTH = 6;

export default function VerificationScreen() {
  const { t } = useTranslation();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { isConfigured } = useAuth();
  const snack = useSnackbar();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const refs = useRef<(TextInput | null)[]>([]);
  const [loading, setLoading] = useState(false);

  const setDigit = (i: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 1);
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    if (clean && i < CODE_LENGTH - 1) refs.current[i + 1]?.focus();
  };

  const onKey = (i: number, key: string) => {
    if (key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const onVerify = async () => {
    const code = digits.join('');
    if (code.length !== CODE_LENGTH) {
      return snack.showCustomSnackBar('Enter the 6-digit code', true);
    }
    if (!isConfigured) return Alert.alert('Supabase not configured');
    setLoading(true);
    try {
      snack.showCustomSnackBar('Verified!', false);
      router.push({ pathname: '/(auth)/new-password', params: { email, code } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top']}>
      <CustomAppBar title={t('verification')} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.codeBadge}>
            <LinearGradient
              colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.codeBadgeText}>6</Text>
          </View>
          <Text style={styles.title}>Enter verification code</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to <Text style={{ fontWeight: FontWeight.bold as any, color: Colors.primary }}>{email}</Text>
          </Text>
          <View style={styles.codeRow}>
            {digits.map((d, i) => (
              <TextInput
                key={i}
                ref={(r) => { refs.current[i] = r; }}
                value={d}
                onChangeText={(v) => setDigit(i, v)}
                onKeyPress={(e) => onKey(i, e.nativeEvent.key)}
                keyboardType="number-pad"
                maxLength={1}
                style={[styles.codeInput, d ? styles.codeInputFilled : null]}
                textContentType="oneTimeCode"
              />
            ))}
          </View>
          <CustomButton label={t('verify')} onPress={onVerify} loading={loading} style={{ marginTop: Spacing.extraLarge }} />
          <Text style={styles.resend}>Didn't receive code? <Text style={styles.resendLink}>Resend</Text></Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.large } as ViewStyle,
  codeBadge: {
    width: 96,
    height: 96,
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
  codeBadgeText: { fontSize: FontSize.display, fontWeight: FontWeight.black as any, color: '#FFFFFF' } as any,
  title: { fontSize: FontSize.display, fontWeight: FontWeight.black as any, color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.6 } as any,
  subtitle: { fontSize: FontSize.default, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.small, marginBottom: Spacing.extraLarge, lineHeight: 22, paddingHorizontal: Spacing.default } as any,
  codeRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.small } as ViewStyle,
  codeInput: {
    flex: 1,
    aspectRatio: 0.8,
    borderRadius: Radius.medium,
    borderWidth: 1.5,
    borderColor: Colors.border,
    textAlign: 'center',
    fontSize: FontSize.extraLarge,
    fontWeight: FontWeight.bold as any,
    color: Colors.textPrimary,
    backgroundColor: Colors.surfaceAlt,
  } as any,
  codeInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
    color: Colors.primaryDark,
  } as any,
  resend: { textAlign: 'center', marginTop: Spacing.large, color: Colors.textSecondary, fontSize: FontSize.default } as any,
  resendLink: { color: Colors.primary, fontWeight: FontWeight.bold as any } as any,
});
