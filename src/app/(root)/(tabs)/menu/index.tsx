import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Images } from '@/constants/images';
import { useAuth } from '@/hooks/useAuth';
import { CustomCard } from '@/components/ui/custom-card';

interface MenuItem {
  icon: any;
  label: string;
  route?: string;
  group?: 'business' | 'tools' | 'preferences' | 'account';
}

const ITEMS: MenuItem[] = [
  // Business
  { icon: Images.coupon, label: 'Coupons', route: '/coupons', group: 'business' },
  { icon: Images.campaign, label: 'Campaigns', route: '/campaigns', group: 'business' },
  { icon: Images.bannerIcon, label: 'Banners', route: '/banners', group: 'business' },
  { icon: Images.adsMenu, label: 'Advertisements', route: '/ads', group: 'business' },
  { icon: Images.disbursement, label: 'Disbursements', route: '/disbursements', group: 'business' },
  { icon: Images.deliveryMan, label: 'Delivery Men', route: '/deliverymen', group: 'business' },
  // Tools
  { icon: Images.categories, label: 'Categories', route: '/categories', group: 'tools' },
  { icon: Images.addon, label: 'Addons', route: '/addons', group: 'tools' },
  { icon: Images.chat, label: 'Chat', route: '/chat', group: 'tools' },
  { icon: Images.useAi, label: 'AI Assistant', route: '/ai', group: 'tools' },
  { icon: Images.transactionReportIcon, label: 'Reports', route: '/reports', group: 'tools' },
  // Preferences
  { icon: Images.language, label: 'Language', route: '/language', group: 'preferences' },
  { icon: Images.settings, label: 'Settings', route: '/settings', group: 'preferences' },
  { icon: Images.support, label: 'Support', route: '/support', group: 'preferences' },
  { icon: Images.terms, label: 'Terms & Conditions', route: '/terms', group: 'preferences' },
  { icon: Images.policy, label: 'Privacy Policy', route: '/privacy', group: 'preferences' },
  // Account
  { icon: Images.logOut, label: 'Log Out', group: 'account' },
];

const GROUP_LABELS: Record<string, string> = {
  business: 'Business',
  tools: 'Tools',
  preferences: 'Preferences',
  account: 'Account',
};

const GROUP_ICONS: Record<string, string> = {
  business: 'storefront-outline',
  tools: 'construct-outline',
  preferences: 'settings-2-outline',
  account: 'log-out-outline',
};

export default function MenuScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { profile, store, signOut } = useAuth();

  const groups = ['business', 'tools', 'preferences', 'account'] as const;

  const handlePress = (item: MenuItem) => {
    if (item.label === 'Log Out') {
      signOut();
      router.replace('/(auth)/sign-in');
      return;
    }
    if (item.route) router.push(item.route as any);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingTop: 0, paddingBottom: insets.bottom + 140 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Gradient profile hero */}
      <LinearGradient
        colors={[Colors.heroGradientStart, Colors.heroGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.profileHero, { paddingTop: insets.top + Spacing.large, borderBottomLeftRadius: Radius.extraOverLarge, borderBottomRightRadius: Radius.extraOverLarge }]}
      >
        <View style={styles.profileBlob1} />
        <View style={styles.profileBlob2} />
        <Text style={styles.menuEyebrow}>More</Text>
        <Text style={styles.menuTitle}>{t('menu')}</Text>

        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitial}>{profile?.full_name?.charAt(0)?.toUpperCase() ?? 'V'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName} numberOfLines={1}>{profile?.full_name ?? 'Vendor'}</Text>
            <Text style={styles.profileEmail} numberOfLines={1}>{profile?.email ?? ''}</Text>
            <View style={styles.profileStoreWrap}>
              <Ionicons name="storefront" size={11} color="#FFFFFF" />
              <Text style={styles.profileStore} numberOfLines={1}>{store?.name ?? 'No store linked'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/settings')} activeOpacity={0.85}>
            <Image source={Images.edit} style={styles.editIcon} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {groups.map((g) => (
        <View key={g} style={styles.group}>
          <View style={styles.groupLabelRow}>
            <Ionicons name={GROUP_ICONS[g] as any} size={14} color={Colors.primary} />
            <Text style={styles.groupLabel}>{GROUP_LABELS[g]}</Text>
          </View>
          <CustomCard padded={false}>
            {ITEMS.filter((i) => i.group === g).map((item, idx, arr) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuRow, idx < arr.length - 1 && styles.menuRowBordered, item.label === 'Log Out' && styles.menuRowLogout]}
                onPress={() => handlePress(item)}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconWrap, item.label === 'Log Out' && styles.menuIconWrapLogout]}>
                  <Image source={item.icon} style={[styles.menuIcon, item.label === 'Log Out' && styles.menuIconLogout]} />
                </View>
                <Text style={[styles.menuLabel, item.label === 'Log Out' && styles.menuLabelLogout]}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </CustomCard>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background } as ViewStyle,
  content: { padding: 0 } as ViewStyle,
  profileHero: {
    paddingHorizontal: Spacing.default,
    paddingBottom: Spacing.extraLarge,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: Spacing.default,
  } as ViewStyle,
  profileBlob1: {
    position: 'absolute',
    top: -40,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.14)',
  } as ViewStyle,
  profileBlob2: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.10)',
  } as ViewStyle,
  menuEyebrow: { fontSize: FontSize.small, color: 'rgba(255,255,255,0.85)', fontWeight: FontWeight.semiBold as any, letterSpacing: 1, textTransform: 'uppercase' } as any,
  menuTitle: { fontSize: FontSize.display, fontWeight: FontWeight.black as any, color: '#FFFFFF', letterSpacing: -0.8, marginBottom: Spacing.default } as any,
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.default,
    backgroundColor: 'rgba(255,255,255,0.16)',
    padding: Spacing.default,
    borderRadius: Radius.large,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  } as ViewStyle,
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  profileInitial: { fontSize: FontSize.extraLarge, fontWeight: FontWeight.black as any, color: '#FFFFFF' } as any,
  profileName: { fontSize: FontSize.medium, fontWeight: FontWeight.bold as any, color: '#FFFFFF', letterSpacing: -0.2 } as any,
  profileEmail: { fontSize: FontSize.small, color: 'rgba(255,255,255,0.85)', marginTop: 2 } as any,
  profileStoreWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' } as ViewStyle,
  profileStore: { fontSize: FontSize.extraSmall, color: 'rgba(255,255,255,0.9)', fontWeight: FontWeight.semiBold as any } as any,
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  } as ViewStyle,
  editIcon: { width: 16, height: 16, tintColor: '#FFFFFF' } as any,
  group: { marginBottom: Spacing.large, paddingHorizontal: Spacing.default } as ViewStyle,
  groupLabelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.extraSmall, marginBottom: Spacing.small, marginLeft: Spacing.extraSmall } as ViewStyle,
  groupLabel: { fontSize: FontSize.extraSmall, fontWeight: FontWeight.bold as any, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 } as any,
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.default, gap: Spacing.default } as ViewStyle,
  menuRowBordered: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border } as ViewStyle,
  menuRowLogout: {} as ViewStyle,
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  menuIconWrapLogout: { backgroundColor: Colors.dangerSoft } as ViewStyle,
  menuIcon: { width: 20, height: 20 } as any,
  menuIconLogout: { tintColor: Colors.danger } as any,
  menuLabel: { flex: 1, fontSize: FontSize.default, color: Colors.textPrimary, fontWeight: FontWeight.medium as any } as any,
  menuLabelLogout: { color: Colors.danger, fontWeight: FontWeight.bold as any } as any,
});
