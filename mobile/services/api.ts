import axios from 'axios';
import { API_CONFIG } from '../config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    contentType: 'application/json',
  }
})

// Interceptor para adicionar o token em todas as requisições

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("@token:pizzaUP");

    if(token){
      config.headers.Authorization = `Bearer ${token}`
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if(error.response?.status === 401){
      await AsyncStorage.removeItem("@token:pizzaUP");
    }

    return Promise.reject(error);
  }
)

export default api;