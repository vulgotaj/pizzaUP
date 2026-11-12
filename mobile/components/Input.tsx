import { View, TextInput, Text, StyleSheet } from 'react-native';
import { colors, fontSize, spacing, borderRadius, fonts } from '@/constants/theme';

interface InputProps extends React.ComponentProps<typeof TextInput> {
  label?: string;
}

export function Input({ label, style, ...rest }: InputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput placeholderTextColor={colors.gray} selectionColor={colors.brand} style={[styles.input, style]} {...rest}/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    fontFamily: fonts.body,
    color: colors.primary,
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
  },
  input: {
    fontFamily: fonts.body,
    minHeight: 56,
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    color: colors.primary,
    borderWidth: 1,
    borderColor: colors.controlBorder,
    fontSize: fontSize.lg
  }
})