import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { Images } from '@/constants/images';
import { CustomAppBar } from '@/components/ui/custom-app-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { useSnackbar } from '@/components/ui/custom-snackbar';

export default function AdsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const snack = useSnackbar();

  return (
    <View style={styles.container}>
      <CustomAppBar title={t('advertisement')} />
      <View style={[styles.body, { paddingBottom: insets.bottom + 32 }]}>
        <EmptyState
          image={Images.adsMenu}
          title="No advertisements yet"
          description="Reach more customers by promoting your store with targeted ads."
          ctaLabel="Create Ad"
          onCtaPress={() => snack.showCustomSnackBar('Coming soon', true)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background } as ViewStyle,
  body: { flex: 1, padding: Spacing.default } as ViewStyle,
});
