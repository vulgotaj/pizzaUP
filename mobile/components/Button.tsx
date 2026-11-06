import { View, Text, TouchableOpacity, StyleSheet, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '../constants/theme';

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

  const backgroundColor = variant === "primary" ? colors.green : colors.brand;

  return (
    <TouchableOpacity
      style={[
        { backgroundColor },
        styles.button,
        (disabled || loading) && styles.buttonDisabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={colors.background} />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.background,
    fontSize: fontSize.lg,
    fontWeight: "600",
  }
})