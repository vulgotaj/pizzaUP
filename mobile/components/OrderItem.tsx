import { Item } from '@/types';
import Ionicons from '@react-native-vector-icons/ionicons';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, spacing, fontSize } from '@/constants/theme';
import { formatPrice } from '@/utils/format';

interface OrderItemProps{
  item: Item;
  onRemove: () => Promise<void>
}

export function OrderItem({ item, onRemove }: OrderItemProps) {
  return(
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.productName}>{item.product?.name}</Text>
        <Text style={styles.productDetail}>{item.amount}x - {formatPrice(item.product.price)}</Text>
      </View>

      <Pressable style={styles.deleteButton}>
        <Ionicons name="trash" size={20} color={colors.primary} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundInput,
    borderRadius: 8,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  content: {
    flex: 1,
  },
  productName: {
    color: colors.primary,
    fontSize: fontSize.md,
    marginBottom: 4,
  },
  productDetail: {
    color: colors.gray,
  },
  deleteButton: {
    backgroundColor: colors.red,
    padding: 8,
    borderRadius: 4,
  }
})