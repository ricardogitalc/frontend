"use client";

import { useEffect, useReducer, useCallback, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/services/api";
import { authEvents } from "@/hooks/auth-events";
import { useAuth } from "@/contexts/auth-context";

type VerifyState = {
  status: "loading" | "success" | "error";
  message: string;
};

type VerifyAction =
  | { type: "SET_SUCCESS"; payload: string }
  | { type: "SET_ERROR"; payload: string }
  | { type: "SET_LOADING" };

const initialState: VerifyState = {
  status: "loading",
  message: "",
};

function verifyReducer(state: VerifyState, action: VerifyAction): VerifyState {
  switch (action.type) {
    case "SET_SUCCESS":
      return { status: "success", message: action.payload };
    case "SET_ERROR":
      return { status: "error", message: action.payload };
    case "SET_LOADING":
      return { status: "loading", message: "" };
    default:
      return state;
  }
}

export default function VerifyLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, dispatch] = useReducer(verifyReducer, initialState);
  const verificationAttempted = useRef(false);
  const { login, refreshAuth } = useAuth();

  const verifyToken = useCallback(async () => {
    console.log("[VerifyLogin] Iniciando verificação do token");
    if (!token || verificationAttempted.current) {
      console.log("[VerifyLogin] Token inválido ou verificação já realizada");
      !token && router.replace("/login");
      return;
    }

    verificationAttempted.current = true;

    try {
      console.log("[VerifyLogin] Fazendo requisição de verificação");
      const { data } = await api.get(`/auth/verify-login?token=${token}`);
      console.log("[VerifyLogin] Resposta completa da verificação:", data);

      if (data?.message) {
        dispatch({ type: "SET_SUCCESS", payload: data.message });

        // Aguardar um momento para o token ser processado
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Tentar obter os dados do usuário
        const authSuccess = await refreshAuth();

        if (!authSuccess) {
          throw new Error("Não foi possível obter os dados do usuário");
        }

        setTimeout(() => {
          console.log("[VerifyLogin] Redirecionando para /");
          router.replace("/");
        }, 2000);
      } else {
        throw new Error("Resposta inválida do servidor");
      }
    } catch (error: any) {
      console.error("[VerifyLogin] Erro na verificação:", error);

      dispatch({
        type: "SET_ERROR",
        payload:
          error.response?.data?.message ||
          error.message ||
          "Erro ao verificar token",
      });

      setTimeout(() => router.replace("/login"), 3000);
    }
  }, [token, router, refreshAuth]);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  const renderContent = useMemo(() => {
    const contents = {
      loading: (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Aguarde enquanto verificamos suas credenciais...
          </p>
        </div>
      ),
      success: (
        <Alert className="border-green-500 bg-green-50">
          <AlertTitle className="text-green-800">Sucesso!</AlertTitle>
          <AlertDescription className="text-green-700">
            {state.message}
          </AlertDescription>
        </Alert>
      ),
      error: (
        <Alert variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ),
    };

    return contents[state.status];
  }, [state.status, state.message]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {state.status === "loading" && "Verificando acesso..."}
            {state.status === "success" && "Login confirmado!"}
            {state.status === "error" && "Erro na verificação"}
          </CardTitle>
        </CardHeader>
        <CardContent>{renderContent}</CardContent>
      </Card>
    </div>
  );
}
