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
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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

  const isVerificationRoute = useCallback(() => {
    const pathname = window.location.pathname;
    return (
      pathname.startsWith("/verify-login") ||
      pathname.startsWith("/verify-register")
    );
  }, []);

  const checkAuth = useCallback(async () => {
    if (isCheckingAuth.current) return;
    if (isVerificationRoute()) {
      dispatch({ type: "INITIALIZE" });
      return;
    }
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
  }, [isVerificationRoute]);

  useEffect(() => {
    if (!state.isAuthenticated) {
      checkAuth();
    } else {
      dispatch({ type: "INITIALIZE" });
    }
  }, [checkAuth, state.isAuthenticated]);

  useEffect(() => {
    const unsubscribe = authEvents.subscribe(() => {
      if (state.isAuthenticated) {
        dispatch({ type: "LOGOUT" });
        destroyCookie(undefined, "auth.accessToken");
        window.location.href = "/login?error=session_expired";
      }
    });
    return () => unsubscribe();
  }, [state.isAuthenticated]);

  const login = useCallback((userData: User) => {
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
  }, []);

  const logout = useCallback(async () => {
    await api.post("/auth/logout");
    dispatch({ type: "LOGOUT" });
    authEvents.emit();
    window.location.href = "/login";
  }, []);

  const refreshAuth = useCallback(async () => {
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
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
