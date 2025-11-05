"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ProbabilityChart } from "./ProbabilityChart";
import { translateOutcomeTitle } from "@/lib/translation/outcomeTranslations";
import { Outcome } from "@/types/market";

interface ShareableMarketCardProps {
  marketId: string;
  title: string;
  outcomes: Outcome[];
  imageUrl?: string;
  lastUpdated?: Date;
}

/**
 * Hidden card component used for generating shareable images
 * Fixed 1200x800px landscape format - optimal for social media sharing
 * Theme-aware: uses share-background-dark.png or share-background-light.png
 */
export function ShareableMarketCard({
  marketId,
  title,
  outcomes,
  imageUrl,
  lastUpdated = new Date(),
}: ShareableMarketCardProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use resolvedTheme to handle 'system' theme
  const currentTheme = mounted ? resolvedTheme || theme : "dark";
  const backgroundImage =
    currentTheme === "dark"
      ? "/share-background-dark.png"
      : "/share-background-light.png";

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div
      data-share-card={marketId}
      className="fixed -left-[9999px] -top-[9999px] pointer-events-none opacity-0 invisible"
      style={{
        zIndex: -9999,
        position: "fixed",
        left: "-9999px",
        top: "-9999px",
      }}
    >
      <div
        className="relative w-[1200px] h-[800px]"
        style={{ overflow: "hidden" }}
      >
        {/* Background Image Layer - Theme Aware */}
        <Image
          src={backgroundImage}
          alt="Share background"
          fill
          className="object-cover"
          priority
          unoptimized // Don't optimize for share images
        />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col p-16">
          {/* Top: Image and Market Question */}
          <div className="flex items-start gap-8 px-8 pt-8">
            {/* Market Image */}
            {imageUrl && (
              <div
                className="flex-shrink-0 w-48 h-48 border-4 border-white/20 shadow-2xl"
                style={{ borderRadius: "32px", overflow: "hidden" }}
              >
                <Image
                  src={imageUrl}
                  alt={title}
                  width={192}
                  height={192}
                  className="object-cover w-full h-full"
                  style={{ borderRadius: "32px" }}
                  unoptimized
                />
              </div>
            )}

            {/* Question */}
            <div className="flex-1">
              <h1
                className="text-5xl font-bold text-white leading-tight text-left font-satoshi"
                style={{
                  textShadow:
                    "0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)",
                }}
              >
                {title}
              </h1>
            </div>
          </div>

          {/* Middle: Centered Probabilities and Date */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-[100px] pb-[88px]">
              {/* Probabilities */}
              <div className="flex justify-center gap-48 px-8">
                {outcomes
                  .slice(0, 2)
                  .reverse()
                  .map((outcome) => (
                    <div
                      key={outcome.id}
                      className="flex items-center gap-40 font-satoshi"
                    >
                      <div
                        className="text-6xl font-bold text-white"
                        style={{
                          textShadow:
                            "0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)",
                        }}
                      >
                        {translateOutcomeTitle(outcome.title)}
                      </div>
                      <div
                        className="text-6xl font-bold text-white"
                        style={{
                          textShadow:
                            "0 2px 8px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)",
                        }}
                      >
                        {Math.round(outcome.price * 100)}%
                      </div>
                    </div>
                  ))}
              </div>

              {/* Last Updated Timestamp */}
              <div
                className="text-2xl text-white/70 font-satoshi text-center"
                style={{
                  textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                }}
              >
                Actualizado al {lastUpdated.getDate()} de{" "}
                {
                  [
                    "enero",
                    "febrero",
                    "marzo",
                    "abril",
                    "mayo",
                    "junio",
                    "julio",
                    "agosto",
                    "septiembre",
                    "octubre",
                    "noviembre",
                    "diciembre",
                  ][lastUpdated.getMonth()]
                }
                , {lastUpdated.getFullYear()} a las{" "}
                {String(lastUpdated.getHours()).padStart(2, "0")}:
                {String(lastUpdated.getMinutes()).padStart(2, "0")} hora
                Argentina
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
