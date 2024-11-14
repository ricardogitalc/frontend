"use client";

import { useEffect, useReducer, useCallback, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/services/api";

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
    console.log("[VerifyRegister] Iniciando verificação do token");
    if (!token || verificationAttempted.current) {
      console.log(
        "[VerifyRegister] Token inválido ou verificação já realizada"
      );
      !token && router.replace("/register");
      return;
    }

    verificationAttempted.current = true;

    try {
      console.log("[VerifyRegister] Fazendo requisição de verificação");
      const { data } = await api.get(`/auth/verify-register?token=${token}`);
      console.log("[VerifyRegister] Resposta da verificação:", data);

      if (data?.message) {
        dispatch({ type: "SET_SUCCESS", payload: data.message });

        setTimeout(() => {
          console.log("[VerifyRegister] Redirecionando para /login");
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

      setTimeout(() => {
        router.replace("/register");
      }, 3000);
    }
  }, [token, router]);

  useEffect(() => {
    verifyRegistration();
  }, [verifyRegistration]);

  const renderContent = useMemo(() => {
    const contents = {
      loading: (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground text-center">
            Aguarde enquanto confirmamos seu registro...
          </p>
        </div>
      ),
      success: (
        <Alert className="border-green-500 bg-green-50">
          <AlertTitle className="text-green-800">
            Verificação concluída!
          </AlertTitle>
          <AlertDescription className="text-green-700">
            {state.message}
            <div className="mt-2 text-sm">
              Redirecionando para o login em alguns segundos...
            </div>
          </AlertDescription>
        </Alert>
      ),
      error: (
        <Alert variant="destructive">
          <AlertTitle>Erro na verificação</AlertTitle>
          <AlertDescription>
            {state.message}
            <div className="mt-2 text-sm">
              Você será redirecionado para a página de registro em alguns
              segundos...
            </div>
          </AlertDescription>
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
            {state.status === "loading" && "Verificando seu email..."}
            {state.status === "success" && "Email verificado com sucesso!"}
            {state.status === "error" && "Falha na verificação"}
          </CardTitle>
        </CardHeader>
        <CardContent>{renderContent}</CardContent>
      </Card>
    </div>
  );
}
