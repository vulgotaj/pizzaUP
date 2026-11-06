import { colors, fontSize, spacing } from '../constants/theme';
import { View, Text, KeyboardAvoidingView, ScrollView, StyleSheet, Platform } from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useState } from 'react';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  function handleLogin(){
    alert(email + ' - ' + password);
  }

  return(
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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