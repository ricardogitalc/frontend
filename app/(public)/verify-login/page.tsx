"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/services/api";
import { authEvents } from "@/hooks/auth-events";
import { useAuth } from "@/contexts/auth-context";

export default function VerifyLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshAuth } = useAuth();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const verificationAttempted = useRef(false);

  useEffect(() => {
    if (!token || verificationAttempted.current) {
      !token && router.replace("/login");
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await api.get(`/auth/verify-login?token=${token}`);

        if (response.data?.message) {
          setStatus("success");
          setMessage(response.data.message);

          // Aguarda 3 segundos para mostrar a mensagem antes de atualizar o estado
          setTimeout(async () => {
            await refreshAuth();
            router.replace("/");
          }, 3000);
        }
      } catch (error: any) {
        console.error("[Verify Login] Erro detalhado:", {
          error,
          response: error.response,
          message: error.message,
          stack: error.stack,
        });

        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            error.message ||
            "Erro ao verificar token"
        );

        setTimeout(() => {
          router.replace("/login");
        }, 3000);
      }
    };

    verificationAttempted.current = true;
    verifyToken();
  }, [token, router, refreshAuth]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {status === "loading" && "Verificando acesso..."}
            {status === "success" && "Login confirmado!"}
            {status === "error" && "Erro na verificação"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Aguarde enquanto verificamos suas credenciais...
              </p>
            </div>
          )}

          {status === "success" && (
            <Alert className="border-green-500 bg-green-50">
              <AlertTitle className="text-green-800">Sucesso!</AlertTitle>
              <AlertDescription className="text-green-700">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
