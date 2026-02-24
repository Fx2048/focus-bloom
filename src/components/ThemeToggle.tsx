import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "fixed bottom-16 sm:bottom-6 left-6 z-40 rounded-full w-10 h-10 shadow-elevated",
        "bg-card border-border hover:bg-accent hover:border-primary/30",
        "transition-all duration-300 ease-out",
        "hover:scale-105 active:scale-95"
      )}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-accent transition-transform duration-300 rotate-0" />
      ) : (
        <Moon className="h-4 w-4 text-primary transition-transform duration-300 rotate-0" />
      )}
    </Button>
  );
}
