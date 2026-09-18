import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Images } from '@/constants/images';
import { CustomAppBar } from '@/components/ui/custom-app-bar';
import { CustomCard } from '@/components/ui/custom-card';
import { CustomButton } from '@/components/ui/custom-button';
import { useSnackbar } from '@/components/ui/custom-snackbar';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  highlighted?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    period: 'mo',
    features: [
      'Up to 50 products',
      'Single store',
      'Basic analytics',
      'Email support',
      'Standard banner slots',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 29,
    period: 'mo',
    highlighted: true,
    features: [
      'Up to 500 products',
      'Multiple branches',
      'Advanced analytics',
      'Priority support',
      'Custom campaigns',
      'API access',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    period: 'mo',
    features: [
      'Unlimited products',
      'Unlimited branches',
      'Full analytics suite',
      '24/7 dedicated support',
      'AI insights',
      'Custom integrations',
      'White-label option',
    ],
  },
];

export default function BusinessScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const snack = useSnackbar();
  const [subscribingId, setSubscribingId] = useState<string | null>(null);

  const onSubscribe = (plan: Plan) => {
    setSubscribingId(plan.id);
    setTimeout(() => {
      setSubscribingId(null);
      snack.showCustomSnackBar('Subscribe coming soon', true);
    }, 400);
  };

  return (
    <View style={styles.container}>
      <CustomAppBar title={t('business_plan')} />
      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerWrap}>
          <Image source={Images.trial} style={styles.headerImg} />
          <Text style={styles.headerTitle}>Choose your plan</Text>
          <Text style={styles.headerDesc}>
            Upgrade to unlock more products, branches, and AI-powered insights.
          </Text>
        </View>

        {PLANS.map((plan) => (
          <CustomCard
            key={plan.id}
            style={StyleSheet.flatten([styles.planCard, plan.highlighted && styles.planCardHighlighted])}
          >
            {plan.highlighted ? (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>Most Popular</Text>
              </View>
            ) : null}
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plan.name}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.currency}>$</Text>
                <Text style={styles.price}>{plan.price}</Text>
                <Text style={styles.period}>/{plan.period}</Text>
              </View>
            </View>
            {plan.features.map((f) => (
              <View key={f} style={styles.featureRow}>
                <Image source={Images.checked} style={styles.featureIcon} />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
            <CustomButton
              label="Subscribe"
              variant={plan.highlighted ? 'primary' : 'outline'}
              onPress={() => onSubscribe(plan)}
              loading={subscribingId === plan.id}
              style={{ marginTop: Spacing.default }}
            />
          </CustomCard>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background } as ViewStyle,
  body: { padding: Spacing.default, gap: Spacing.default } as any,
  headerWrap: { alignItems: 'center', paddingVertical: Spacing.default, paddingHorizontal: Spacing.large } as ViewStyle,
  headerImg: { width: 80, height: 80, marginBottom: Spacing.default } as any,
  headerTitle: { fontSize: FontSize.large, fontWeight: FontWeight.bold as any, color: Colors.textPrimary, marginBottom: Spacing.extraSmall } as any,
  headerDesc: { fontSize: FontSize.small, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18 } as any,
  planCard: { position: 'relative', marginBottom: 0 } as ViewStyle,
  planCardHighlighted: { borderWidth: 1.5, borderColor: Colors.primary } as ViewStyle,
  popularBadge: { position: 'absolute', top: -10, right: Spacing.default, backgroundColor: Colors.primary, paddingHorizontal: Spacing.small, paddingVertical: 3, borderRadius: Radius.small } as ViewStyle,
  popularText: { color: '#FFFFFF', fontSize: FontSize.extraSmall, fontWeight: FontWeight.bold as any } as any,
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: Spacing.default } as ViewStyle,
  planName: { fontSize: FontSize.medium, fontWeight: FontWeight.bold as any, color: Colors.textPrimary } as any,
  priceRow: { flexDirection: 'row', alignItems: 'baseline' } as ViewStyle,
  currency: { fontSize: FontSize.default, color: Colors.textPrimary, fontWeight: FontWeight.bold as any } as any,
  price: { fontSize: FontSize.huge, fontWeight: FontWeight.black as any, color: Colors.textPrimary } as any,
  period: { fontSize: FontSize.small, color: Colors.textMuted, marginLeft: 2 } as any,
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.small, paddingVertical: Spacing.extraSmall } as ViewStyle,
  featureIcon: { width: 16, height: 16 } as any,
  featureText: { fontSize: FontSize.small, color: Colors.textSecondary, flex: 1 } as any,
});
