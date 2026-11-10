import { borderRadius, colors, fontSize, spacing } from '@/constants/theme';
import { View, Text, StyleSheet, Modal, Pressable, FlatList } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useState } from 'react';

interface SelectOptions{
  label: string;
  value: string;
}

interface SelectProps{
  label?: string;
  options: SelectOptions[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function Select({
  onValueChange,
  options,
  selectedValue,
  label,
  placeholder = "Selecione..."
}: SelectProps){

  const [modalVisible, setModalVisible] = useState(true);
  const selectedOption = options.find(opt => opt.value === selectedValue)
  const displayText = selectedOption?.label || placeholder

  function handleChange(value: string){
    onValueChange(value);
    setModalVisible(false);
  }

  return(
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Pressable
        style={styles.selectButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.selectText}>{displayText}</Text>
        <Ionicons name="chevron-down" size={14} color={colors.primary}/>
      </Pressable>

      <Modal 
        visible={modalVisible} 
        transparent 
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >

        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {label || "Selecione uma opção"}
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="logo-x" color={colors.red} size={20} />
              </Pressable>
            </View>

            <FlatList
              showsVerticalScrollIndicator={false}
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable style={styles.optionItem} onPress={() => handleChange(item.value)}>
                  <Text style={[styles.optionText, item.value === selectedValue && styles.optionSelected]}>{item.label}</Text>
                </Pressable>
              )}
            />

          </View>
        </Pressable>

      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingBottom: 8,
  },
  label: {
    color: colors.primary,
    fontSize: fontSize.lg,
    marginBottom: spacing.sm,
    fontWeight: "600",
  },
  selectButton: {
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderColor,
    height: 50,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: spacing.md
  },
  selectText: {
    color: colors.primary,
    flex: 1,
  },
  placeholderText: {
    color: colors.gray,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.background,
    width: "100%",
    maxHeight: "70%",
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: borderRadius.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor
  },
  modalTitle: {
    color: colors.primary,
    fontSize: fontSize.lg,
  },
  optionItem: {
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor: colors.borderColor,
    borderBottomWidth: 1,
  },
  optionText: {
    color: colors.primary,
  },
  optionSelected: {
    color: colors.green,
    fontWeight: "600",
  }
})
