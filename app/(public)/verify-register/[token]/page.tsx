"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/services/api";

export default function VerifyRegisterPage({
  params,
}: {
  params: { token: string };
}) {
  const router = useRouter();
  const { login } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const verificationAttempted = useRef(false);

  useEffect(() => {
    if (!params.token || verificationAttempted.current) {
      !params.token && router.replace("/register");
      return;
    }

    const verifyRegistration = async () => {
      try {
        const response = await api.get(`/auth/verify/${params.token}`);

        if (response.data?.user) {
          setStatus("success");
          setMessage(
            "Email verificado com sucesso! Você será redirecionado para a página de login."
          );
          login(response.data.user);

          setTimeout(() => {
            router.replace("/login");
          }, 3000);
        }
      } catch (error: any) {
        console.error("[Verify Register] Erro na verificação:", {
          status: error.response?.status,
          message: error.response?.data?.message,
        });

        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Erro na verificação do email. Tente novamente."
        );

        setTimeout(() => {
          router.replace("/register");
        }, 3000);
      }
    };

    verificationAttempted.current = true;
    verifyRegistration();
  }, [params.token, router, login]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {status === "loading" && (
              <span className="text-gray-700">Verificando seu email...</span>
            )}
            {status === "success" && (
              <span className="text-green-600">
                Email verificado com sucesso!
              </span>
            )}
            {status === "error" && (
              <span className="text-red-600">Falha na verificação</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground text-center">
                Aguarde enquanto confirmamos seu registro...
              </p>
            </div>
          )}

          {status === "success" && (
            <Alert className="border-green-500 bg-green-50">
              <AlertTitle className="text-green-800">
                Verificação concluída!
              </AlertTitle>
              <AlertDescription className="text-green-700">
                {message}
                <div className="mt-2 text-sm">
                  Redirecionando em alguns segundos...
                </div>
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <AlertTitle>Erro na verificação</AlertTitle>
              <AlertDescription>
                {message}
                <div className="mt-2 text-sm">
                  Você será redirecionado para a página de registro em alguns
                  segundos...
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
