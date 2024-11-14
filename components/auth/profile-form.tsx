"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { api, authApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UpdateUserProfile, User } from "@/types/types";
import { FormProfileProps } from "@/interfaces/interfaces";

export function ProfileForm({ user }: FormProfileProps) {
  const { refreshAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formChanged, setFormChanged] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let changed = false;

    switch (name) {
      case "firstName":
        changed = value.trim() !== user.firstName;
        break;
      case "lastName":
        changed = value.trim() !== user.lastName;
        break;
      case "whatsapp":
        const cleanValue = value.replace(/\D/g, "");
        changed = cleanValue !== user.whatsapp;
        break;
    }

    setFormChanged(changed);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData(e.currentTarget);
      const data: UpdateUserProfile = {};

      const firstName = formData.get("firstName") as string;
      const lastName = formData.get("lastName") as string;
      const whatsapp = formData.get("whatsapp") as string;

      if (firstName?.trim()) data.firstName = firstName.trim();
      if (lastName?.trim()) data.lastName = lastName.trim();
      if (whatsapp?.trim()) {
        const whatsappClean = whatsapp.replace(/\D/g, "");
        if (whatsappClean) data.whatsapp = whatsappClean;
      }

      const response = await authApi.updateProfile(user.id, data);

      if (response.error) {
        setError(response.error);
        return;
      }

      await refreshAuth();
      setFormChanged(false);
      setSuccess("Perfil atualizado com sucesso!");
    } catch (err: any) {
      setError("Erro ao atualizar perfil");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
        <CardDescription>Atualize suas informações pessoais</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">Nome</Label>
            <Input
              id="firstName"
              name="firstName"
              defaultValue={user.firstName}
              placeholder="Nome"
              required
              disabled={isLoading}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Sobrenome</Label>
            <Input
              id="lastName"
              name="lastName"
              defaultValue={user.lastName}
              placeholder="Sobrenome"
              required
              disabled={isLoading}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              name="whatsapp"
              defaultValue={user.whatsapp || ""}
              placeholder="WhatsApp (apenas números)"
              pattern="\d*"
              title="Digite apenas números"
              disabled={isLoading}
              onChange={handleInputChange}
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            type="submit"
            disabled={isLoading || !formChanged}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Atualizando...
              </>
            ) : (
              "Atualizar perfil"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
