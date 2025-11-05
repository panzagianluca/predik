"use client";

import { useState } from "react";
import { Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { haptics } from "@/lib/haptics";
import { logger } from "@/lib/logger";

interface ShareButtonProps {
  marketId: string;
  marketTitle: string;
  marketSlug: string;
}

/**
 * Share button that generates and shares market images
 * - Mobile: Uses Web Share API with image
 * - Desktop: Downloads image
 * - Uses html2canvas for client-side image generation
 */
export function ShareButton({
  marketId,
  marketTitle,
  marketSlug,
}: ShareButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAndShare = async () => {
    if (isGenerating) return;

    try {
      setIsGenerating(true);
      haptics.light();

      // Dynamically import html2canvas (lazy load)
      const html2canvas = (await import("html2canvas")).default;

      // Find the shareable card element
      const element = document.querySelector(
        `[data-share-card="${marketId}"]`,
      ) as HTMLElement;

      if (!element) {
        throw new Error("Share card element not found");
      }

      // Temporarily make element visible for capture (but invisible to user)
      const originalPosition = element.style.position;
      const originalVisibility = element.style.visibility;
      element.style.position = "fixed";
      element.style.visibility = "hidden";
      element.style.left = "0";
      element.style.top = "0";

      // Small delay to ensure fonts and images are loaded
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Generate canvas
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2, // Retina quality
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: 1200,
        height: 1200,
      });

      // Restore original position
      element.style.position = originalPosition;
      element.style.visibility = originalVisibility;

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
        }, "image/png");
      });

      const file = new File([blob], `predik-${marketSlug}.png`, {
        type: "image/png",
      });

      // Try Web Share API first (mobile)
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: `Predik: ${marketTitle}`,
          text: `Mirá esta predicción en Predik`,
          url: `${window.location.origin}/markets/${marketSlug}`,
          files: [file],
        });

        haptics.success();
        logger.info("Market shared successfully");
      } else {
        // Fallback: Download image
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `predik-${marketSlug}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        haptics.success();
        logger.info("Market image downloaded");
      }
    } catch (error) {
      logger.error("Error generating share image:", error);
      haptics.error();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generateAndShare}
      disabled={isGenerating}
      variant="outline"
      size="default"
      className="gap-2 transition-all duration-200 hover:scale-[1.02]"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generando...</span>
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          <span>Compartir</span>
        </>
      )}
    </Button>
  );
}
