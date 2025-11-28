import { FadeIn } from "@/components/animations/FadeIn";
import type { Metadata } from "next";
import {
  Target,
  Users,
  Globe,
  Shield,
  Zap,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Acerca de - Predik",
  description:
    "Conocé a Predik: la primera plataforma de mercados de predicción en español para Latinoamérica. Nuestra misión, visión y el equipo detrás del proyecto.",
};

const values = [
  {
    icon: Target,
    title: "Precisión",
    description:
      "Los mercados de predicción son una de las herramientas más precisas para pronosticar eventos futuros.",
  },
  {
    icon: Shield,
    title: "Transparencia",
    description:
      "Todo en blockchain. Cada transacción es pública y verificable. Sin intermediarios.",
  },
  {
    icon: Globe,
    title: "Accesibilidad",
    description:
      "Construido para Latinoamérica. En español, con mercados relevantes para la región.",
  },
  {
    icon: Zap,
    title: "Innovación",
    description:
      "Tecnología Web3 de última generación para una experiencia rápida y segura.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen relative pt-24 pb-8">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm [mask-image:linear-gradient(to_bottom,transparent,black_100px)] -z-10" />
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <FadeIn>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Acerca de Predik</h1>
            <p className="text-muted-foreground">
              La primera plataforma de mercados de predicción en español para
              Latinoamérica.
            </p>
          </div>
        </FadeIn>

        {/* Mission Section */}
        <FadeIn delay={0.1}>
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[hsl(var(--electric-purple))]/10">
                <TrendingUp className="w-5 h-5 text-[hsl(var(--electric-purple))]" />
              </div>
              <h2 className="text-xl font-bold">Nuestra Misión</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Democratizar el acceso a la información de mercado en
              Latinoamérica. Creemos que los mercados de predicción son una
              herramienta poderosa para agregar conocimiento disperso y generar
              pronósticos precisos sobre eventos futuros.
            </p>
            <p className="text-muted-foreground">
              Predik nace de la convicción de que cualquier persona debería
              poder expresar y respaldar sus opiniones sobre el mundo, ya sea
              sobre política, deportes, economía o cultura. Y de paso, ganar si
              acierta.
            </p>
          </div>
        </FadeIn>

        {/* Values Section */}
        <FadeIn delay={0.15}>
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Nuestros Valores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[hsl(var(--electric-purple))]/10 flex-shrink-0">
                      <value.icon className="w-5 h-5 text-[hsl(var(--electric-purple))]" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Technology Section */}
        <FadeIn delay={0.2}>
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Tecnología</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">
                  Construido sobre Myriad Protocol
                </h3>
                <p className="text-sm text-muted-foreground">
                  Predik utiliza la infraestructura de Myriad Protocol, un
                  protocolo multichain de mercados de predicción desarrollado
                  por el equipo detrás de Polkamarkets. Esto nos permite ofrecer
                  mercados descentralizados, transparentes y con liquidez
                  constante.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">BNB Smart Chain</h3>
                <p className="text-sm text-muted-foreground">
                  Operamos en BNB Smart Chain, una blockchain rápida y con
                  costos de transacción muy bajos. Todas las transacciones se
                  ejecutan directamente en blockchain. Tus fondos siempre están
                  bajo tu control.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Team Section */}
        <FadeIn delay={0.25}>
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[hsl(var(--electric-purple))]/10">
                <Users className="w-5 h-5 text-[hsl(var(--electric-purple))]" />
              </div>
              <h2 className="text-xl font-bold">El Equipo</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Predik fue fundado por <strong>Gianluca Panza</strong>, un
              emprendedor argentino apasionado por la tecnología blockchain y
              los mercados de predicción.
            </p>
            <p className="text-muted-foreground mb-4">
              Con experiencia en desarrollo de software y productos digitales,
              Gianluca vio la oportunidad de traer los mercados de predicción a
              Latinoamérica en un formato accesible, en español, y enfocado en
              los temas que realmente importan a la región.
            </p>
            <p className="text-muted-foreground">
              Estamos creciendo y buscando personas talentosas.{" "}
              <Link
                href="/carreras"
                className="text-[hsl(var(--electric-purple))] hover:underline"
              >
                Mirá las posiciones abiertas →
              </Link>
            </p>
          </div>
        </FadeIn>

        {/* Contact CTA */}
        <FadeIn delay={0.3}>
          <div className="relative overflow-hidden bg-gradient-to-r from-[hsl(var(--electric-purple))]/10 to-[hsl(var(--electric-purple))]/5 rounded-xl p-6 border border-[hsl(var(--electric-purple))]/20">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--electric-purple))]/10">
                <MessageSquare className="w-5 h-5 text-[hsl(var(--electric-purple))]" />
              </div>
              <h2 className="text-xl font-bold">¿Querés saber más?</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Si tenés preguntas, sugerencias, o simplemente querés charlar
              sobre mercados de predicción, escribinos.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contacto"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-md bg-[hsl(var(--electric-purple))] px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[hsl(var(--electric-purple))]/50"
              >
                <span className="relative z-10">Contactanos</span>
                <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-13deg)_translateX(100%)]">
                  <div className="relative h-full w-10 bg-white/30"></div>
                </div>
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-card"
              >
                Preguntas Frecuentes
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
