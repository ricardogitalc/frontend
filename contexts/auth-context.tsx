"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";
import { destroyCookie } from "nookies";
import { authEvents } from "@/hooks/auth-events";
import { User } from "@/types/types";
import { AuthContextType } from "@/interfaces/interfaces";

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
};

type AuthAction =
  | { type: "INITIALIZE" | "LOGOUT" }
  | { type: "LOGIN"; payload: User }
  | { type: "SET_AUTH"; payload: AuthState };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "INITIALIZE":
      return { ...state, isInitialized: true };
    case "LOGIN":
      return {
        user: action.payload,
        isAuthenticated: true,
        isInitialized: true,
      };
    case "LOGOUT":
      return {
        ...initialState,
        isInitialized: true,
      };
    case "SET_AUTH":
      return { ...action.payload };
    default:
      return state;
  }
}

const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();
  const isCheckingAuth = useRef(false);

  // Remover verificação manual de pathname pois agora é feita no middleware
  const checkAuth = useCallback(async () => {
    if (isCheckingAuth.current) return;
    isCheckingAuth.current = true;

    try {
      const response = await api.get("/auth/me");
      dispatch({
        type: "SET_AUTH",
        payload: {
          user: response.data,
          isAuthenticated: true,
          isInitialized: true,
        },
      });
    } catch (error: any) {
      dispatch({ type: "LOGOUT" });
      if (error.response?.status === 401) {
        destroyCookie(undefined, "auth.accessToken");
      }
    } finally {
      isCheckingAuth.current = false;
    }
  }, []);

  useEffect(() => {
    if (!state.isAuthenticated) {
      checkAuth();
    } else {
      dispatch({ type: "INITIALIZE" });
    }
  }, [checkAuth, state.isAuthenticated]);

  useEffect(() => {
    const unsubscribe = authEvents.subscribe(() => {
      dispatch({ type: "LOGOUT" });
    });
    return () => unsubscribe();
  }, []);

  const login = useCallback((userData: User) => {
    console.log("[AuthContext] Login chamado com dados:", userData);
    if (!userData) {
      console.error("[AuthContext] Tentativa de login com dados inválidos");
      return;
    }

    dispatch({
      type: "SET_AUTH",
      payload: {
        user: userData,
        isAuthenticated: true,
        isInitialized: true,
      },
    });
    console.log("[AuthContext] Estado atualizado após login");
  }, []);

  const logout = useCallback(async () => {
    await api.post("/auth/logout");
    dispatch({ type: "LOGOUT" });
    authEvents.emit();
    window.location.href = "/login";
  }, []);

  const refreshAuth = useCallback(async () => {
    console.log("[AuthContext] Iniciando refreshAuth");
    try {
      const response = await api.get("/auth/me");
      console.log("[AuthContext] Dados do usuário obtidos:", response.data);

      dispatch({
        type: "SET_AUTH",
        payload: {
          user: response.data,
          isAuthenticated: true,
          isInitialized: true,
        },
      });
      return true;
    } catch (error) {
      console.error("[AuthContext] Erro ao atualizar autenticação:", error);
      return false;
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      ...state,
      loading: !state.isInitialized,
      login,
      logout,
      refreshAuth,
    }),
    [state, login, logout, refreshAuth]
  );

  if (!state.isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
