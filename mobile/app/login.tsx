import { colors, fontSize, spacing } from '../constants/theme';
import { View, Text, KeyboardAvoidingView, ScrollView, StyleSheet, Platform, Alert } from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  async function handleLogin(){

    if(!email.trim() || !password.trim()){
      Alert.alert("Atenção", "Preencha todos os campos!");
      return;
    }

    try{
      setLoading(true);
      await signIn(email, password);
      router.replace("/(authenticated)/dashboard");

    }catch(error){
      console.log(error);
      Alert.alert("Erro", "Ocorreu um erro ao fazer o login!");
    }finally{
      setLoading(false);
    }
  }

  return(
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={"padding"}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >

        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>
            pizza<Text style={styles.logoBrand}>UP</Text>
          </Text>
          <Text style={styles.logoSubtitle}>Garçom app</Text>
        </View>

        <View style={styles.formContainer}>
          <Input 
            label="Email" 
            placeholder="Digite seu email..." 
            placeholderTextColor={colors.primary}
            value={email}
            onChangeText={setEmail}
          />

          <Input 
            label="Senha" 
            placeholder="Digite sua senha..." 
            placeholderTextColor={colors.primary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Button 
            title="Acessar" 
            loading={loading}
            onPress={handleLogin}
          />
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1
  },
  scrollContent: {
    justifyContent: 'center',
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoText: {
    fontSize: 34,
    fontWeight: 'bold',
    color: colors.primary,
  },
  logoBrand: {
    color: colors.brand,
  },
  logoSubtitle: {
    color: colors.primary,
    fontSize: fontSize.lg
  },
  formContainer: {
    gap: spacing.md,
  }
})