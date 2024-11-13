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
  const pathname = usePathname();
  const isCheckingAuth = useRef(false);

  const checkAuth = useCallback(async () => {
    if (isCheckingAuth.current) return;
    isCheckingAuth.current = true;

    try {
      const response = await api.get("/auth/me");

      if (response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
      }
    } catch (error: any) {
      setUser(null);
      setIsAuthenticated(false);

      if (error.response?.status === 401) {
        destroyCookie(undefined, "auth.accessToken");

        const currentPath = window.location.pathname;
        const publicRoutes = [
          "/login",
          "/register",
          "/verify-login",
          "/verify-register",
        ];

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
    }
  }, [router]);

  useEffect(() => {
    const currentPath = pathname;
    const publicRoutes = [
      "/login",
      "/register",
      "/verify-login",
      "/verify-register",
    ];
    const isVerifyRegisterPath = pathname.startsWith("/verify-register/");

    if (publicRoutes.includes(currentPath) || isVerifyRegisterPath) {
      setIsInitialized(true);
      return;
    }

    if (!isAuthenticated) {
      checkAuth();
    } else {
      setIsInitialized(true);
    }
  }, [checkAuth, pathname, isAuthenticated]);

  // Controle de redirecionamentos
  useEffect(() => {
    if (!isInitialized) return;

    const publicRoutes = [
      "/login",
      "/register",
      "/verify-login",
      "/verify-register",
    ];
    const protectedRoutes = ["/profile", "/dashboard"];

    if (isAuthenticated && publicRoutes.includes(pathname)) {
      router.replace("/");
    } else if (!isAuthenticated && protectedRoutes.includes(pathname)) {
      router.replace("/login");
    }
  }, [isAuthenticated, pathname, router, isInitialized]);

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
