"use client"

import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
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
  <motion.div initial={{ y: 100 }} animate={{ y: 0 }} transition={{ duration: 1, }} viewport={{ once: true }}>
    <FloatingDock
      items={items}
      desktopClassName="
      fixed bottom-8 left-1/2 -translate-x-1/2
      bg-white/80 backdrop-blur-lg shadow-xl
        rounded-2xl px-6 py-3
        z-50
        "
      mobileClassName="
        fixed bottom-0 left-0 w-full
        bg-white border-t border-gray-200
        flex justify-around items-center py-3
        z-50
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
  <div className="flex items-center justify-center  h-[85dvh] w-screen gap-3 flex-col text-[2rem] font-bold">
    <div className="flex items-center justify-center h-50 ">
      <TextHoverEffect text="Persona Labs" />
    </div>
    <motion.div initial={{ y: 15 }} animate={{ y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-center flex-col">
      <div>Accelerate launches with <Highlight children={highlightText} /></div>
      <div> Test product-market fit and refine messaging before spending a dollar.</div>
    </motion.div>
    {button}

  </div>
)

export default function HomePage() {


  return (
    <div className="h-[100dvh] w-screen overflow-hidden">
      <HeroHighlight children={hero} />
      {dock}
    </div>
  )

}