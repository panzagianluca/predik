"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle2, TrendingUp, Wallet } from "lucide-react";

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 0,
      title: "Elegí un Mercado",
      description:
        "Explorá categorías como Política, Deportes o Crypto y encontrá una predicción que te interese.",
      icon: TrendingUp,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      id: 1,
      title: "Tomá una Posición",
      description:
        "Comprá acciones de 'Sí' o 'No'. El precio refleja la probabilidad (ej. $0.60 = 60%).",
      icon: CheckCircle2,
      color: "text-electric-purple",
      bgColor: "bg-electric-purple/10",
      borderColor: "border-electric-purple/20",
    },
    {
      id: 2,
      title: "Ganá",
      description:
        "Si tu predicción es correcta, cada acción se canjea por $1.00. ¡Ganancias instantáneas!",
      icon: Wallet,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Cómo funciona Predik?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Convertí tu conocimiento en ganancias en 3 simples pasos.
          </p>
        </div>

        {/* Mobile Carousel */}
        <div className="lg:hidden overflow-x-auto snap-x snap-mandatory flex gap-4 pb-8 -mx-4 px-4 scrollbar-hide">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={cn(
                  "snap-center flex-shrink-0 w-[85vw] max-w-sm rounded-2xl border-2 p-6 flex flex-col gap-6",
                  `${step.borderColor} ${step.bgColor}`,
                )}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-card",
                    )}
                  >
                    <Icon className={cn("w-6 h-6", step.color)} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    {step.title}
                  </h3>
                </div>

                <p className="text-muted-foreground leading-relaxed text-sm">
                  {step.description}
                </p>

                {/* Visual for this step */}
                <div className="mt-auto pt-4">
                  {index === 0 && (
                    <div className="relative w-full bg-card rounded-xl border border-border shadow-lg p-4">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-muted flex-shrink-0 overflow-hidden relative">
                          <Image
                            src="/prediklogoonly.svg"
                            alt="Market"
                            fill
                            className="object-cover p-1.5"
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold text-xs line-clamp-2">
                            ¿Bitcoin superará los $100k en 2025?
                          </h4>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Volumen: $1.2M
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 rounded-lg border border-border">
                          <span className="font-medium text-green-600 text-xs">
                            Sí
                          </span>
                          <span className="text-xs font-bold">65%</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg border border-border">
                          <span className="font-medium text-red-600 text-xs">
                            No
                          </span>
                          <span className="text-xs font-bold">35%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {index === 1 && (
                    <div className="relative w-full bg-card rounded-xl border border-border shadow-lg p-4">
                      <h4 className="font-semibold mb-3 text-sm">
                        Comprar Acciones "Sí"
                      </h4>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-muted-foreground">
                            Monto
                          </label>
                          <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg border border-border">
                            <span className="font-mono text-base">100</span>
                            <span className="text-xs font-semibold">USDT</span>
                          </div>
                        </div>
                        <div className="p-2 bg-electric-purple/5 rounded-lg border border-electric-purple/20 space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              Precio prom.
                            </span>
                            <span className="font-medium">0.65 USDT</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              Acciones est.
                            </span>
                            <span className="font-medium">153.8</span>
                          </div>
                          <div className="border-t border-electric-purple/10 my-1.5" />
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              Ganancia
                            </span>
                            <span className="font-bold text-green-600">
                              +53.8 USDT
                            </span>
                          </div>
                        </div>
                        <button className="w-full py-1.5 bg-electric-purple text-white rounded-lg text-xs font-medium shadow-lg shadow-electric-purple/25">
                          Confirmar
                        </button>
                      </div>
                    </div>
                  )}

                  {index === 2 && (
                    <div className="relative w-full bg-card rounded-xl border border-green-500/30 shadow-lg shadow-green-500/10 p-4 text-center">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h4 className="text-lg font-bold text-green-600 dark:text-green-400 mb-1">
                        ¡Ganaste!
                      </h4>
                      <p className="text-xs text-muted-foreground mb-4">
                        Tu predicción fue correcta.
                      </p>
                      <div className="bg-muted/30 rounded-xl p-3 mb-4">
                        <div className="text-[10px] text-muted-foreground mb-0.5">
                          Retorno Total
                        </div>
                        <div className="text-2xl font-bold font-mono">
                          153.80 USDT
                        </div>
                      </div>
                      <button className="w-full py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium">
                        Reclamar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Grid Layout */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side: Steps List */}
          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === index;

              return (
                <div
                  key={step.id}
                  className={cn(
                    "relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer",
                    isActive
                      ? `${step.borderColor} ${step.bgColor}`
                      : "border-transparent hover:bg-muted/50",
                  )}
                  onClick={() => setActiveStep(index)}
                  onMouseEnter={() => setActiveStep(index)}
                >
                  <div className="flex gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                        isActive ? "bg-card" : "bg-muted",
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-6 h-6",
                          isActive ? step.color : "text-muted-foreground",
                        )}
                      />
                    </div>
                    <div>
                      <h3
                        className={cn(
                          "text-lg font-bold mb-2",
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="activeStepIndicator"
                      className={cn(
                        "absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl",
                        step.color.replace("text-", "bg-"),
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Side: Visual Representation */}
          <div className="relative h-[500px] bg-muted/30 rounded-3xl border border-border/50 p-8 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-background to-muted/50" />

            {/* Step 1 Visual: Market Card */}
            <AnimatePresence mode="wait">
              {activeStep === 0 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="relative w-full max-w-sm bg-card rounded-xl border border-border shadow-2xl p-4"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden relative">
                      <Image
                        src="/prediklogoonly.svg"
                        alt="Market"
                        fill
                        className="object-cover p-2"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">
                        ¿Bitcoin superará los $100k en 2025?
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Volumen: $1.2M
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 rounded-lg border border-border hover:border-electric-purple/50 cursor-pointer transition-colors">
                      <span className="font-medium text-green-600">Sí</span>
                      <span className="text-sm font-bold">65%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg border border-border hover:border-electric-purple/50 cursor-pointer transition-colors">
                      <span className="font-medium text-red-600">No</span>
                      <span className="text-sm font-bold">35%</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2 Visual: Trading Interface */}
              {activeStep === 1 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="relative w-full max-w-sm bg-card rounded-xl border border-border shadow-2xl p-6"
                >
                  <h4 className="font-semibold mb-4">Comprar Acciones "Sí"</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">
                        Monto
                      </label>
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                        <span className="font-mono text-lg">100</span>
                        <span className="text-sm font-semibold">USDT</span>
                      </div>
                    </div>
                    <div className="p-3 bg-electric-purple/5 rounded-lg border border-electric-purple/20 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Precio prom.
                        </span>
                        <span className="font-medium">0.65 USDT</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Acciones est.
                        </span>
                        <span className="font-medium">153.8</span>
                      </div>
                      <div className="border-t border-electric-purple/10 my-2" />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Ganancia Potencial
                        </span>
                        <span className="font-bold text-green-600">
                          +53.8 USDT
                        </span>
                      </div>
                    </div>
                    <button className="w-full py-2 bg-electric-purple text-white rounded-lg font-medium shadow-lg shadow-electric-purple/25">
                      Confirmar Compra
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3 Visual: Winning */}
              {activeStep === 2 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="relative w-full max-w-sm bg-card rounded-xl border border-green-500/30 shadow-2xl shadow-green-500/10 p-6 text-center"
                >
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">
                    ¡Ganaste!
                  </h4>
                  <p className="text-muted-foreground mb-6">
                    Tu predicción fue correcta.
                  </p>
                  <div className="bg-muted/30 rounded-xl p-4 mb-6">
                    <div className="text-sm text-muted-foreground mb-1">
                      Retorno Total
                    </div>
                    <div className="text-3xl font-bold font-mono">
                      153.80 USDT
                    </div>
                  </div>
                  <button className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                    Reclamar Ganancias
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
