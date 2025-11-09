"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Navbar() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine which logo to show
  const logoSrc =
    mounted && (resolvedTheme === "dark" || theme === "dark")
      ? "/prediksvgwhite.svg"
      : "/svglogoblack.svg";

  return (
    <nav className="w-full bg-transparent relative z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            {mounted && (
              <Image
                src={logoSrc}
                alt="Predik"
                width={80}
                height={20}
                className="h-5 w-auto transition-opacity duration-300"
                priority
                quality={100}
              />
            )}
          </Link>

          {/* Right Side: Theme Toggle + Acceder Button */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Acceder Button - Goes to app.predik.io */}
            <Link href="https://app.predik.io">
              <button
                className="group/button relative inline-flex items-center justify-center overflow-hidden rounded-md bg-[hsl(var(--electric-purple))] backdrop-blur-lg px-6 h-9 text-[14px] sm:text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl hover:shadow-[hsl(var(--electric-purple))]/50"
                type="button"
              >
                <span className="relative z-10">Acceder</span>
                <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
                  <div className="relative h-full w-10 bg-white/30"></div>
                </div>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
