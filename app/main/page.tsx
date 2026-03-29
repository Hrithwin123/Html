"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { startSimulation } from "@/lib/api";

const STEPS = [
  {
    id: "product",
    label: "01",
    question: "What are you building?",
    subtitle: "Describe your product, service, or idea in a sentence or two.",
    placeholder: "A solar-powered helmet with a built-in cooling fan for construction workers…",
    type: "text" as const,
  },
  {
    id: "market",
    label: "02",
    question: "Who is it for?",
    subtitle: "Tell us about your target market — demographics, geography, psychographics.",
    placeholder: "Blue-collar workers in urban India aged 25–45, earning ₹15k–₹30k/month…",
    type: "text" as const,
  },
  {
    id: "personas",
    label: "03",
    question: "How many AI personas?",
    subtitle: "More personas = higher statistical accuracy, but longer simulation time.",
    type: "choice" as const,
    options: [20, 100, 500, 1000],
    default: 500,
  },
  {
    id: "weeks",
    label: "04",
    question: "Projection horizon?",
    subtitle: "How many weeks of market adoption should we simulate?",
    type: "choice" as const,
    options: [4, 12, 26, 52],
    optionLabels: ["1 month", "3 months", "6 months", "1 year"],
    default: 12,
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    y: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    y: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

export default function MainPage() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<string, any>>({
    product: "",
    market: "",
    personas: 500,
    weeks: 12,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user-data");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      window.location.href = "/auth";
    }
  }, []);

  // Auto-focus text inputs on step change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (STEPS[step]?.type === "text" && inputRef.current) {
        inputRef.current.focus();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [step]);

  const currentStep = STEPS[step];
  const isLastStep = step === STEPS.length - 1;
  const canProceed =
    currentStep.type === "choice" ||
    (currentStep.type === "text" && answers[currentStep.id]?.trim().length > 0);

  const goNext = () => {
    if (!canProceed) return;
    if (isLastStep) {
      handleLaunch();
      return;
    }
    setDirection(1);
    setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step === 0) return;
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const handleLaunch = async () => {
    setIsLoading(true);
    try {
      const result = await startSimulation({
        product: answers.product,
        market: answers.market || answers.product,
        personas: answers.personas,
        weeks: answers.weeks,
        user_id: user?._id || user?.id || undefined,
      });
      localStorage.setItem("currentJobId", result.job_id);
      window.location.href = `/loading`;
    } catch (error) {
      console.error("Error starting simulation:", error);
      alert("Failed to start simulation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  return (
    <MainLayout navigationDelay={0}>
      <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
        
        {/* Progress Bar */}
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-100">
          <motion.div
            className="h-full bg-black"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        {/* Step Counter */}
        <div className="fixed top-6 right-8 z-50">
          <span className="text-xs font-mono text-gray-400">
            {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
          </span>
        </div>

        {/* Back Button */}
        {step > 0 && (
          <motion.button
            className="fixed top-6 left-8 z-50 flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors text-sm"
            onClick={goBack}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <ArrowLeft size={16} />
            Back
          </motion.button>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-center px-6 md:px-16 lg:px-24">
          <div className="w-full max-w-3xl">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="w-full"
              >
                {/* Step Label */}
                <p className="text-xs font-mono text-gray-300 mb-4 tracking-widest uppercase">
                  {currentStep.label}
                </p>

                {/* Question */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight tracking-tight">
                  {currentStep.question}
                </h1>

                {/* Subtitle */}
                <p className="text-lg text-gray-400 mb-12 max-w-xl leading-relaxed">
                  {currentStep.subtitle}
                </p>

                {/* Input Area */}
                {currentStep.type === "text" && (
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={answers[currentStep.id] || ""}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [currentStep.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && canProceed) goNext();
                      }}
                      placeholder={currentStep.placeholder}
                      className="w-full text-2xl md:text-3xl font-light text-gray-900 placeholder-gray-200 bg-transparent border-b-2 border-gray-200 focus:border-black pb-4 pr-16 outline-none transition-colors duration-300"
                    />
                    {canProceed && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={goNext}
                        className="absolute right-0 bottom-3 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                      >
                        <ArrowRight size={18} />
                      </motion.button>
                    )}
                  </div>
                )}

                {currentStep.type === "choice" && (
                  <div className="space-y-3">
                    {currentStep.options?.map((option, idx) => {
                      const isSelected = answers[currentStep.id] === option;
                      const label = currentStep.optionLabels
                        ? `${option} — ${currentStep.optionLabels[idx]}`
                        : `${option} personas`;
                      return (
                        <motion.button
                          key={option}
                          onClick={() => {
                            setAnswers((prev) => ({ ...prev, [currentStep.id]: option }));
                          }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.08 }}
                          className={`w-full flex items-center justify-between px-8 py-5 rounded-2xl text-left text-lg font-medium transition-all duration-200 border-2 ${
                            isSelected
                              ? "bg-black text-white border-black"
                              : "bg-white text-gray-700 border-gray-100 hover:border-gray-300"
                          }`}
                        >
                          <span>{label}</span>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              <Check size={20} />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}

                    {/* Custom input for personas */}
                    {currentStep.id === "personas" && (
                      <div className="flex items-center gap-3 px-8 py-4 rounded-2xl border-2 border-dashed border-gray-200">
                        <span className="text-gray-400 text-sm">Custom:</span>
                        <input
                          type="number"
                          value={answers.personas}
                          onChange={(e) =>
                            setAnswers((prev) => ({
                              ...prev,
                              personas: parseInt(e.target.value) || 20,
                            }))
                          }
                          className="text-lg font-medium bg-transparent outline-none text-gray-900 w-24"
                        />
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 px-8 pb-8 pt-4 bg-gradient-to-t from-white via-white to-transparent">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i <= step ? "bg-black w-8" : "bg-gray-200 w-4"
                  }`}
                />
              ))}
            </div>

            {(currentStep.type === "choice" || isLastStep) && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={goNext}
                disabled={isLoading}
                className={`flex items-center gap-3 px-8 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  isLoading
                    ? "bg-gray-200 text-gray-400 cursor-wait"
                    : "bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Launching…
                  </>
                ) : isLastStep ? (
                  <>
                    Launch Simulation
                    <ArrowRight size={16} />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}