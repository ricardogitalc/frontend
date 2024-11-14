"use client";

import { useEffect, useReducer, useCallback, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/services/api";
import { authEvents } from "@/hooks/auth-events";
import { useAuth } from "@/contexts/auth-context";
import { VerifyMessage } from "@/components/verify-message";

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
    if (!token || verificationAttempted.current) {
      !token && router.replace("/login");
      return;
    }

    verificationAttempted.current = true;

    // Adicionar delay inicial de 3 segundos
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const { data } = await api.get(`/auth/verify-login?token=${token}`);

      if (data?.message) {
        dispatch({ type: "SET_SUCCESS", payload: data.message });

        // Buscar dados do usuário imediatamente
        const authSuccess = await refreshAuth();

        if (!authSuccess) {
          throw new Error("Não foi possível obter os dados do usuário");
        }

        // Apenas um pequeno delay para mostrar mensagem de sucesso
        setTimeout(() => {
          router.replace("/");
        }, 3000);
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

      // Reduzir o tempo de redirecionamento em caso de erro
      setTimeout(() => router.replace("/login"), 2000);
    }
  }, [token, router, refreshAuth]);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  const renderContent = useMemo(
    () => (
      <VerifyMessage
        status={state.status}
        message={state.message}
        redirectText={
          state.status === "success"
            ? "Redirecionando para a página inicial..."
            : state.status === "error"
            ? "Redirecionando para o login..."
            : undefined
        }
      />
    ),
    [state.status, state.message]
  );

  return (
    <div className="flex items-center justify-center p-4">{renderContent}</div>
  );
}
