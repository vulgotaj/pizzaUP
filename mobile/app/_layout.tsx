import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../constants/theme';
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout(){
  return(
    <AuthProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(authenticated)" />
      </Stack>
    </AuthProvider>
  )
}