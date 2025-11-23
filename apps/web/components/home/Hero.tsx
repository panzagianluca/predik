"use client";

import { motion } from "framer-motion";
import { GlowingButton } from "@/components/ui/glowing-button";
import { Typewriter } from "@/components/ui/typewriter";

export function Hero() {
  const words = ["Política", "Economía", "Deportes", "Cultura"];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="text-4xl md:text-6xl font-bold text-foreground drop-shadow-lg mb-8 tracking-tight">
          El futuro tiene precio
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="text-xl md:text-3xl text-foreground/90 font-medium mb-12 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3"
      >
        <span>Predecí sobre</span>
        <Typewriter
          words={words}
          className="font-bold text-foreground drop-shadow-md"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        className="flex gap-4"
      >
        <GlowingButton href="https://app.predik.io">
          {["Comenzar", "a Predecir"]}
        </GlowingButton>
      </motion.div>
    </div>
  );
}
