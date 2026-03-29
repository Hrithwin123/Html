"use client"

import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { ParticleText } from "@/components/ui/particle-text";
import { FloatingDock } from "@/components/ui/floating-dock";
import { Home, MessageCircle, User, FileText, Rocket } from "lucide-react";
import { motion } from "framer-motion"
import { HighlightButton } from "@/components/ui/animated-button";


const highlightText = (
  <span className="px-2 ">AI audience simulations.</span>
)


const items = [
  { title: "Home", icon: <Home size={22} />, href: "/" },
  { title: "About", icon: <FileText size={22} />, href: "/about" },
  { title: "Join Us", icon: <User size={22} />, href: "/auth" },
  { title: "Launch", icon: <Rocket size={22} />, href: "/main" },
  { title: "Contact Us", icon: <MessageCircle size={22} />, href: "/contact-us" },

];


export const dock = (
  <motion.div 
    initial={{ opacity: 0, y: 30 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ duration: 1, delay: 0.6 }} 
    className="relative z-[150] mt-20 flex items-center justify-center w-full -ml-24"
  >
    <FloatingDock
      items={items}
      desktopClassName="
        bg-white/90 backdrop-blur-xl shadow-2xl
        rounded-2xl px-6 py-3 border border-gray-100/50
        "
      mobileClassName="
        bg-white/95 backdrop-blur-md border border-gray-200
        flex justify-around items-center py-3
        rounded-3xl shadow-lg w-full max-w-[90vw] -ml-8
        "
    />
  </motion.div>
);

const button = (
  <div className="mb-20 mt-5 h-[60px]">
    {/* Invisible spacer to maintain layout */}
  </div>
)


const hero = (
  <div className="flex items-center justify-center min-h-[100dvh] w-full gap-2 flex-col text-[2rem] font-bold py-10">
    <div className="w-full max-w-5xl flex items-center justify-center relative z-[100] -mb-10">
      <ParticleText 
        text="Persona Labs" 
        fontSize={140} 
        particleSize={1.1}
        particleGap={3}
      />
    </div>
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.8, delay: 0.4 }} 
      className="flex items-center justify-center flex-col z-[100] text-center px-4"
    >
      <div className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-black flex flex-wrap items-center justify-center gap-2">
        Accelerate launches with <Highlight children={highlightText} />
      </div>
      <div className="text-gray-400 font-medium text-xl md:text-2xl mt-6 max-w-3xl leading-relaxed">
        Test product-market fit and refine messaging before spending a dollar.
      </div>
    </motion.div>
    {dock}
  </div>
)

export default function HomePage() {


  return (
    <div className="h-[100dvh] w-screen overflow-hidden">
      <HeroHighlight children={hero} />
    </div>
  )

}