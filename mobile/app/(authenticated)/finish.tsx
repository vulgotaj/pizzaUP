import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { colors, fontSize, spacing, fonts } from '@/constants/theme';
import api from '@/services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View, Text, KeyboardAvoidingView, ScrollView, Alert } from 'react-native';

export default function Finish(){
  const router = useRouter();
  const { order_id, table } = useLocalSearchParams<{
    order_id: string;
    table: string;
  }>();

  const [customer, setCustomer] = useState("")
  const [loading, setLoading] = useState(false);

  async function handleFinishOrder(){
    if (loading) return;
    try{
      setLoading(true)

      await api.put("/order/send", {
        order_id: order_id,
        name: customer ?? "Sem nome",
      })

      Alert.alert("Sucesso!", "Pedido enviado para a cozinha")

      router.dismissAll();
      router.replace("/(authenticated)/dashboard")
    }catch(error){
      console.log(error)
    }finally{
      setLoading(false);
    }
  }

  return(
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={"padding"}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

        <View style={styles.content}>
          <View>
            <Text style={styles.text}>Você deseja finalizar o pedido?</Text>
            <Text style={styles.table}>Mesa: {table}</Text>
          </View>

          <Input
            placeholder="Digite o nome do cliente..."
            placeholderTextColor={colors.gray}
            value={customer}
            onChangeText={setCustomer}
            maxLength={100}
          />

          <Button title="Finalizar pedido" onPress={handleFinishOrder} loading={loading}/>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: spacing.xl,
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  text: {
    fontFamily: fonts.heading,
    color: colors.brand,
    fontSize: fontSize.xxl,
    textAlign: "center"
  },
  table: {
    fontFamily: fonts.heading,
    color: colors.brand,
    fontSize: fontSize.xxl,
    textAlign: "center"
  }
})
