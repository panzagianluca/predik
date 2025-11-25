"use client";

import { ShieldCheck, Zap, Globe2, Coins } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";

export function Features() {
  const features = [
    {
      title: "Transparencia total",
      description:
        "Todas las transacciones y resultados quedan registrados en la BNB Smart Chain. Cualquiera puede verificarlos, en cualquier momento.",
      icon: ShieldCheck,
    },
    {
      title: "Pagos instantáneos",
      description:
        "Recibí tus ganancias directo en tu wallet, sin intermediarios, apenas se resuelve el mercado.",
      icon: Zap,
    },
    {
      title: "Mercados regionales",
      description:
        "Enfocados en eventos de Latam como Política Argentina, Economía regional y Fútbol sudamericano.",
      icon: Globe2,
    },
    {
      title: "Comisiones bajas",
      description:
        "Pagá menos comisiones gracias a la eficiencia de BNB Chain y la arquitectura optimizada de Predik.",
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
                  <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
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
