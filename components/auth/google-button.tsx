import { Button } from "@/components/ui/button";
import { authApi } from "@/services/api";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function GoogleAuthButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      await authApi.googleAuth();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full flex items-center justify-center gap-2"
      onClick={handleGoogleAuth}
      disabled={isLoading}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FcGoogle />}
      Continuar com Google
    </Button>
  );
}
