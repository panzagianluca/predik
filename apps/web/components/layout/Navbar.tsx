"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

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

  const topLevelTriggerClasses = cn(
    navigationMenuTriggerStyle(),
    "!bg-transparent hover:bg-[hsl(var(--electric-purple))]/10 focus:bg-[hsl(var(--electric-purple))]/10 data-[state=open]:bg-[hsl(var(--electric-purple))]/15 data-[state=open]:hover:bg-[hsl(var(--electric-purple))]/15 data-[state=open]:focus:bg-[hsl(var(--electric-purple))]/15",
  );

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

          {/* Center Navigation */}
          <div className="hidden md:flex items-center flex-1 justify-center">
            <NavigationMenu viewport={false}>
              <NavigationMenuList>
                {/* Inicio */}
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/" className={topLevelTriggerClasses}>
                      Inicio
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* Cómo Funciona */}
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/como-funciona"
                      className={topLevelTriggerClasses}
                    >
                      Cómo Funciona
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* Mercados Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={topLevelTriggerClasses}>
                    Mercados
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-2 p-2">
                      <li>
                        <NavigationMenuLink asChild>
                          <a
                            href="https://app.predik.io"
                            className="block text-sm font-medium p-2 rounded-md hover:bg-[hsl(var(--electric-purple))]/10 transition-colors"
                          >
                            Trending
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a
                            href="https://app.predik.io?filter=politica"
                            className="block text-sm font-medium p-2 rounded-md hover:bg-[hsl(var(--electric-purple))]/10 transition-colors"
                          >
                            Política
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a
                            href="https://app.predik.io?filter=economia"
                            className="block text-sm font-medium p-2 rounded-md hover:bg-[hsl(var(--electric-purple))]/10 transition-colors"
                          >
                            Economía
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a
                            href="https://app.predik.io?filter=deportes"
                            className="block text-sm font-medium p-2 rounded-md hover:bg-[hsl(var(--electric-purple))]/10 transition-colors"
                          >
                            Deportes
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-[hsl(var(--electric-purple))]/20 to-[hsl(var(--electric-purple))]/40 p-4 no-underline outline-none focus:shadow-md hover:bg-[hsl(var(--electric-purple))]/30 transition-colors"
                            href="https://app.predik.io"
                          >
                            <div className="text-sm font-semibold">
                              Ver Todos →
                            </div>
                          </a>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Recursos Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={topLevelTriggerClasses}>
                    Recursos
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-2 p-2">
                      <li>
                        <NavigationMenuLink asChild>
                          <a
                            href="/about"
                            className="block text-sm font-medium p-2 rounded-md hover:bg-[hsl(var(--electric-purple))]/10 transition-colors"
                          >
                            Acerca de
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a
                            href="/roadmap"
                            className="block text-sm font-medium p-2 rounded-md hover:bg-[hsl(var(--electric-purple))]/10 transition-colors"
                          >
                            Roadmap
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a
                            href="/blog"
                            className="block text-sm font-medium p-2 rounded-md hover:bg-[hsl(var(--electric-purple))]/10 transition-colors"
                          >
                            Blog
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a
                            href="/faq"
                            className="block text-sm font-medium p-2 rounded-md hover:bg-[hsl(var(--electric-purple))]/10 transition-colors"
                          >
                            FAQ
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a
                            href="/contacto"
                            className="block text-sm font-medium p-2 rounded-md hover:bg-[hsl(var(--electric-purple))]/10 transition-colors"
                          >
                            Contacto
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-[hsl(var(--electric-purple))]/20 to-[hsl(var(--electric-purple))]/40 p-4 no-underline outline-none focus:shadow-md hover:bg-[hsl(var(--electric-purple))]/30 transition-colors"
                            href="/carreras"
                          >
                            <div className="text-sm font-semibold">
                              Carreras →
                            </div>
                          </a>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

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
