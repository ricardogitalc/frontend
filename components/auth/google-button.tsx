import { Button } from "@/components/ui/button";
import { authApi } from "@/services/api";
import { FcGoogle } from "react-icons/fc";

export function GoogleAuthButton() {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full flex items-center"
      onClick={() => authApi.googleAuth()}
    >
      <FcGoogle />
      Continuar com Google
    </Button>
  );
}
