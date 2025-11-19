"use client";

import { Feature } from "@/lib/roadmapData";
import { useTheme } from "next-themes";

interface FeatureCardProps {
  feature: Feature;
}

const badgeColorMap = {
  purple:
    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  green:
    "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20",
  orange:
    "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20",
  red: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
  yellow:
    "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20",
};

export function FeatureCard({ feature }: FeatureCardProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div
      className="p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-all duration-200 hover:-translate-y-1"
      style={{
        boxShadow: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = isDark
          ? "0 10px 25px -5px rgba(255, 255, 255, 0.15), 0 8px 10px -6px rgba(255, 255, 255, 0.1)"
          : "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <h3 className="font-semibold text-base mb-2 text-[hsl(var(--card-foreground))]">
        {feature.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-3">
        {feature.description}
      </p>
      <div className="flex flex-wrap gap-2">
        {feature.badges.map((badge, index) => (
          <span
            key={index}
            className={`text-xs px-2 py-1 rounded-md ${
              badgeColorMap[badge.color]
            }`}
          >
            {badge.label}
          </span>
        ))}
      </div>
    </div>
  );
}
