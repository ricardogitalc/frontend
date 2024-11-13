import { Button } from "@/components/ui/button";
import { authApi } from "@/services/api";
import { FcGoogle } from "react-icons/fc";

interface GoogleAuthButtonProps {
  disabled?: boolean;
}

export function GoogleAuthButton({ disabled }: GoogleAuthButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full flex items-center"
      onClick={() => authApi.googleAuth()}
      disabled={disabled}
    >
      <FcGoogle />
      Continuar com Google
    </Button>
  );
}
