"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

export default function AboutPage() {
  const fullText = "At Persona Labs, we believe that every great idea deserves to be heard before it's even shared with the world. That's why we built a space where storytellers, creators, founders, and innovators can test their messages, their pitches, and their content in safe, simulated communities. Whether you want to see how LinkedIn founders might respond to your startup post, or how Reddit's tech crowd would react to your app concept, Persona Labs lets you experiment first, launch later. We bring audiences to you without the risk. Our AI-powered simulations generate feedback from diverse personas, giving you real insight into tone, impact and resonance. From the initial spark of an idea to its final delivery, we help you refine your message, sharpen your strategy, and build with confidence. Our vision: to make audience feedback an integral part of every launch so what you say actually connects.";

  return (
    <MainLayout navigationDelay={0}>
      <div className="min-h-screen bg-white px-4 py-8 pb-32 relative overflow-hidden">
        <div className="w-full max-w-5xl mx-auto relative z-10">
          {/* Back Button */}
          <motion.a
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-16 transition-colors group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </motion.a>

          {/* Header */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-black mb-8 leading-none tracking-tight">
              About Us
            </h1>
            <div className="w-24 h-1 bg-black"></div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            className="max-w-4xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <TextGenerateEffect
              words={fullText}
              className="text-2xl md:text-3xl leading-relaxed text-black font-normal"
              duration={0.6}
              filter={true}
            />
          </motion.div>

          {/* Subtle Accent */}
          <motion.div
            className="mt-20 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.5 }}
          >
            <div className="w-2 h-2 bg-black rounded-full"></div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}