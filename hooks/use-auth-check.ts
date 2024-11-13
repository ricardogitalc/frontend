import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { authEvents } from "@/hooks/auth-events";

export function useAuthCheck() {
  const { refreshAuth } = useAuth();

  useEffect(() => {
    // Inscreve para eventos de mudança de autenticação
    const unsubscribe = authEvents.subscribe(() => {
      refreshAuth();
    });

    return () => unsubscribe();
  }, [refreshAuth]);
}
