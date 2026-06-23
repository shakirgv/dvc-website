"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9"></div>;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
      aria-label="Təmanı dəyiş"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-primary-neon transition-transform hover:scale-110" />
      ) : (
        <Moon className="h-5 w-5 text-primary transition-transform hover:scale-110" />
      )}
      <span className="sr-only">Təmanı dəyiş</span>
    </button>
  );
}
