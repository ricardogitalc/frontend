"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter, usePathname } from "next/navigation";

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/verify-login",
  "/verify-register",
];

const protectedRoutes = ["/profile", "/dashboard"];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    console.log("RouteGuard - Verificando rota:", {
      isAuthenticated,
      pathname,
    });

    const isAuthRoute = [
      "/login",
      "/register",
      "/verify-login",
      "/verify-register",
    ].includes(pathname);
    const isProtectedRoute = protectedRoutes.includes(pathname);
    const isVerifyRegisterPath = pathname.startsWith("/verify-register/");

    if (isAuthenticated && isAuthRoute) {
      console.log(
        "Usuário autenticado tentando acessar rota de autenticação, redirecionando para home"
      );
      router.replace("/");
    } else if (!isAuthenticated && isProtectedRoute && !isVerifyRegisterPath) {
      console.log(
        "Usuário não autenticado tentando acessar rota protegida, redirecionando para login"
      );
      router.replace("/login");
    }
  }, [isAuthenticated, pathname, router, loading]);

  return children;
}
