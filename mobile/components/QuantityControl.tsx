import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, fontSize, spacing, borderRadius, fonts } from '@/constants/theme';

interface QuantityControlProps{
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function QuantityControl({
  quantity,
  onIncrement,
  onDecrement,
}: QuantityControlProps){
  return(
    <View style={styles.container}>
      <Pressable style={[styles.button, quantity <= 1 && { backgroundColor: colors.disabledBackground }]} onPress={onDecrement}>
        <Text style={styles.buttonText}>-</Text>
      </Pressable>
      <View style={styles.quantityContainer}>
        <Text style={styles.quantityText}>{quantity}</Text>
      </View>
      <Pressable style={styles.button} onPress={onIncrement}>
        <Text style={styles.buttonText}>+</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 0
  },
  button: {
    backgroundColor: "transparent",
    minWidth: 48,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.controlBorder,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  buttonText: {
    fontFamily: fonts.bold,
    color: colors.primary,
    fontSize: fontSize.xl,
  },
  quantityContainer: {
    alignSelf: "center",
    width: 44,
    alignItems: "center"
  },
  quantityText: {
    fontFamily: fonts.number,
    color: colors.primary,
    fontSize: fontSize.xl,
  }
})