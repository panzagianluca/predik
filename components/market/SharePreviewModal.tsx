"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { haptics } from "@/lib/haptics";
import { logger } from "@/lib/logger";

interface SharePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  marketTitle: string;
  marketSlug: string;
}

/**
 * Modal that previews the generated share image
 * Shows the image and provides share/download options
 */
export function SharePreviewModal({
  isOpen,
  onClose,
  imageUrl,
  marketTitle,
  marketSlug,
}: SharePreviewModalProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    try {
      setIsSharing(true);
      haptics.light();

      // Convert data URL to blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `predik-${marketSlug}.png`, {
        type: "image/png",
      });

      // Try Web Share API
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
        onClose();
      } else {
        // If Web Share not available, just download
        handleDownload();
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        logger.error("Error sharing:", error);
        haptics.error();
      }
      // User cancelled share - just log it
      logger.info("Share cancelled by user");
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = () => {
    haptics.light();
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `predik-${marketSlug}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    haptics.success();
    logger.info("Image downloaded");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl w-full p-0 gap-0 overflow-hidden"
        from="bottom"
      >
        <DialogTitle className="sr-only">
          Vista previa para compartir
        </DialogTitle>

        {/* Header */}
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Vista previa</h3>
        </div>

        {/* Image Preview - 1200x800 aspect ratio (3:2) */}
        <div className="relative w-full aspect-[3/2] bg-muted">
          <Image
            src={imageUrl}
            alt="Share preview"
            fill
            className="object-contain"
            unoptimized
          />
        </div>

        {/* Actions */}
        <div className="p-4 flex gap-2">
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex-1 gap-2"
          >
            <Download className="h-4 w-4" />
            Descargar
          </Button>
          <Button
            onClick={handleShare}
            disabled={isSharing}
            className="flex-1 gap-2"
          >
            <Share2 className="h-4 w-4" />
            {isSharing ? "Compartiendo..." : "Compartir"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
