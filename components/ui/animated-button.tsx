"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";

export const AnimatedButton = ({
  children,
  className,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      className={cn(
        "relative overflow-hidden rounded-lg border-2 border-gray-800 px-8 py-4 text-2xl font-bold transition-all duration-300",
        "hover:scale-105 active:scale-95",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
    >
      {/* Background text (original color) */}
      <span className="relative z-10 text-gray-800 dark:text-white">
        {children}
      </span>
      
      {/* Animated highlight background */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{
          x: "-100%",
        }}
        animate={{
          x: isHovered ? "0%" : "-100%",
        }}
        transition={{
          duration: 0.6,
          ease: "easeOut",
        }}
        style={{
          background: "linear-gradient(to right, #6366f1, #a855f7)",
        }}
      >
        <span className="text-white font-bold">{children}</span>
      </motion.div>
      
      {/* Subtle glow effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-lg opacity-0"
        animate={{
          opacity: isHovered ? 0.3 : 0,
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{
          duration: 0.3,
        }}
        style={{
          background: "linear-gradient(to right, #6366f1, #a855f7)",
          filter: "blur(8px)",
        }}
      />
    </motion.button>
  );
};

export const HighlightButton = ({
  children,
  className,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}) => {
  return (
    <motion.button
      className={cn(
        "relative rounded-lg px-6 py-1 text-2xl font-bold transition-all duration-300",
        "bg-black text-white",
        "border border-indigo-400/30 shadow-lg",
        "hover:shadow-xl hover:shadow-indigo-500/25 hover:scale-105",
        "active:scale-95",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.5 }}
    >
      {children}
    </motion.button>
  );
};
