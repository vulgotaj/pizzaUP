import { Item } from '@/types';
import Ionicons from '@react-native-vector-icons/ionicons';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, spacing, fontSize, fonts } from '@/constants/theme';
import { formatPrice } from '@/utils/format';

interface OrderItemProps{
  item: Item;
  onRemove: (item_id: string) => Promise<void>
}

export function OrderItem({ item, onRemove }: OrderItemProps) {
  return(
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.productName}>{item.product?.name}</Text>
        <Text style={styles.productDetail}>{item.amount}x - {formatPrice(item.product.price)}</Text>
      </View>

      <Pressable style={styles.deleteButton} onPress={ () => onRemove(item.id) }>
        <Ionicons name="trash" size={20} color={colors.red} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 10,
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
    fontFamily: fonts.semibold,
    color: colors.primary,
    fontSize: fontSize.md,
    marginBottom: 4,
  },
  productDetail: {
    fontFamily: fonts.body,
    color: colors.gray,
  },
  deleteButton: {
    backgroundColor: colors.dangerBackground,
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 6,
  }
})