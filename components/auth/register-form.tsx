"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { AuthLinks } from "./auth-links";
import { GoogleAuthButton } from "./google-button";
import { authApi } from "@/services/api";

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData(event.currentTarget);
      const data = {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        email: formData.get("email") as string,
        confirmEmail: formData.get("confirmEmail") as string,
        whatsapp: formData.get("whatsapp") as string,
      };

      const response = await authApi.register(data);

      if (response.error) {
        setError(response.error);
      } else if (response.message) {
        setSuccess(response.message);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data) ? err.response.data[0] : null) ||
        "Erro ao registrar";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Criar Conta</CardTitle>
        <CardDescription>Registre-se para acessar a plataforma</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="firstName">Nome</Label>
              <Input
                required
                id="firstName"
                name="firstName"
                placeholder="Digite seu nome"
                onInvalid={(e) =>
                  (e.target as HTMLInputElement).setCustomValidity(
                    "Por favor, preencha seu nome."
                  )
                }
                onInput={(e) =>
                  (e.target as HTMLInputElement).setCustomValidity("")
                }
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="lastName">Sobrenome</Label>
              <Input
                required
                id="lastName"
                name="lastName"
                placeholder="Digite seu sobrenome"
                onInvalid={(e) =>
                  (e.target as HTMLInputElement).setCustomValidity(
                    "Por favor, preencha seu sobrenome."
                  )
                }
                onInput={(e) =>
                  (e.target as HTMLInputElement).setCustomValidity("")
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              required
              type="email"
              id="email"
              name="email"
              placeholder="Digite seu email"
              onInvalid={(e) =>
                (e.target as HTMLInputElement).setCustomValidity(
                  "Por favor, preencha seu email."
                )
              }
              onInput={(e) =>
                (e.target as HTMLInputElement).setCustomValidity("")
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmEmail">Confirmar Email</Label>
            <Input
              required
              type="email"
              id="confirmEmail"
              name="confirmEmail"
              placeholder="Confirme seu email"
              onInvalid={(e) =>
                (e.target as HTMLInputElement).setCustomValidity(
                  "Por favor, confirme seu email."
                )
              }
              onInput={(e) =>
                (e.target as HTMLInputElement).setCustomValidity("")
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
            <Input
              required
              id="whatsapp"
              name="whatsapp"
              placeholder="Ex: 11999999999"
              onInvalid={(e) =>
                (e.target as HTMLInputElement).setCustomValidity(
                  "Por favor, preencha seu whatsapp."
                )
              }
              onInput={(e) =>
                (e.target as HTMLInputElement).setCustomValidity("")
              }
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="default">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              "Criar conta"
            )}
          </Button>
          <GoogleAuthButton />
          <AuthLinks type="register" />
        </CardFooter>
      </form>
    </Card>
  );
}
