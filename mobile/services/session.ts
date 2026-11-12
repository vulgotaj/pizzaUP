import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const TOKEN_KEY = 'pizzaup.session';
let token: string | null = null;
let persistence = Promise.resolve();
const listeners = new Set<() => void>();
export function getSessionToken() { return token; }
export function onSessionInvalidated(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
function persist(operation: () => Promise<void>) {
  const next = persistence.then(operation, operation);
  persistence = next.catch(() => {});
  return next;
}
export async function discardLegacySession() {
  await AsyncStorage.multiRemove(['@token:pizzaUP', '@user:pizzaUP']);
}
export async function restoreSessionToken() {
  // SecureStore has no web backend. Web sessions stay in memory only.
  token = Platform.OS === 'web' ? null : await SecureStore.getItemAsync(TOKEN_KEY);
  return token;
}
export async function saveSessionToken(value: string) {
  token = value;
  await persist(async () => {
    if (Platform.OS !== 'web') {
      await SecureStore.setItemAsync(TOKEN_KEY, value, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
    }
  });
}
export async function clearSession() {
  token = null;
  listeners.forEach(listener => listener());
  await persist(async () => {
    if (Platform.OS !== 'web') await SecureStore.deleteItemAsync(TOKEN_KEY);
    await discardLegacySession();
  });
}
