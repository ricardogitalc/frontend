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
  (error) => {
    const isTokenError =
      error.response?.status === 401 &&
      (error.response?.data?.message?.includes("expired") ||
        error.response?.data?.message?.includes("invalid"));

    if (isTokenError) {
      authEvents.emit(); // Emite evento quando token expira
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
        error: error.response?.data?.message,
      };
    }
  },

  login: async (email: string): Promise<AuthResponse> => {
    try {
      const response = await api.post("/auth/login", { email });
      return response.data;
    } catch (error: any) {
      return {
        error: error.response?.data?.message,
      };
    }
  },

  googleAuth: () => {
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
};

export default api;
