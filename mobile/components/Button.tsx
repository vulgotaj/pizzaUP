import { Text, TouchableOpacity, StyleSheet, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { colors, fontSize, spacing, borderRadius, fonts } from '@/constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

export function Button({ 
  title, 
  variant = 'primary', 
  loading = false, 
  disabled, 
  style,  
  ...props }: ButtonProps) {

  const backgroundColor = variant === "primary" ? colors.action : "transparent";

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      accessibilityState={{ disabled: !!disabled || loading, busy: loading }}
      style={[
        { backgroundColor },
        styles.button,
        variant === "secondary" && styles.secondary,
        (disabled || loading) && styles.buttonDisabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={colors.onAction} />
      ) : (
        <Text style={[styles.buttonText, variant === "secondary" && { color: colors.brand }]}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
  },
  secondary: {
    borderWidth: 1,
    borderColor: colors.controlBorder,
  },
  buttonDisabled: {
    backgroundColor: colors.disabledBackground,
  },
  buttonText: {
    fontFamily: fonts.semibold,
    color: colors.onAction,
    fontSize: fontSize.lg,
  }
})
