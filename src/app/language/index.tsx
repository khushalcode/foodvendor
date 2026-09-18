import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Images } from '@/constants/images';
import { CustomAppBar } from '@/components/ui/custom-app-bar';
import { CustomCard } from '@/components/ui/custom-card';
import { changeLanguage, SUPPORTED_LANGUAGES } from '@/locale/i18n';
import i18next from 'i18next';
import { useSnackbar } from '@/components/ui/custom-snackbar';

type Lang = (typeof SUPPORTED_LANGUAGES)[number];

export default function LanguageScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const snack = useSnackbar();
  const [current, setCurrent] = useState<string>(i18next.language || 'en');

  useEffect(() => {
    setCurrent(i18next.language || 'en');
  }, []);

  // Map a language's `flag` slug to the corresponding required asset.
  const flagImage = (flag: string): any => {
    switch (flag) {
      case 'english': return Images.flagEnglish;
      case 'arabic': return Images.flagArabic;
      case 'bangla': return Images.flagBangla;
      case 'spanish': return Images.flagSpanish;
      case 'french': return Images.flagFrench;
      default: return Images.language;
    }
  };

  const onSelect = async (lang: Lang) => {
    try {
      await changeLanguage(lang.code);
      setCurrent(lang.code);
      snack.showCustomSnackBar('Language updated', false);
    } catch (err: any) {
      snack.showCustomSnackBar(err?.message ?? 'Failed', true);
    }
  };

  return (
    <View style={styles.container}>
      <CustomAppBar title={t('language')} />
      <View style={styles.body}>
        <FlatList
          data={SUPPORTED_LANGUAGES}
          keyExtractor={(i) => i.code}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 32 }]}
          renderItem={({ item }) => {
            const selected = current === item.code;
            return (
              <TouchableOpacity onPress={() => onSelect(item)} activeOpacity={0.85}>
                <CustomCard style={StyleSheet.flatten([styles.row, selected && styles.rowSelected])}>
                  <Image source={flagImage(item.flag)} style={styles.flag} resizeMode="contain" />
                  <Text style={styles.name}>{item.name}</Text>
                  {selected ? (
                    <Ionicons name="radio-button-on" size={22} color={Colors.primary} />
                  ) : (
                    <Ionicons name="radio-button-off" size={22} color={Colors.textMuted} />
                  )}
                </CustomCard>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background } as ViewStyle,
  body: { flex: 1 } as ViewStyle,
  list: { padding: Spacing.default, gap: Spacing.small } as any,
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.default, marginBottom: 0 } as ViewStyle,
  rowSelected: { borderColor: Colors.primary, borderWidth: 1.5 } as ViewStyle,
  flag: { width: 32, height: 24, borderRadius: Radius.extraSmall } as any,
  name: { flex: 1, fontSize: FontSize.default, color: Colors.textPrimary, fontWeight: FontWeight.medium as any } as any,
});
