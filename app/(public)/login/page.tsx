"use client";

import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { AlertCircleIcon } from "lucide-react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="flex flex-col items-center justify-center">
      {error === "session_expired" && (
        <div className="flex justify-center items-center gap-2 mb-4 p-4 bg-yellow-500/15 text-yellow-600 rounded-lg">
          <AlertCircleIcon className="w-4 h-4" />
          <p>Sua sessão expirou. Por favor, faça login novamente.</p>
        </div>
      )}
      <LoginForm />
    </div>
  );
}
