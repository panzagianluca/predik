"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { haptics } from "@/lib/haptics";

interface CopyLinkButtonProps {
  marketSlug: string;
  variant?: "default" | "outline" | "ghost";
}

/**
 * Copy link button that copies the market URL to clipboard
 * Shows a checkmark icon with smooth transition for visual feedback
 * Always displays as icon-only
 */
export function CopyLinkButton({
  marketSlug,
  variant = "outline",
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const url = `${window.location.origin}/markets/${marketSlug}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      haptics.success();

      // Reset after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      haptics.error();
    }
  };

  return (
    <Button
      onClick={handleCopy}
      variant={variant}
      size="icon"
      className="gap-2 transition-all duration-200 hover:scale-[1.02] relative"
    >
      <div className="relative w-4 h-4">
        <Copy
          className={`h-4 w-4 absolute inset-0 transition-all duration-300 ${
            copied
              ? "opacity-0 scale-0 rotate-90"
              : "opacity-100 scale-100 rotate-0"
          }`}
        />
        <Check
          className={`h-4 w-4 absolute inset-0 transition-all duration-300 ${
            copied
              ? "opacity-100 scale-100 rotate-0"
              : "opacity-0 scale-0 -rotate-90"
          }`}
        />
      </div>
    </Button>
  );
}
