"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/animate-ui/components/animate/tooltip";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { haptics } from "@/lib/haptics";
import { logger } from "@/lib/logger";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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

  const pageUrl = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/markets/${marketSlug}`;
  const shareText = `Mirá esta predicción en Predik: ${marketTitle}`;

  // Helper to convert image to blob
  const getImageBlob = async (): Promise<Blob> => {
    const response = await fetch(imageUrl);
    return await response.blob();
  };

  const openWindow = (url: string) => {
    try {
      window.open(url, "_blank", "noopener,noreferrer");
      logger.info("Opened share window", url);
    } catch (e) {
      logger.error("Error opening share window", e);
    }
  };

  const handleShareToTelegram = async () => {
    haptics.light();

    // Try Web Share API first (mobile)
    if (navigator.share) {
      try {
        const blob = await getImageBlob();
        const file = new File([blob], `predik-${marketSlug}.png`, {
          type: "image/png",
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Predik: ${marketTitle}`,
            text: shareText,
            url: pageUrl,
            files: [file],
          });
          haptics.success();
          logger.info("Shared to Telegram via Web Share");
          return;
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          logger.error("Web Share failed:", error);
        } else {
          logger.info("Share cancelled by user");
          return;
        }
      }
    }

    // Desktop fallback: Open Telegram without auto-download
    const url = `https://t.me/share/url?url=${encodeURIComponent(
      pageUrl,
    )}&text=${encodeURIComponent(shareText)}`;
    openWindow(url);
  };

  const handleShareToX = async () => {
    haptics.light();

    // Try Web Share API first (mobile)
    if (navigator.share) {
      try {
        const blob = await getImageBlob();
        const file = new File([blob], `predik-${marketSlug}.png`, {
          type: "image/png",
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Predik: ${marketTitle}`,
            text: shareText,
            files: [file],
          });
          haptics.success();
          logger.info("Shared to X via Web Share");
          return;
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          logger.error("Web Share failed:", error);
        } else {
          logger.info("Share cancelled by user");
          return;
        }
      }
    }

    // Desktop fallback: Open X without auto-download
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText,
    )}&url=${encodeURIComponent(pageUrl)}`;
    openWindow(url);
  };

  const handleShareToWhatsApp = async () => {
    haptics.light();
    // Try Web Share API first (works on mobile)
    try {
      const blob = await getImageBlob();
      const file = new File([blob], `predik-${marketSlug}.png`, {
        type: "image/png",
      });

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: `Predik: ${marketTitle}`,
          text: shareText,
          files: [file],
        });
        haptics.success();
        logger.info("Shared to WhatsApp via Web Share");
        return;
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        logger.error("Web Share failed:", error);
      }
    }

    // Fallback: download image and open WhatsApp
    handleDownload();
    setTimeout(() => {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        shareText + " " + pageUrl,
      )}`;
      openWindow(url);
    }, 500);
  };

  const handleShareToFacebook = async () => {
    haptics.light();

    // Try Web Share API first (mobile)
    if (navigator.share) {
      try {
        const blob = await getImageBlob();
        const file = new File([blob], `predik-${marketSlug}.png`, {
          type: "image/png",
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Predik: ${marketTitle}`,
            text: shareText,
            files: [file],
          });
          haptics.success();
          logger.info("Shared to Facebook via Web Share");
          return;
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          logger.error("Web Share failed:", error);
        } else {
          logger.info("Share cancelled by user");
          return;
        }
      }
    }

    // Desktop fallback: Open Facebook without auto-download
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      pageUrl,
    )}`;
    openWindow(url);
  };

  const handleShareToInstagram = async () => {
    haptics.light();

    // Try Web Share API first (mobile)
    if (navigator.share) {
      try {
        const blob = await getImageBlob();
        const file = new File([blob], `predik-${marketSlug}.png`, {
          type: "image/png",
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Predik: ${marketTitle}`,
            files: [file],
          });
          haptics.success();
          logger.info("Shared to Instagram via Web Share");
          return;
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          logger.error("Web Share failed:", error);
        } else {
          logger.info("Share cancelled by user");
          return;
        }
      }
    }

    // Desktop fallback: Just download for manual upload
    handleDownload();
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

        {/* Quick platform share buttons and Download */}
        <div className="p-4 border-t bg-muted/30">
          <TooltipProvider>
            <div className="flex items-center justify-between gap-4">
              {/* Download Button */}
              <Button
                onClick={handleDownload}
                variant="outline"
                className="gap-2 flex-shrink-0"
              >
                <Download className="h-4 w-4" />
                Descargar
              </Button>

              {/* Social Share Buttons */}
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleShareToTelegram}
                      variant="outline"
                      size="icon"
                      aria-label="Compartir en Telegram"
                      className="group"
                    >
                      <Image
                        src="/SocialMedia/PhTelegramLogo.svg"
                        alt="Telegram"
                        width={20}
                        height={20}
                        className="dark:invert group-hover:invert"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Telegram</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleShareToX}
                      variant="outline"
                      size="icon"
                      aria-label="Compartir en X"
                      className="group"
                    >
                      <Image
                        src="/SocialMedia/PhXLogo.svg"
                        alt="X"
                        width={20}
                        height={20}
                        className="dark:invert group-hover:invert"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>X (Twitter)</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleShareToInstagram}
                      variant="outline"
                      size="icon"
                      aria-label="Compartir en Instagram"
                      className="group"
                    >
                      <Image
                        src="/SocialMedia/PhInstagramLogo.svg"
                        alt="Instagram"
                        width={20}
                        height={20}
                        className="dark:invert group-hover:invert"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Instagram</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleShareToWhatsApp}
                      variant="outline"
                      size="icon"
                      aria-label="Compartir en WhatsApp"
                      className="group"
                    >
                      <Image
                        src="/SocialMedia/PhWhatsappLogo.svg"
                        alt="WhatsApp"
                        width={20}
                        height={20}
                        className="dark:invert group-hover:invert"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>WhatsApp</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleShareToFacebook}
                      variant="outline"
                      size="icon"
                      aria-label="Compartir en Facebook"
                      className="group"
                    >
                      <Image
                        src="/SocialMedia/PhFacebookLogo.svg"
                        alt="Facebook"
                        width={20}
                        height={20}
                        className="dark:invert group-hover:invert"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Facebook</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </TooltipProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
