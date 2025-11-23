"use client";

import { ShieldCheck, Zap, Globe2, Coins } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";

export function Features() {
  const features = [
    {
      title: "Transparencia Total",
      description:
        "Todas las transacciones y resoluciones ocurren on-chain en BNB Smart Chain. Verificable por cualquiera, en cualquier momento.",
      icon: ShieldCheck,
    },
    {
      title: "Pagos Instantáneos",
      description:
        "Sin intermediarios. Los contratos inteligentes distribuyen las ganancias automáticamente a tu wallet apenas se resuelve el mercado.",
      icon: Zap,
    },
    {
      title: "Mercados Regionales",
      description:
        "Especializados en eventos de Latam: Política Argentina, Economía Regional y Fútbol Sudamericano.",
      icon: Globe2,
    },
    {
      title: "Bajas Comisiones",
      description:
        "Operá con fees mínimos gracias a la eficiencia de BNB Chain y la arquitectura optimizada de Predik.",
      icon: Coins,
    },
  ];

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Por qué elegir Predik?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              La plataforma de predicción más rápida y segura de la región.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="bg-card p-6 rounded-2xl border border-border hover:border-electric-purple/30 hover:shadow-lg hover:shadow-electric-purple/5 transition-all duration-300 group h-full">
                  <div className="w-12 h-12 rounded-xl bg-electric-purple/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-electric-purple" />
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-electric-purple transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
