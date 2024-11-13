"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import api from "@/services/api";
import { useRouter, usePathname } from "next/navigation";
import { destroyCookie } from "nookies";
import { authEvents } from "@/hooks/auth-events";
import { User } from "@/types";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const isCheckingAuth = useRef(false);

  const checkAuth = useCallback(async () => {
    if (isCheckingAuth.current) return;
    isCheckingAuth.current = true;

    console.log("Iniciando verificação de autenticação...");

    try {
      const response = await api.get("/auth/me");

      if (response.data) {
        console.log("Usuário autenticado:", response.data);
        setUser(response.data);
        setIsAuthenticated(true);
      }
    } catch (error: any) {
      console.error("Erro na verificação de autenticação:", error);
      setUser(null);
      setIsAuthenticated(false);

      if (error.response?.status === 401) {
        destroyCookie(undefined, "auth.accessToken");

        const currentPath = window.location.pathname;
        const publicRoutes = [
          "/",
          "/login",
          "/register",
          "/verify-login",
          "/verify-register",
        ];

        // Só redireciona para login se não estiver em uma rota pública
        if (
          !publicRoutes.includes(currentPath) &&
          !currentPath.includes("/verify-register/")
        ) {
          router.replace("/login?error=session_expired");
        }
      }
    } finally {
      setIsInitialized(true);
      isCheckingAuth.current = false;
      console.log("Verificação de autenticação concluída.");
    }
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) {
      checkAuth();
    } else {
      setIsInitialized(true);
    }
  }, [checkAuth, isAuthenticated]);

  // Adicionar listener para eventos de autenticação
  useEffect(() => {
    const unsubscribe = authEvents.subscribe(() => {
      setUser(null);
      setIsAuthenticated(false);
    });

    return () => unsubscribe();
  }, []);

  // Modificar o login para emitir evento
  const login = useCallback(
    (userData: User) => {
      console.log("Usuário logado:", userData);
      setUser(userData);
      setIsAuthenticated(true);
      setIsInitialized(true);
      authEvents.emit();
      // Resetar quaisquer mensagens de erro de sessão expirada
      if (window.location.search.includes("error=session_expired")) {
        router.replace(window.location.pathname);
      }
    },
    [router]
  );

  // Modificar o logout para emitir evento
  const logout = async () => {
    try {
      console.log("Usuário deslogando...");
      await api.post("/auth/logout");
      setUser(null);
      setIsAuthenticated(false);
      authEvents.emit();
      window.location.href = "/login";
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const refreshAuth = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading: !isInitialized,
        login,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
