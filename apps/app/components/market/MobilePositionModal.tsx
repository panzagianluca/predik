"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Market } from "@/types/market";
import { UserPositionCard } from "./UserPositionCard";
import { haptics } from "@/lib/haptics";

interface MobilePositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: Market;
  userAddress: string;
  onClaimSuccess?: () => void;
}

export function MobilePositionModal({
  isOpen,
  onClose,
  market,
  userAddress,
  onClaimSuccess,
}: MobilePositionModalProps) {
  const handleClose = () => {
    haptics.light();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
            }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold">Mi Predicción</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <UserPositionCard
                market={market}
                userAddress={userAddress}
                onClaimSuccess={onClaimSuccess}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
