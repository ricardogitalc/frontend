import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const verifyMessageVariants = cva(
  "flex flex-col items-center gap-4 p-6 rounded-lg animate-in fade-in duration-500 slide-in-from-bottom-4",
  {
    variants: {
      status: {
        loading: "",
        success: "bg-background border",
        error: "bg-destructive/10 border border-destructive/20",
      },
    },
    defaultVariants: {
      status: "loading",
    },
  }
);

interface VerifyMessageProps
  extends VariantProps<typeof verifyMessageVariants> {
  message: string;
  status?: "loading" | "success" | "error";
  redirectText?: string;
}

const titleMap = {
  loading: "Verificando",
  success: "Verificação concluída",
  error: "Erro na verificação",
};

const iconMap = {
  loading: Loader2,
  success: CheckCircle2,
  error: XCircle,
};

const iconStyles = {
  loading: "h-12 w-12 animate-spin text-primary",
  success: "h-12 w-12 text-primary animate-in zoom-in duration-300",
  error: "h-12 w-12 text-destructive animate-in zoom-in duration-300",
};

export function VerifyMessage({
  status = "loading",
  message,
  redirectText,
}: VerifyMessageProps) {
  const Icon = iconMap[status];

  return (
    <div
      className={cn(
        "min-w-[320px] max-w-md",
        verifyMessageVariants({ status })
      )}
    >
      <div className="flex flex-col items-center gap-6">
        {status === "loading" ? (
          <LoadingSpinner />
        ) : (
          <Icon className={iconStyles[status]} />
        )}

        <div className="space-y-3 text-center">
          <h2 className="text-xl font-semibold tracking-tight">
            {titleMap[status]}
          </h2>
          <div className="space-y-2">
            <p
              className={cn(
                "text-sm",
                status === "loading"
                  ? "text-muted-foreground"
                  : "text-muted-foreground/80"
              )}
            >
              {status === "loading" ? "Aguarde um momento..." : message}
            </p>

            {redirectText && status !== "loading" && (
              <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground/70">
                <ArrowRight className="h-4 w-4" />
                <span>{redirectText}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
