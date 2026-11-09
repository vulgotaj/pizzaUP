import api from "../services/api";
import { createContext, useContext, useState, useEffect } from "react";
import { LoginResponse, User } from "../types/index";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthProviderProps{
  children: React.ReactNode;
}

interface AuthContextData{
  user: User | null;
  signed: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps){
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadStorageData(){
      try{
        const storedToken = await AsyncStorage.getItem("@token:pizzaUP");
        const storedUser = await AsyncStorage.getItem("@user:pizzaUP");

        if(storedToken && storedUser){
          setUser(JSON.parse(storedUser))
        }
      }catch(error){
        console.log(error);
      }finally{
        setLoading(false);
      }
    }

    loadStorageData();
  }, [])

  async function signIn(email: string, password: string){
    try{
      const response = await api.post<LoginResponse>("/session", {
        email: email,
        password: password
      })

      const { token, ...userData } = response.data;

      await AsyncStorage.setItem("@token:pizzaUP", token);
      await AsyncStorage.setItem("@user:pizzaUP", JSON.stringify(userData));

      setUser(userData);
    }catch(error: any){
      if(error.response?.data?.error){
        console.log(error.response?.data?.error);
        throw error;
      }

      console.log(error);
      throw error;
    }
  }

  async function signOut(){
    await AsyncStorage.removeItem("@token:pizzaUP");
    await AsyncStorage.removeItem("@user:pizzaUP");

    setUser(null);
  }

  return(
    <AuthContext value={{
      user,
      signed: !!user,
      loading,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext>
  )
}

export function useAuth(){
  const context = useContext(AuthContext);

  if(!context){
    throw new Error("Contexto não foi encontrado!")
  }

  return context;
}
