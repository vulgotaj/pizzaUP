import { StyleSheet, View, Text, KeyboardAvoidingView, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { colors, fontSize, spacing, borderRadius } from '../../constants/theme';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from "@/services/api";
import { Order } from '@/types';
import { useRouter } from 'expo-router';


export default function Dashboard(){
  const { signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [tableNumber, setTableNumber] = useState("");
  const [loading, setLoading] = useState(false);


  async function handleOpenTable(){
    if(!tableNumber){
      Alert.alert("Atenção", "Digite um número de mesa válido.")
      return;
    }

    const table = parseInt(tableNumber)

    if(isNaN(table) || table <= 0){
      Alert.alert("Atenção", "Digite um número de mesa válido.")
      return;
    }

    try{
      setLoading(true)

      const response = await api.post<Order>("/order", {
        table: table,
      });

      router.push({
        pathname: "/(authenticated)/order",
        params: { table: response.data.table.toString(), order_id: response.data.id }
      });

      setTableNumber("");
    }catch(error){
      console.log(error)
      Alert.alert("Error", "Falha ao abrir mesa, tente novamente")
    }finally{
      setLoading(false);
    }
  }

  return(
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
            <TouchableOpacity style={styles.signOutButton}>
              <Text style={styles.signOutText}>Sair</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>

            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>
                pizza<Text style={styles.logoBrand}>UP</Text>
              </Text>
            </View>

            <Text style={styles.title}>Novo pedido</Text>
            <Input
              placeholder="Número da mesa..."
              style={styles.input}
              placeholderTextColor={colors.gray}
              value={tableNumber}
              onChangeText={setTableNumber}
              keyboardType="numeric"
            />

            <Button title="Abrir mesa" onPress={handleOpenTable} />

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  signOutButton: {
    backgroundColor: colors.red,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  signOutText: {
    color: colors.primary,
    fontSize: fontSize.md
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: spacing.xl
  },
  logoText: {
    fontSize: 34,
    fontWeight: "bold",
    color: colors.primary,
  },
  logoBrand: {
    color: colors.brand,
  },
  title: {
    fontSize: fontSize.xl,
    color: colors.primary,
    textAlign: "center",
    marginBottom: spacing.md
  },
  input: {
    marginBottom: spacing.md
  }
})