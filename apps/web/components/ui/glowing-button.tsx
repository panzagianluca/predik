"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface GlowingButtonProps {
  href: string;
  children: [string, string]; // [first line, second line]
  className?: string;
}

export function GlowingButton({
  href,
  children,
  className,
}: GlowingButtonProps) {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 });
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 40; // -20 to 20
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 28; // -14 to 14

    setGlowPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setGlowPosition({ x: 0, y: 0 });
  };

  // Purple for light theme, white for dark theme
  const glowColorLeft = isDark
    ? "rgba(255, 255, 255, 0.75)"
    : "rgb(213, 159, 255)";
  const glowColorRight = isDark
    ? "rgba(240, 240, 240, 0.75)"
    : "rgb(168, 85, 247)";

  return (
    <a
      ref={buttonRef}
      href={href}
      className={cn(
        "group relative inline-flex h-9 items-center justify-center overflow-visible rounded-md px-6",
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Left Glow */}
      <div className="absolute left-[-4px] top-1/2 z-[1] h-[86%] w-[66%] -translate-y-1/2 pointer-events-none">
        <span
          className="block h-full w-full rounded-md opacity-80 blur-[15px] transition-all duration-[600ms] ease-out will-change-transform group-hover:opacity-100 group-hover:blur-[20px]"
          style={{
            transform: `translate(${glowPosition.x}px, ${glowPosition.y}px)`,
            background: glowColorLeft,
          }}
        />
      </div>

      {/* Right Glow */}
      <div className="absolute right-[-4px] top-1/2 z-[1] h-[86%] w-[66%] -translate-y-1/2 pointer-events-none">
        <span
          className="block h-full w-full rounded-md opacity-80 blur-[15px] transition-all duration-[600ms] ease-out will-change-transform group-hover:opacity-100 group-hover:blur-[20px]"
          style={{
            transform: `translate(${glowPosition.x}px, ${glowPosition.y}px)`,
            background: glowColorRight,
          }}
        />
      </div>

      {/* Purple Background Overlay */}
      <span className="absolute left-0 top-0 z-[2] block h-full w-full rounded-md bg-[hsl(var(--electric-purple))]" />

      {/* Content */}
      <div className="relative z-[3] h-full flex items-center text-[14px] font-semibold text-white leading-tight">
        {children[0]} {children[1]}
      </div>
    </a>
  );
}
