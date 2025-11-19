"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { setThemeCookie, getThemeCookie } from "@/lib/theme-cookie";
import { useEffect } from "react";

export function ThemeProvider({ children, ...props }: any) {
  useEffect(() => {
    // Sync theme from cookie on mount
    const cookieTheme = getThemeCookie();
    if (cookieTheme) {
      // Apply theme from cookie if available
      document.documentElement.classList.toggle("dark", cookieTheme === "dark");
    }
  }, []);

  return (
    <NextThemesProvider
      {...props}
      onValueChange={(theme) => {
        // Sync to cookie whenever theme changes
        setThemeCookie(theme);
      }}
    >
      {children}
    </NextThemesProvider>
  );
}
