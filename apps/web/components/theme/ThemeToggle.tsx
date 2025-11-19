"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { flushSync } from "react-dom";
import { setThemeCookie, getThemeCookie } from "@/lib/theme-cookie";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch and sync from cookie on mount
  React.useEffect(() => {
    setMounted(true);

    // Read theme from cookie on mount
    const cookieTheme = getThemeCookie();
    if (cookieTheme && cookieTheme !== theme) {
      setTheme(cookieTheme);
    }
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  const toggleTheme = async () => {
    const newTheme = isDark ? "light" : "dark";

    // Save to cookie for cross-domain sync
    setThemeCookie(newTheme);

    // If View Transitions API is not supported, just toggle
    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    // Use View Transitions API for smooth animation (top-to-bottom)
    await document.startViewTransition(() => {
      flushSync(() => {
        setTheme(newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");
      });
    }).ready;

    // Animate with clip-path (ttb direction)
    document.documentElement.animate(
      {
        clipPath: ["inset(0 0 100% 0)", "inset(0 0 0 0)"],
      },
      {
        duration: 200,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  };

  return (
    <>
      <button
        onClick={toggleTheme}
        className="p-2 rounded-md hover:text-electric-purple transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label="Toggle theme"
      >
        {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </button>
      <style>{`::view-transition-old(root), ::view-transition-new(root){animation:none;mix-blend-mode:normal;}`}</style>
    </>
  );
}
