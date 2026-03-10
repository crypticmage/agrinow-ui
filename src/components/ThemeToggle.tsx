"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Wait until mounted on client to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Return a transparent placeholder of the exact same size while loading
  // This prevents layout shift (UI jumping) when the page first loads
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground opacity-0"
        disabled
      >
        <span className="h-4 w-4" />
      </Button>
    );
  }

  // Use resolvedTheme so it works correctly if the user has 'system' preference selected
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="text-muted-foreground hover:text-foreground hover:bg-accent"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
