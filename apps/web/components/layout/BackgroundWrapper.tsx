"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

interface BackgroundWrapperProps {
  isAnimated?: boolean;
}

export function BackgroundWrapper({
  isAnimated = false,
}: BackgroundWrapperProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === "dark";

  // Static background for non-homepage
  if (!isAnimated) {
    return (
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? "radial-gradient(ellipse 80% 80% at 50% -20%, rgba(168, 85, 247, 0.15), transparent 50%), radial-gradient(ellipse 60% 60% at 80% 50%, rgba(139, 92, 246, 0.1), transparent 50%), radial-gradient(ellipse 60% 60% at 20% 80%, rgba(192, 132, 252, 0.1), transparent 50%), linear-gradient(to bottom, rgb(20, 14, 41), rgb(10, 7, 20))"
              : "radial-gradient(ellipse 80% 80% at 50% -20%, rgba(168, 85, 247, 0.1), transparent 50%), radial-gradient(ellipse 60% 60% at 80% 50%, rgba(139, 92, 246, 0.08), transparent 50%), radial-gradient(ellipse 60% 60% at 20% 80%, rgba(192, 132, 252, 0.08), transparent 50%), linear-gradient(to bottom, rgb(249, 250, 251), rgb(243, 244, 246))",
          }}
        />
      </div>
    );
  }

  // Animated background for homepage
  return (
    <div className="fixed inset-0 z-0">
      <BackgroundGradientAnimation
        gradientBackgroundStart={
          isDark ? "rgb(20, 14, 41)" : "rgb(249, 250, 251)"
        }
        gradientBackgroundEnd={isDark ? "rgb(10, 7, 20)" : "rgb(243, 244, 246)"}
        firstColor={isDark ? "168, 85, 247" : "168, 85, 247"}
        secondColor={isDark ? "139, 92, 246" : "192, 132, 252"}
        thirdColor={isDark ? "192, 132, 252" : "216, 180, 254"}
        fourthColor={isDark ? "147, 51, 234" : "147, 51, 234"}
        fifthColor={isDark ? "126, 34, 206" : "196, 181, 253"}
        pointerColor="168, 85, 247"
        size="80%"
        blendingValue={isDark ? "hard-light" : "soft-light"}
        interactive={false}
      />
    </div>
  );
}
