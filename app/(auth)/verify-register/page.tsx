"use client";

import { useEffect, useReducer, useCallback, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/services/api";
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

export default function VerifyRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, dispatch] = useReducer(verifyReducer, initialState);
  const verificationAttempted = useRef(false);

  const verifyRegistration = useCallback(async () => {
    if (!token || verificationAttempted.current) {
      !token && router.replace("/register");
      return;
    }

    verificationAttempted.current = true;

    // Adicionar delay inicial de 3 segundos
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const { data } = await api.get(`/auth/verify-register?token=${token}`);

      if (data?.message) {
        dispatch({ type: "SET_SUCCESS", payload: data.message });

        // Reduzir para 2 segundos apenas para o usuário ler a mensagem
        setTimeout(() => {
          router.replace("/login");
        }, 3000);
      } else {
        throw new Error("Resposta inválida do servidor");
      }
    } catch (error: any) {
      console.error("[VerifyRegister] Erro na verificação:", error);

      dispatch({
        type: "SET_ERROR",
        payload:
          error.response?.data?.message ||
          error.message ||
          "Erro na verificação do email. Tente novamente.",
      });

      // Reduzir para 3 segundos em caso de erro
      setTimeout(() => {
        router.replace("/register");
      }, 3000);
    }
  }, [token, router]);

  useEffect(() => {
    verifyRegistration();
  }, [verifyRegistration]);

  const renderContent = useMemo(
    () => (
      <VerifyMessage
        status={state.status}
        message={state.message}
        redirectText={
          state.status === "success"
            ? "Redirecionando para o login..."
            : state.status === "error"
            ? "Redirecionando para o registro..."
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
