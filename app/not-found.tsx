import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <h1 className="text-4xl font-bold mb-4">404 - Página não encontrada</h1>
      <p className="text-xl mb-8 text-center">
        Ops! A página que você está procurando não existe.
      </p>
      <div className="w-full max-w-md h-64 mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg shadow-lg transform skew-y-[-3deg]"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-9xl font-bold text-white">404</span>
        </div>
      </div>
      <Button asChild>
        <Link href="/" className="flex items-center">
          <HomeIcon className="mr-2 h-4 w-4" />
          Voltar para a página inicial
        </Link>
      </Button>
    </div>
  );
}
