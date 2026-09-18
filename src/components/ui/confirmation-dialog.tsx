import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Images } from '@/constants/images';
import { CustomButton } from './custom-button';

interface ConfirmationDialogProps {
  visible: boolean;
  title?: string;
  description?: string;
  icon?: 'warning' | 'delete' | 'caution' | 'pause' | 'resume' | 'attention';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  loading?: boolean;
  style?: ViewStyle;
}

const iconMap = {
  warning: Images.warning,
  delete: Images.deleteDialog,
  caution: Images.cautionDialog,
  pause: Images.pauseDialog,
  resume: Images.resumeDialog,
  attention: Images.attentionWarning,
};

export function ConfirmationDialog({
  visible,
  title = 'Are you sure?',
  description = '',
  icon = 'warning',
  confirmText = 'Yes',
  cancelText = 'No',
  onConfirm,
  onCancel,
  loading = false,
  style,
}: ConfirmationDialogProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={[styles.dialog, style]}>
          <View style={styles.iconWrap}>
            <Image source={iconMap[icon]} style={styles.icon as any} contentFit="contain" />
          </View>
          <Text style={styles.title}>{title}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
          <View style={styles.actions}>
            <CustomButton
              label={cancelText}
              variant="outline"
              onPress={onCancel}
              style={{ flex: 1 }}
            />
            <View style={{ width: Spacing.small }} />
            <CustomButton
              label={confirmText}
              variant={icon === 'delete' ? 'danger' : 'primary'}
              onPress={onConfirm}
              loading={loading}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 20, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.large,
  } as ViewStyle,
  dialog: {
    backgroundColor: Colors.card,
    borderRadius: Radius.extraOverLarge,
    padding: Spacing.extraLarge,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: Colors.shadowStrong,
    shadowOpacity: 0.4,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 16,
  } as ViewStyle,
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: Radius.huge,
    backgroundColor: Colors.primarySofter,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.default,
  } as ViewStyle,
  icon: {
    width: 60,
    height: 60,
  } as ViewStyle,
  title: {
    fontSize: FontSize.large,
    fontWeight: FontWeight.bold as any,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.small,
    letterSpacing: -0.2,
  } as any,
  description: {
    fontSize: FontSize.default,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.large,
    lineHeight: 22,
  } as any,
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  } as ViewStyle,
});
