"use client";

import Link from "next/link";
import Image from "next/image";
import { Twitter, Github, MessageCircle, Instagram, Send } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc =
    mounted && (resolvedTheme === "dark" || theme === "dark")
      ? "/prediksvgwhite.svg"
      : "/svglogoblack.svg";

  return (
    <footer className="bg-background/80 backdrop-blur-md border-t border-border/40 pt-16 pb-8 relative z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              {mounted && (
                <Image
                  src={logoSrc}
                  alt="Predik"
                  width={90}
                  height={22}
                  className="h-6 w-auto"
                />
              )}
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              El mercado de predicción descentralizado en BNB Chain.
              <br />
              Impulsado por Myriad Protocol.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://x.com/predikapp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-electric-purple transition-colors"
                aria-label="X (Twitter)"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/predikapp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-electric-purple transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://tiktok.com/@predikapp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-electric-purple transition-colors"
                aria-label="TikTok"
              >
                {/* TikTok Icon (Custom SVG since Lucide might not have it or it's new) */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
              </a>
              <a
                href="https://t.me/predikapp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-electric-purple transition-colors"
                aria-label="Telegram"
              >
                <Send className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="font-semibold mb-4">Plataforma</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/como-funciona"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cómo Funciona
                </Link>
              </li>
              <li>
                <Link
                  href="https://app.predik.io?filter=politica"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Política
                </Link>
              </li>
              <li>
                <Link
                  href="https://app.predik.io?filter=economia"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Economía
                </Link>
              </li>
              <li>
                <Link
                  href="https://app.predik.io?filter=deportes"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Deportes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Recursos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Acerca de
                </Link>
              </li>
              <li>
                <Link
                  href="/roadmap"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Roadmap
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/carreras"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Carreras
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Ayuda</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/terminos"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Términos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidad"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Política de Privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} Predik. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              BNB Chain Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
