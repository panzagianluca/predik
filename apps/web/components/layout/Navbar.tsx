"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Smart sticky behavior
  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== "undefined") {
        const currentScrollY = window.scrollY;

        // Determine if scrolled from top
        if (currentScrollY > 10) {
          setIsScrolled(true);
        } else {
          setIsScrolled(false);
        }

        // Determine scroll direction and visibility
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // Scrolling down & past threshold -> Hide
          setIsVisible(false);
          setIsMobileMenuOpen(false); // Close mobile menu on scroll down
        } else {
          // Scrolling up or at top -> Show
          setIsVisible(true);
        }

        setLastScrollY(currentScrollY);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", controlNavbar);

      // Cleanup
      return () => {
        window.removeEventListener("scroll", controlNavbar);
      };
    }
  }, [lastScrollY]);

  // Determine which logo to show
  const logoSrc =
    mounted && (resolvedTheme === "dark" || theme === "dark")
      ? "/prediksvgwhite.svg"
      : "/svglogoblack.svg";

  const topLevelTriggerClasses = cn(
    navigationMenuTriggerStyle(),
    "!bg-transparent hover:bg-[hsl(var(--electric-purple))]/10 hover:text-foreground focus:bg-[hsl(var(--electric-purple))]/10 focus:text-foreground data-[state=open]:bg-[hsl(var(--electric-purple))]/15 data-[state=open]:text-foreground data-[state=open]:hover:bg-[hsl(var(--electric-purple))]/15 data-[state=open]:focus:bg-[hsl(var(--electric-purple))]/15",
  );

  const AccederButton = () => (
    <Link
      href="https://app.predik.io"
      className="rounded-md transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <button
        className="group/button relative inline-flex items-center justify-center overflow-hidden rounded-md bg-[hsl(var(--electric-purple))] backdrop-blur-lg px-6 h-9 text-[14px] sm:text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl hover:shadow-[hsl(var(--electric-purple))]/50 focus-visible:outline-none"
        type="button"
        tabIndex={-1}
      >
        <span className="relative z-10">Acceder</span>
        <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
          <div className="relative h-full w-10 bg-white/30"></div>
        </div>
      </button>
    </Link>
  );

  return (
    <>
      <nav
        className={cn(
          "w-full fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform",
          isVisible ? "translate-y-0" : "-translate-y-full",
          isScrolled
            ? "bg-background/70 backdrop-blur-md border-b border-border/40 shadow-sm"
            : "bg-transparent",
        )}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 flex-shrink-0 rounded-md transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
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

            {/* Center Navigation (Desktop) */}
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

            {/* Right Side: Theme Toggle + Acceder Button (Desktop) */}
            <div className="hidden md:flex items-center gap-3 ml-auto">
              <ThemeToggle />
              <AccederButton />
            </div>

            {/* Right Side: Acceder Button + Hamburger (Mobile) */}
            <div className="flex md:hidden items-center gap-3 ml-auto">
              <AccederButton />
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 text-foreground hover:bg-accent rounded-md transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[60] flex justify-end md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-[80%] h-full bg-background border-l border-border shadow-2xl p-6 overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-lg font-bold">Menú</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-foreground hover:bg-accent rounded-md transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex flex-col gap-6">
                  <Link
                    href="/"
                    className="text-lg font-medium hover:text-[hsl(var(--electric-purple))] rounded-md transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Inicio
                  </Link>
                  <Link
                    href="/como-funciona"
                    className="text-lg font-medium hover:text-[hsl(var(--electric-purple))] rounded-md transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Cómo Funciona
                  </Link>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Mercados
                    </h4>
                    <div className="flex flex-col gap-3 pl-4 border-l border-border/50">
                      <a
                        href="https://app.predik.io"
                        className="hover:text-[hsl(var(--electric-purple))] rounded-md transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        Trending
                      </a>
                      <a
                        href="https://app.predik.io?filter=politica"
                        className="hover:text-[hsl(var(--electric-purple))] rounded-md transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        Política
                      </a>
                      <a
                        href="https://app.predik.io?filter=economia"
                        className="hover:text-[hsl(var(--electric-purple))] rounded-md transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        Economía
                      </a>
                      <a
                        href="https://app.predik.io?filter=deportes"
                        className="hover:text-[hsl(var(--electric-purple))] rounded-md transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        Deportes
                      </a>
                      <a
                        href="https://app.predik.io"
                        className="font-semibold hover:text-[hsl(var(--electric-purple))] rounded-md transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        Ver Todos →
                      </a>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Recursos
                    </h4>
                    <div className="flex flex-col gap-3 pl-4 border-l border-border/50">
                      <Link
                        href="/about"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="hover:text-[hsl(var(--electric-purple))] rounded-md transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        Acerca de
                      </Link>
                      <Link
                        href="/roadmap"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="hover:text-[hsl(var(--electric-purple))] rounded-md transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        Roadmap
                      </Link>
                      <Link
                        href="/blog"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="hover:text-[hsl(var(--electric-purple))] rounded-md transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        Blog
                      </Link>
                      <Link
                        href="/faq"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="hover:text-[hsl(var(--electric-purple))] rounded-md transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        FAQ
                      </Link>
                      <Link
                        href="/contacto"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="hover:text-[hsl(var(--electric-purple))] rounded-md transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        Contacto
                      </Link>
                      <Link
                        href="/carreras"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="font-semibold hover:text-[hsl(var(--electric-purple))] rounded-md transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        Carreras →
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-8 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Tema</span>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
