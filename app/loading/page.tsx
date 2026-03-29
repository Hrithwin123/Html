"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Users, Brain, BarChart3, Zap, TrendingUp } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { PersonaNetworkDisplay } from "@/components/PersonaNetworkDisplay";
import { ParticleText } from "@/components/ui/particle-text";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LoadingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [simulationStatus, setSimulationStatus] = useState<'running' | 'completed' | 'error'>('running');
  const [progressMessage, setProgressMessage] = useState("Starting simulation...");
  const [error, setError] = useState<string | null>(null);

  // Create generic placeholder personas for the network display
  const dummyPersonas = [
    { id: '1', name: 'Persona 1', occupation: 'Analyzing...', location: '', image: 'https://randomuser.me/api/portraits/women/1.jpg', bio: '', age: 25, gender: 'female' as const, personality: { traits: [], values: [], communication_style: '' }, background: { education: '', experience: '', interests: [] }, social: { network_size: '', influence_level: '', preferred_platforms: [] } },
    { id: '2', name: 'Persona 2', occupation: 'Analyzing...', location: '', image: 'https://randomuser.me/api/portraits/men/2.jpg', bio: '', age: 30, gender: 'male' as const, personality: { traits: [], values: [], communication_style: '' }, background: { education: '', experience: '', interests: [] }, social: { network_size: '', influence_level: '', preferred_platforms: [] } },
    { id: '3', name: 'Persona 3', occupation: 'Analyzing...', location: '', image: 'https://randomuser.me/api/portraits/women/3.jpg', bio: '', age: 28, gender: 'female' as const, personality: { traits: [], values: [], communication_style: '' }, background: { education: '', experience: '', interests: [] }, social: { network_size: '', influence_level: '', preferred_platforms: [] } },
    { id: '4', name: 'Persona 4', occupation: 'Analyzing...', location: '', image: 'https://randomuser.me/api/portraits/men/4.jpg', bio: '', age: 35, gender: 'male' as const, personality: { traits: [], values: [], communication_style: '' }, background: { education: '', experience: '', interests: [] }, social: { network_size: '', influence_level: '', preferred_platforms: [] } },
    { id: '5', name: 'Persona 5', occupation: 'Analyzing...', location: '', image: 'https://randomuser.me/api/portraits/women/5.jpg', bio: '', age: 27, gender: 'female' as const, personality: { traits: [], values: [], communication_style: '' }, background: { education: '', experience: '', interests: [] }, social: { network_size: '', influence_level: '', preferred_platforms: [] } },
    { id: '6', name: 'Persona 6', occupation: 'Analyzing...', location: '', image: 'https://randomuser.me/api/portraits/men/6.jpg', bio: '', age: 32, gender: 'male' as const, personality: { traits: [], values: [], communication_style: '' }, background: { education: '', experience: '', interests: [] }, social: { network_size: '', influence_level: '', preferred_platforms: [] } },
    { id: '7', name: 'Persona 7', occupation: 'Analyzing...', location: '', image: 'https://randomuser.me/api/portraits/women/7.jpg', bio: '', age: 29, gender: 'female' as const, personality: { traits: [], values: [], communication_style: '' }, background: { education: '', experience: '', interests: [] }, social: { network_size: '', influence_level: '', preferred_platforms: [] } },
    { id: '8', name: 'Persona 8', occupation: 'Analyzing...', location: '', image: 'https://randomuser.me/api/portraits/men/8.jpg', bio: '', age: 33, gender: 'male' as const, personality: { traits: [], values: [], communication_style: '' }, background: { education: '', experience: '', interests: [] }, social: { network_size: '', influence_level: '', preferred_platforms: [] } },
  ];

  const loadingSteps = [
    { text: "Queued — waiting to start", icon: Users, duration: 1000 },
    { text: "Generating market config via LLM", icon: Brain, duration: 2000 },
    { text: "Creating AI personas", icon: Users, duration: 2000 },
    { text: "Scoring product-market fit", icon: BarChart3, duration: 1500 },
    { text: "Running GNN adoption simulation", icon: TrendingUp, duration: 3000 },
    { text: "Analyzing adoption drivers & objections", icon: MessageCircle, duration: 2500 },
    { text: "Generating visualization & insights", icon: Zap, duration: 1500 }
  ];

  useEffect(() => {
    // Check if user is authenticated
    const userData = localStorage.getItem("user-data");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      window.location.href = "/auth";
      return;
    }

    // Get job ID from localStorage (set by main page)
    const storedJobId = localStorage.getItem("currentJobId");
    if (!storedJobId) {
      console.error("No job ID found");
      window.location.href = "/main";
      return;
    }
    setJobId(storedJobId);
  }, []);

  // Poll the Python backend for progress
  useEffect(() => {
    if (!jobId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE}/simulate/${jobId}`);
        const data = await response.json();

        setCurrentStep(data.progress_step || 0);
        setProgressMessage(data.progress || "Running...");

        if (data.status === "done") {
          setSimulationStatus("completed");
          clearInterval(pollInterval);
          // Redirect immediately to results with a flag to skip polling
          setTimeout(() => {
            window.location.href = `/results-frontend?jobId=${jobId}&skipPoll=true`;
          }, 1000);
        } else if (data.status === "failed") {
          setSimulationStatus("error");
          setError(data.error || "Simulation failed");
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error("Polling error:", err);
        setError("Failed to connect to simulation backend");
        setSimulationStatus("error");
        clearInterval(pollInterval);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [jobId]);

  if (!user || !jobId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (simulationStatus === 'error') {
    return (
      <MainLayout navigationDelay={0}>
        <div className="min-h-screen flex items-center justify-center bg-white px-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Simulation Failed</h2>
            <p className="text-gray-600 mb-6">{error || "An error occurred during simulation"}</p>
            <a
              href="/main"
              className="inline-block px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
            >
              Try Again
            </a>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout navigationDelay={0}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 px-4 py-8 pb-32 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none'%3E%3Ccircle fill='%23e5e7eb' opacity='0.4' cx='16' cy='16' r='1.5'%3E%3C/circle%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="w-full max-w-6xl mx-auto relative z-40">
          {/* Particle Text Header */}
          <div className="mb-4">
            <ParticleText
              text="Persona Labs"
              fontSize={90}
              particleSize={1.6}
              particleGap={3}
            />
          </div>
          <motion.div
            className="text-center mb-8 -mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <p className="text-gray-500 text-lg">
              Simulating market adoption across AI personas
            </p>
            <p className="text-sm text-gray-300 mt-2 font-mono">Job ID: {jobId}</p>
          </motion.div>

          {/* Main Content - 70/30 Layout */}
          <div className="flex items-start justify-center gap-12 w-full">
            {/* Persona Network Display - 70% */}
            <motion.div
              className="flex-shrink-0"
              style={{ width: "70%" }}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 min-h-[500px]">
                {/* Show personas only after step 2 (personas generated) */}
                {currentStep >= 2 ? (
                  <>
                    <PersonaNetworkDisplay
                      personas={dummyPersonas}
                      onPersonaClick={() => { }}
                    />

                    {/* Show animated messages only during step 4+ (simulation running) */}
                    {currentStep >= 4 && (
                      <div className="absolute inset-6 pointer-events-none" style={{ zIndex: 20 }}>
                        {/* Top row horizontal connections */}
                        <AnimatedMessage from="15%" to="40%" fromY="25%" toY="15%" delay={0} />
                        <AnimatedMessage from="40%" to="60%" fromY="15%" toY="15%" delay={1} />
                        <AnimatedMessage from="60%" to="85%" fromY="15%" toY="25%" delay={2} />

                        {/* Bottom row horizontal connections */}
                        <AnimatedMessage from="15%" to="40%" fromY="75%" toY="85%" delay={0.5} />
                        <AnimatedMessage from="40%" to="60%" fromY="85%" toY="85%" delay={1.5} />
                        <AnimatedMessage from="60%" to="85%" fromY="85%" toY="75%" delay={2.5} />

                        {/* Vertical connections */}
                        <AnimatedMessage from="15%" to="15%" fromY="25%" toY="75%" delay={3} />
                        <AnimatedMessage from="85%" to="85%" fromY="25%" toY="75%" delay={3.5} />

                        {/* Diagonal connections */}
                        <AnimatedMessage from="15%" to="40%" fromY="25%" toY="85%" delay={4} />
                        <AnimatedMessage from="60%" to="85%" fromY="15%" toY="75%" delay={4.5} />
                      </div>
                    )}
                  </>
                ) : (
                  /* Show message before personas are generated */
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center max-w-md px-6">
                      <motion.div
                        className="w-20 h-20 mx-auto mb-6 rounded-full border-4 border-gray-200 border-t-black"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        Generating AI Personas
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        AI personas are being created and will appear here once ready.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Loading Steps - 30% */}
            <motion.div
              className="flex-shrink-0"
              style={{ width: "30%" }}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="space-y-3">
                {loadingSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index <= currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <motion.div
                      key={index}
                      className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${isActive ? "bg-white shadow-md border border-gray-100" : "bg-transparent"
                        }`}
                      initial={{ opacity: 0.5 }}
                      animate={{
                        opacity: isActive ? 1 : 0.5,
                        scale: isCurrent ? 1.02 : 1
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`p-2.5 rounded-full transition-colors ${isActive ? "bg-black text-white" : "bg-gray-200 text-gray-400"
                        }`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm font-medium block ${isActive ? "text-gray-900" : "text-gray-500"
                          }`}>
                          {step.text}
                        </span>
                        {isCurrent && (
                          <span className="text-xs text-gray-400 mt-1 block">
                            {progressMessage}
                          </span>
                        )}
                      </div>
                      {isCurrent && (
                        <motion.div
                          className="ml-auto"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full"></div>
                        </motion.div>
                      )}
                      {isActive && !isCurrent && (
                        <div className="ml-auto">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Progress Bar */}
              <div className="mt-8 bg-gray-100 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / 6) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-xs text-gray-400 text-center mt-2 font-mono">
                Step {currentStep}/6
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Original AnimatedMessage component
function AnimatedMessage({ from, to, fromY, toY, delay }: {
  from: string;
  to: string;
  fromY: string;
  toY: string;
  delay: number;
}) {
  return (
    <motion.div
      className="absolute w-5 h-5 bg-black rounded-full flex items-center justify-center shadow-lg"
      style={{ zIndex: 20 }}
      initial={{
        left: from,
        top: fromY,
        x: "-50%",
        y: "-50%"
      }}
      animate={{
        left: [from, to, from],
        top: [fromY, toY, fromY],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut"
      }}
    >
      <MessageCircle size={10} className="text-white" />
    </motion.div>
  );
}

// Animated character faces component
function AnimatedCharacterFaces() {
  const characters = [
    { left: '15%', top: '25%', color: 'from-blue-100 to-blue-200', eyeColor: 'bg-blue-900', hairStyle: 'short', delay: 0 },
    { left: '40%', top: '15%', color: 'from-green-100 to-green-200', eyeColor: 'bg-green-900', hairStyle: 'long', delay: 0.2 },
    { left: '60%', top: '15%', color: 'from-purple-100 to-purple-200', eyeColor: 'bg-purple-900', hairStyle: 'spiky', delay: 0.4 },
    { left: '85%', top: '25%', color: 'from-pink-100 to-pink-200', eyeColor: 'bg-pink-900', hairStyle: 'curly', delay: 0.6 },
    { left: '15%', top: '75%', color: 'from-yellow-100 to-yellow-200', eyeColor: 'bg-yellow-900', hairStyle: 'short', delay: 0.8 },
    { left: '40%', top: '85%', color: 'from-red-100 to-red-200', eyeColor: 'bg-red-900', hairStyle: 'long', delay: 1 },
    { left: '60%', top: '85%', color: 'from-indigo-100 to-indigo-200', eyeColor: 'bg-indigo-900', hairStyle: 'spiky', delay: 1.2 },
    { left: '85%', top: '75%', color: 'from-gray-100 to-gray-200', eyeColor: 'bg-gray-900', hairStyle: 'curly', delay: 1.4 },
  ];

  return (
    <div className="absolute inset-0">
      {characters.map((char, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: char.left, top: char.top, transform: 'translate(-50%, -50%)' }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: char.delay }}
        >
          <motion.div
            className={`w-28 h-32 bg-gradient-to-b ${char.color} rounded-2xl shadow-lg border border-white/40 flex flex-col items-center justify-center relative overflow-hidden`}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            {/* Hair */}
            <div className="absolute -top-1">
              {char.hairStyle === 'short' && (
                <div className="flex gap-1">
                  <div className={`w-1.5 h-3 ${char.eyeColor} rounded-full -rotate-12`} />
                  <div className={`w-1.5 h-4 ${char.eyeColor} rounded-full`} />
                </div>
              )}
              {char.hairStyle === 'long' && (
                <div className={`w-4 h-2 ${char.eyeColor} rounded-full`} />
              )}
              {char.hairStyle === 'spiky' && (
                <div className={`w-2 h-4 ${char.eyeColor} rounded-full rotate-[10deg]`} />
              )}
              {char.hairStyle === 'curly' && (
                <div className="flex gap-1">
                  <div className={`w-1 h-3 ${char.eyeColor} rounded-full -rotate-12`} />
                  <div className={`w-1 h-3 ${char.eyeColor} rounded-full rotate-12`} />
                </div>
              )}
            </div>

            {/* Animated Eyes */}
            <motion.div
              className="flex gap-2.5 mt-6"
              animate={{
                x: [0, 2, 0, -2, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: char.delay,
                ease: "easeInOut"
              }}
            >
              <motion.div
                className={`w-1.5 h-1.5 ${char.eyeColor} rounded-full`}
                animate={{
                  scaleY: [1, 0.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: char.delay + 1,
                  repeatDelay: 2
                }}
              />
              <motion.div
                className={`w-1.5 h-1.5 ${char.eyeColor} rounded-full`}
                animate={{
                  scaleY: [1, 0.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: char.delay + 1,
                  repeatDelay: 2
                }}
              />
            </motion.div>

            {/* Mouth */}
            <motion.div
              className={`w-3 h-0.5 ${char.eyeColor}/40 rounded-full mt-2`}
              animate={{
                scaleX: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: char.delay + 0.5,
              }}
            />

            {/* Label */}
            <div className="absolute bottom-2 text-xs font-semibold text-gray-600">
              P{i + 1}
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}