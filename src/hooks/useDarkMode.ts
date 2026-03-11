import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useDarkMode() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;
  const toggle = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  return { isDark, toggle, mounted };
}
