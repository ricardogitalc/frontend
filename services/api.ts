// ui-next/lib/api.ts

import axios from "axios";
import { parseCookies, destroyCookie, setCookie } from "nookies"; // Adicionar destroyCookie e setCookie
import { authEvents } from "../hooks/auth-events";

export interface AuthResponse {
  user?: any;
  message?: string;
  verificationToken?: string;
  verificationLink?: string;
  error?: string;
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Importante para enviar cookies
});

api.interceptors.request.use(
  (config) => {
    const cookies = parseCookies();
    const token = cookies["auth.accessToken"];

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => {
    // Salvar tokens nos cookies quando recebidos
    if (response.data?.accessToken) {
      setCookie(null, "accessToken", response.data.accessToken, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
    }
    return response;
  },
  async (error) => {
    const isUnauthorized = error.response?.status === 401;
    const isTokenError =
      isUnauthorized &&
      (error.response?.data?.message?.includes("expired") ||
        error.response?.data?.message?.includes("invalid") ||
        error.response?.data?.message?.includes("Unauthorized"));

    if (isTokenError) {
      // Emitir evento de autenticação para forçar logout
      authEvents.emit();
    }

    return Promise.reject(error);
  }
);

// Auth API methods
export const authApi = {
  register: async (data: {
    email: string;
    confirmEmail: string;
    firstName: string;
    lastName: string;
    whatsapp?: string;
  }): Promise<AuthResponse> => {
    try {
      const response = await api.post("/auth/register", data);
      return response.data;
    } catch (error: any) {
      return {
        error: error.response?.data?.message || "Ocorreu um erro inesperado",
      };
    }
  },

  login: async (email: string): Promise<AuthResponse> => {
    try {
      const response = await api.post("/auth/login", { email });
      return response.data;
    } catch (error: any) {
      return {
        error: error.response?.data?.message || "Ocorreu um erro inesperado",
      };
    }
  },

  googleAuth: async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay de 1 segundo
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  },

  verifyEmail: async (token: string): Promise<AuthResponse> => {
    try {
      const response = await api.get(`/auth/verify-register?token=${token}`);
      return response.data;
    } catch (error: any) {
      return {
        error: error.response?.data?.message || "Erro ao verificar email",
      };
    }
  },

  updateProfile: async (userId: string, data: any): Promise<AuthResponse> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay de 1 segundo
      const response = await api.patch(`/auth/users/${userId}`, data);
      return response.data;
    } catch (error: any) {
      return {
        error: error.response?.data?.message || "Erro ao atualizar perfil",
      };
    }
  },
};

export default api;
