"use client";

import React from "react";
import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import { HighlightButton } from "@/components/ui/animated-button";
import { HERO_CONTENT } from "@/lib/constants";
import type { HeroContent } from "@/lib/types";

interface HeroSectionProps {
  content?: Partial<HeroContent>;
  onCtaClick?: () => void;
}

export function HeroSection({ content = HERO_CONTENT, onCtaClick }: HeroSectionProps) {
  const heroContent = React.useMemo(() => ({ ...HERO_CONTENT, ...content }), [content]);

  const highlightText = (
    <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-3 py-1 rounded-xl shadow-sm">
      {heroContent.highlight}
    </span>
  );

  const heroInner = (
    <div className="flex items-center justify-center min-h-screen w-full flex-col px-4 py-8 pb-32">
      {/* Main Heading - Persona Labs */}
      <motion.h1 
        className="text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="text-gray-900">Persona </span>
        <span 
          className="bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent"
          style={{
            backgroundImage: 'linear-gradient(90deg, #4f46e5, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 30px rgba(79, 70, 229, 0.3))'
          }}
        >
          Labs
        </span>
      </motion.h1>
      
      {/* Subheading and Description */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex items-center justify-center flex-col text-center max-w-4xl mb-12"
      >
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-4 text-gray-900 leading-tight">
          {heroContent.subtitle} {highlightText}
        </h2>
        <p className="text-lg md:text-xl font-normal text-gray-600 max-w-2xl leading-relaxed">
          {heroContent.description}
        </p>
      </motion.div>
      
      {/* CTA Button */}
      <motion.button
        className="mt-8 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg rounded-2xl shadow-lg hover:scale-105 hover:from-indigo-700 hover:to-purple-700 active:translate-y-[1px] transition-all duration-200 flex items-center gap-3"
        onClick={onCtaClick}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ y: 1 }}
        aria-label={`${heroContent.cta} - Start your AI audience simulation`}
      >
        {heroContent.cta}
        <Rocket size={20} aria-hidden="true" />
      </motion.button>
    </div>
  );

  return (
    <HeroHighlight>
      {heroInner}
    </HeroHighlight>
  );
}