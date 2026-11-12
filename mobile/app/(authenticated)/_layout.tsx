import { Stack, useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect } from "react";
import { colors, fonts } from "@/constants/theme";

export default function AuthenticatedLayout(){
  const { loading, signed } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if(!loading && !signed){
      router.replace("/login");
    }
  }, [loading, signed, router])

  if(loading || !signed) {
    return null;
  }

  return(
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.brand,
        headerTitleStyle: {
          fontFamily: fonts.heading,
          fontSize: 24
        },
        headerShadowVisible: false 
      }}
    >
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="order" options={{ headerShown: false }} />
      <Stack.Screen
        name="finish"
        options={{
          headerShown: true,
          headerTitle: "Finalizar pedido!"
        }}
      />
    </Stack>
  )
  
}