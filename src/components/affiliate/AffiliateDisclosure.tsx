import { motion } from "framer-motion";
import { AlertCircle, Info, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AffiliateDisclosureProps {
  variant?: "alert" | "card" | "inline" | "footer";
  className?: string;
  showDetails?: boolean;
}

export function AffiliateDisclosure({ 
  variant = "alert", 
  className,
  showDetails = false 
}: AffiliateDisclosureProps) {
  const baseText = "Мы получаем комиссию с покупок по партнерским ссылкам.";
  const detailText = "Это не влияет на цену для вас и помогает развивать проект.";
  const fullText = `${baseText} ${detailText}`;

  if (variant === "inline") {
    return (
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn("text-xs text-muted-foreground", className)}
      >
        <Info className="w-3 h-3 inline mr-1" />
        {showDetails ? fullText : baseText}
      </motion.p>
    );
  }

  if (variant === "footer") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("border-t pt-4 mt-6", className)}
      >
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <p>{fullText}</p>
            <div className="flex items-center gap-4">
              <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                <a href="/affiliate-policy" target="_blank" rel="noopener noreferrer">
                  Политика партнерских программ
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </Button>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                <a href="/privacy" target="_blank" rel="noopener noreferrer">
                  Политика конфиденциальности
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === "card") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={className}
      >
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Партнерские ссылки
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {fullText}
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs text-amber-700 dark:text-amber-300" asChild>
                    <a href="/affiliate-policy">
                      Подробнее о партнерских программах
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Default: alert variant
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Alert className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
          {showDetails ? fullText : baseText}
          {!showDetails && (
            <Button variant="link" size="sm" className="h-auto p-0 ml-1 text-xs text-amber-700 dark:text-amber-300" asChild>
              <a href="/affiliate-policy">
                Подробнее
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}