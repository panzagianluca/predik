"use client";

import { useState } from "react";
import { Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SharePreviewModal } from "./SharePreviewModal";
import { haptics } from "@/lib/haptics";
import { logger } from "@/lib/logger";

interface ShareButtonProps {
  marketId: string;
  marketTitle: string;
  marketSlug: string;
}

/**
 * Share button that generates and previews market images
 * Opens a modal to preview the image before sharing
 * - Uses html2canvas for client-side image generation
 * - Shows preview modal with share/download options
 */
export function ShareButton({
  marketId,
  marketTitle,
  marketSlug,
}: ShareButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null,
  );

  const generateImage = async () => {
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

      // Temporarily make element visible for capture (but NEVER visible to user)
      const originalOpacity = element.style.opacity;
      const originalVisibility = element.style.visibility;

      // Make visible for html2canvas BUT keep it off-screen
      element.style.opacity = "1";
      element.style.visibility = "visible";
      // DO NOT change left/top - keep it off-screen!

      // Small delay to ensure fonts and images are loaded
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Generate canvas
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2, // Retina quality
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: 1200,
        height: 800,
      });

      // Restore original visibility
      element.style.opacity = originalOpacity;
      element.style.visibility = originalVisibility;

      // Convert to data URL
      const dataUrl = canvas.toDataURL("image/png");
      setGeneratedImageUrl(dataUrl);
      setShowPreview(true);
      haptics.success();
    } catch (error) {
      logger.error("Error generating share image:", error);
      haptics.error();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button
        onClick={generateImage}
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

      {generatedImageUrl && (
        <SharePreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          imageUrl={generatedImageUrl}
          marketTitle={marketTitle}
          marketSlug={marketSlug}
        />
      )}
    </>
  );
}
