import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Layout, Radius, Spacing } from '@/constants/theme';
import { Images } from '@/constants/images';

interface CustomTextFieldProps extends Omit<TextInputProps, 'placeholder'> {
  label?: string;
  placeholder?: string;
  required?: boolean;
  icon?: keyof typeof Ionicons.glyphMap | React.ReactNode;
  iconImage?: keyof typeof Images;
  isPassword?: boolean;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  prefix?: string;
  onIconPress?: () => void;
}

export function CustomTextField({
  label,
  placeholder,
  required = false,
  icon,
  iconImage,
  isPassword = false,
  error,
  containerStyle,
  inputStyle,
  prefix,
  onIconPress,
  ...rest
}: CustomTextFieldProps) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const Icon = icon as any;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}
      <View
        style={[
          styles.inputWrap,
          focused && styles.inputWrapFocused,
          error && styles.inputWrapError,
        ]}
      >
        {iconImage ? (
          <Image source={Images[iconImage]} style={styles.iconImage} resizeMode="contain" />
        ) : null}
        {Icon ? (
          <TouchableWithoutFeedback onPress={onIconPress} disabled={!onIconPress}>
            <Ionicons
              name={Icon}
              size={20}
              color={focused ? Colors.primary : Colors.textMuted}
              style={styles.icon}
            />
          </TouchableWithoutFeedback>
        ) : null}
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          {...rest}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={isPassword && !show}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={[styles.input, inputStyle]}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {isPassword ? (
          <TouchableWithoutFeedback onPress={() => setShow((s) => !s)}>
            <Ionicons
              name={show ? 'eye-off' : 'eye'}
              size={20}
              color={focused ? Colors.primary : Colors.textMuted}
              style={styles.icon}
            />
          </TouchableWithoutFeedback>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.default,
  } as ViewStyle,
  label: {
    fontSize: FontSize.small,
    color: Colors.textSecondary,
    marginBottom: Spacing.extraSmall,
    fontWeight: FontWeight.semiBold as TextStyle['fontWeight'],
    letterSpacing: 0.2,
  } as TextStyle,
  required: {
    color: Colors.danger,
  } as TextStyle,
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Layout.inputHeight,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.default,
    paddingHorizontal: Spacing.default,
    backgroundColor: Colors.surfaceAlt,
    gap: Spacing.small,
  } as ViewStyle,
  inputWrapFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
    shadowColor: Colors.primary,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  } as ViewStyle,
  inputWrapError: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerSoft,
  } as ViewStyle,
  icon: {
    marginRight: Spacing.extraSmall,
  } as TextStyle,
  iconImage: {
    width: 20,
    height: 20,
    marginRight: Spacing.small,
  } as any,
  prefix: {
    fontSize: FontSize.default,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium as TextStyle['fontWeight'],
  } as TextStyle,
  input: {
    flex: 1,
    fontSize: FontSize.default,
    color: Colors.textPrimary,
    height: '100%',
    padding: 0,
  } as TextStyle,
  errorText: {
    color: Colors.danger,
    fontSize: FontSize.extraSmall,
    marginTop: Spacing.extraSmall,
    marginLeft: Spacing.extraSmall,
    fontWeight: FontWeight.medium as TextStyle['fontWeight'],
  } as TextStyle,
});
