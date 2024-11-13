import Link from "next/link";
import { Button } from "../ui/button";

export function AuthLinks({ type }: { type: "login" | "register" }) {
  return (
    <div className="text-center">
      {type === "login" ? (
        <p className="text-sm text-muted-foreground">
          Não tem uma conta?{" "}
          <Button variant="link" asChild className="p-0">
            <Link href="/register">Criar conta</Link>
          </Button>
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Button variant="link" asChild className="p-0">
            <Link href="/login">Entrar</Link>
          </Button>
        </p>
      )}
    </div>
  );
}
