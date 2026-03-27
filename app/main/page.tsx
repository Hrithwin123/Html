"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Users } from "lucide-react";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { MainLayout } from "@/components/layout/main-layout";
import { startSimulation } from "@/lib/api";

export default function MainPage() {
  const [productDescription, setProductDescription] = useState("");
  const [marketContext, setMarketContext] = useState("");
  const [numberOfPersonas, setNumberOfPersonas] = useState(500);
  const [weeks, setWeeks] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [animatingMarket, setAnimatingMarket] = useState(false);
  const marketInputRef = React.useRef<HTMLInputElement>(null);
  const marketCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const marketDataRef = React.useRef<any[]>([]);

  useEffect(() => {
    // Check if user is authenticated
    const userData = localStorage.getItem("user-data");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // Redirect to auth if not logged in
      window.location.href = "/auth";
    }
  }, []);

  const handleLaunchSimulation = async () => {
    if (!productDescription.trim()) return;

    setIsLoading(true);

    // Wait for market context animation to complete if it has text
    if (marketContext.trim()) {
      setAnimatingMarket(true);
      drawMarketCanvas();
      await animateMarketVanish();
      await new Promise(resolve => setTimeout(resolve, 500)); // Extra delay for smooth transition
    }

    try {
      // Call the Railway backend
      const result = await startSimulation({
        product: productDescription,
        market: marketContext || productDescription,
        personas: numberOfPersonas,
        weeks: weeks,
        // user object might have _id from mongoose or custom
        user_id: user?._id || user?.id || undefined,
      });

      // Store job ID for the loading/results page
      localStorage.setItem("currentJobId", result.job_id);

      // Navigate to loading page (it will poll for progress)
      window.location.href = `/loading`;
    } catch (error) {
      console.error("Error starting simulation:", error);
      alert("Failed to start simulation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const drawMarketCanvas = () => {
    if (!marketInputRef.current) return;
    const canvas = marketCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 800;
    ctx.clearRect(0, 0, 800, 800);
    const computedStyles = getComputedStyle(marketInputRef.current);

    const fontSize = parseFloat(computedStyles.getPropertyValue("font-size"));
    ctx.font = `${fontSize * 2}px ${computedStyles.fontFamily}`;
    ctx.fillStyle = "#FFF";
    ctx.fillText(marketContext, 16, 40);

    const imageData = ctx.getImageData(0, 0, 800, 800);
    const pixelData = imageData.data;
    const newData: any[] = [];

    for (let t = 0; t < 800; t++) {
      let i = 4 * t * 800;
      for (let n = 0; n < 800; n++) {
        let e = i + 4 * n;
        if (
          pixelData[e] !== 0 &&
          pixelData[e + 1] !== 0 &&
          pixelData[e + 2] !== 0
        ) {
          newData.push({
            x: n,
            y: t,
            color: [
              pixelData[e],
              pixelData[e + 1],
              pixelData[e + 2],
              pixelData[e + 3],
            ],
          });
        }
      }
    }

    marketDataRef.current = newData.map(({ x, y, color }) => ({
      x,
      y,
      r: 1,
      color: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`,
    }));
  };

  const animateMarketVanish = (): Promise<void> => {
    return new Promise((resolve) => {
      const maxX = marketDataRef.current.reduce(
        (prev, current) => (current.x > prev ? current.x : prev),
        0
      );

      const animateFrame = (pos: number = 0) => {
        requestAnimationFrame(() => {
          const newArr = [];
          for (let i = 0; i < marketDataRef.current.length; i++) {
            const current = marketDataRef.current[i];
            if (current.x < pos) {
              newArr.push(current);
            } else {
              if (current.r <= 0) {
                current.r = 0;
                continue;
              }
              current.x += Math.random() > 0.5 ? 1 : -1;
              current.y += Math.random() > 0.5 ? 1 : -1;
              current.r -= 0.05 * Math.random();
              newArr.push(current);
            }
          }
          marketDataRef.current = newArr;
          const ctx = marketCanvasRef.current?.getContext("2d");
          if (ctx) {
            ctx.clearRect(pos, 0, 800, 800);
            marketDataRef.current.forEach((t) => {
              const { x: n, y: i, r: s, color: color } = t;
              if (n > pos) {
                ctx.beginPath();
                ctx.rect(n, i, s, s);
                ctx.fillStyle = color;
                ctx.strokeStyle = color;
                ctx.stroke();
              }
            });
          }
          if (marketDataRef.current.length > 0) {
            animateFrame(pos - 8);
          } else {
            setAnimatingMarket(false);
            resolve();
          }
        });
      };
      animateFrame(maxX);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductDescription(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleLaunchSimulation();
  };

  const placeholders = [
    "AI-powered project management tool for remote teams...",
    "Sustainable fashion marketplace for Gen Z...",
    "Health insurance for gig workers in India...",
    "Smart home energy optimizer for suburban families...",
    "Blockchain-based supply chain tracker for SMBs...",
    "Mental health chatbot for college students...",
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <MainLayout navigationDelay={0}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/30 flex items-center justify-center px-4 py-8 pb-32 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none'%3E%3Ccircle fill='%23e5e7eb' opacity='0.4' cx='16' cy='16' r='1.5'%3E%3C/circle%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="w-full max-w-2xl relative z-10">
          {/* Back Button */}
          <motion.a
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-12 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ArrowLeft size={20} />
            Back to Home
          </motion.a>

          {/* Main Content */}
          <div className="text-center">
            {/* Welcome Message */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Users className="text-gray-700" size={24} />
                <span className="text-gray-600 text-lg">Welcome back, {user?.name}</span>
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Describe your product
            </motion.h1>

            {/* Description */}
            <motion.p
              className="text-gray-600 text-lg md:text-xl mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Tell us about your product and target market. We&apos;ll simulate adoption across
              hundreds of AI personas to predict product-market fit.
            </motion.p>

            {/* Product Input */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <PlaceholdersAndVanishInput
                placeholders={placeholders}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
              />
            </motion.div>

            {/* Market Context */}
            <motion.div
              className="mb-8 relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <div className="relative w-full h-14 rounded-full overflow-hidden shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),_0px_1px_0px_0px_rgba(25,28,33,0.02),_0px_0px_0px_1px_rgba(25,28,33,0.08)] transition duration-200 border border-gray-200 bg-white">
                <canvas
                  className={`absolute pointer-events-none text-base transform scale-50 top-[20%] left-2 sm:left-8 origin-top-left filter invert pr-20 ${
                    !animatingMarket ? "opacity-0" : "opacity-100"
                  }`}
                  ref={marketCanvasRef}
                />
                <input
                  ref={marketInputRef}
                  type="text"
                  placeholder="Target market context (e.g., 'Urban India, tech-savvy millennials')"
                  value={marketContext}
                  onChange={(e) => {
                    if (!animatingMarket) {
                      setMarketContext(e.target.value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && productDescription.trim() && !animatingMarket) {
                      handleLaunchSimulation();
                    }
                  }}
                  className={`w-full relative text-sm sm:text-base z-50 border-none bg-transparent text-black h-full rounded-full focus:outline-none focus:ring-0 pl-4 sm:pl-6 pr-4 ${
                    animatingMarket && "text-transparent"
                  }`}
                />
              </div>
            </motion.div>

            {/* Simulation Configuration Controls */}
            <motion.div
              className="mt-12 space-y-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Number of Personas Selector */}
              <div className="text-center group">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-900" />
                  <h3 className="text-base font-medium tracking-wide text-gray-700 group-hover:text-gray-900 transition-colors">
                    Simulation Sample Size
                  </h3>
                </div>
                
                <div className="flex items-center justify-center gap-3 flex-wrap mb-4">
                  {[20, 100, 500, 1000].map((number) => (
                    <button
                      key={number}
                      onClick={() => setNumberOfPersonas(number)}
                      className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                        numberOfPersonas === number
                          ? "bg-black text-white border-black shadow-lg scale-105"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900 shadow-sm"
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                  
                  {/* Custom Number Input */}
                  <div className="relative inline-flex items-center ml-2 border-b border-gray-200 focus-within:border-gray-400 transition-colors">
                    <span className="text-sm text-gray-500 mr-2">Custom:</span>
                    <input 
                      type="text"
                      value={numberOfPersonas}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setNumberOfPersonas(val === '' ? 0 : parseInt(val));
                      }}
                      className="w-16 bg-transparent py-1 text-sm focus:outline-none text-gray-900"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Higher numbers provide greater statistical accuracy but increase simulation time.
                </p>
              </div>

              {/* Simulation Horizon (Weeks) */}
              <div className="text-center group">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-900" />
                  <h3 className="text-base font-medium tracking-wide text-gray-700 group-hover:text-gray-900 transition-colors">
                    Projection Horizon
                  </h3>
                </div>
                
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {[4, 12, 26, 52].map((w) => (
                    <button
                      key={w}
                      onClick={() => setWeeks(w)}
                      className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                        weeks === w
                          ? "bg-black text-white border-black shadow-lg scale-105"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900 shadow-sm"
                      }`}
                    >
                      {w} Weeks
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Status Message */}
            {isLoading && (
              <motion.div
                className="flex items-center justify-center gap-2 text-gray-600 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                Starting simulation with {numberOfPersonas} personas...
              </motion.div>
            )}

            {/* Helper Text */}
            <motion.p
              className="text-gray-500 text-sm mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              Describe your product and press Enter to launch the simulation
            </motion.p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}