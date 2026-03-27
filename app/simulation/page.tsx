"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Users, X, MapPin, Briefcase, GraduationCap, Heart } from "lucide-react";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { MainLayout } from "@/components/layout/main-layout";
import { PersonaNetworkDisplay } from "@/components/PersonaNetworkDisplay";
import { PersonaChat } from "@/components/PersonaChat";
import { type Persona } from "@/lib/demo-personas";

export default function SimulationPage() {
  const [testInput, setTestInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [hoveredPersona, setHoveredPersona] = useState<Persona | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const userData = localStorage.getItem("user-data");
    if (userData) {
      setUser(JSON.parse(userData));
      loadPersonas(JSON.parse(userData));
    } else {
      // Redirect to auth if not logged in
      window.location.href = "/auth";
    }
  }, []);

  const loadPersonas = async (userData: any) => {
    try {
      // First try to get from localStorage (just generated)
      const storedPersonas = localStorage.getItem('currentPersonas');
      if (storedPersonas) {
        setPersonas(JSON.parse(storedPersonas));
        setLoading(false);
        return;
      }

      // Otherwise fetch from database
      const response = await fetch(`/api/networks/${userData._id}`);
      if (response.ok) {
        const data = await response.json();
        setPersonas(data.personas);
      } else {
        // If no personas found, redirect back to main page
        window.location.href = "/main";
      }
    } catch (error) {
      console.error('Error loading personas:', error);
      window.location.href = "/main";
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Track mouse position for tooltip
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    if (hoveredPersona) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [hoveredPersona]);

  const handleRunSimulation = async () => {
    if (!testInput.trim()) return;
    
    setIsRunning(true);
    
    // Store the test input and personas for the loading page
    localStorage.setItem("simulationInput", testInput);
    localStorage.setItem("simulationPersonas", JSON.stringify(personas));
    localStorage.setItem("simulationUserId", user._id);
    
    // Wait for the text vanishing animation to complete (approximately 2 seconds)
    setTimeout(() => {
      // Navigate to loading page after animation completes
      window.location.href = "/loading";
    }, 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTestInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleRunSimulation();
  };

  const testPlaceholders = [
    "Would this post resonate with LinkedIn founders?",
    "Will my YouTube video idea click?",
    "Pitching an AI tool — would investors care?",
    "Would this meme flop or fly on Twitter?",
    "Launching a new app — how would Reddit react?"
  ];

  if (loading) {
    return (
      <MainLayout navigationDelay={0}>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your personas...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout navigationDelay={0}>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
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

        <div className="w-full max-w-6xl mx-auto relative z-10">
          {/* Back Button */}
          <motion.a
            href="/main"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ArrowLeft size={20} />
            Back to Setup
          </motion.a>

          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="text-gray-700" size={28} />
              <span className="text-gray-600 text-xl">Society Simulation</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Your AI Personas Network
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              These AI personas will respond to your questions based on their unique backgrounds and perspectives.
            </p>
          </motion.div>

          {/* Personas Network */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              {/* Personas Network Display */}
              <PersonaNetworkDisplay 
                personas={personas}
                onPersonaClick={(persona) => setSelectedPersona(persona)}
                onPersonaHover={(persona) => setHoveredPersona(persona)}
                onPersonaLeave={() => setHoveredPersona(null)}
              />
            </div>
          </motion.div>

          {/* Test Input Section */}
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Test Your Society
              </h2>
              <p className="text-gray-600">
                Ask a question or present a scenario to see how each persona responds
              </p>
            </div>

            <div className="mb-8">
              <PlaceholdersAndVanishInput
                placeholders={testPlaceholders}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
              />
            </div>



            {/* Helper Text */}
            <motion.p
              className="text-gray-500 text-sm text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Each persona will respond based on their unique background and personality
            </motion.p>
          </motion.div>
        </div>

        {/* Hover Tooltip */}
        <AnimatePresence>
          {hoveredPersona && (
            <motion.div
              className="fixed pointer-events-none z-[9998] bg-black/90 backdrop-blur-sm text-white px-4 py-3 rounded-xl text-sm max-w-xs shadow-2xl border border-gray-700"
              style={{
                left: mousePosition.x + 15,
                top: mousePosition.y - 10,
              }}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                x: mousePosition.x + 15 > window.innerWidth - 300 ? -315 : 0
              }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ 
                duration: 0.15,
                ease: "easeOut",
                x: { duration: 0.1 }
              }}
            >
              <div className="font-semibold text-white">{hoveredPersona.name}</div>
              <div className="text-xs text-gray-200 mt-1 leading-relaxed">
                {hoveredPersona.bio.substring(0, 120)}...
              </div>
              <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                Click for full details
              </div>
              
              {/* Tooltip Arrow */}
              <div 
                className="absolute w-2 h-2 bg-black/90 rotate-45 border-l border-t border-gray-700"
                style={{
                  left: mousePosition.x + 15 > window.innerWidth - 300 ? 'calc(100% - 20px)' : '-4px',
                  top: '12px'
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Persona Details Modal */}
        <AnimatePresence>
          {selectedPersona && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPersona(null)}
            >
              <motion.div
                className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="relative p-6 border-b border-gray-200">
                  <button
                    onClick={() => setSelectedPersona(null)}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                  
                  <div className="flex items-start gap-4">
                    <img
                      src={selectedPersona.image}
                      alt={selectedPersona.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900">{selectedPersona.name}</h2>
                      <p className="text-gray-600 flex items-center gap-1 mt-1">
                        <Briefcase size={16} />
                        {selectedPersona.occupation}
                      </p>
                      <p className="text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin size={16} />
                        {selectedPersona.location}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">{selectedPersona.bio}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Personality */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Heart size={18} />
                      Personality & Values
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Traits</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedPersona.personality.traits.map((trait, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Values</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedPersona.personality.values.map((value, index) => (
                            <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                              {value}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700 mb-2">Communication Style</h4>
                      <p className="text-gray-600 text-sm">{selectedPersona.personality.communication_style}</p>
                    </div>
                  </div>

                  {/* Background */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <GraduationCap size={18} />
                      Background & Experience
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-700">Education</h4>
                        <p className="text-gray-600 text-sm">{selectedPersona.background.education}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700">Experience</h4>
                        <p className="text-gray-600 text-sm">{selectedPersona.background.experience}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700">Interests</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedPersona.background.interests.map((interest, index) => (
                            <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Social */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Users size={18} />
                      Social Profile
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-700">Network Size</h4>
                        <p className="text-gray-600 text-sm">{selectedPersona.social.network_size}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700">Influence Level</h4>
                        <p className="text-gray-600 text-sm">{selectedPersona.social.influence_level}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700">Preferred Platforms</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedPersona.social.preferred_platforms.map((platform, index) => (
                            <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                              {platform}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chat Component */}
                  <PersonaChat persona={selectedPersona} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}

interface PersonaNodeProps {
  persona: Persona;
  isCenter?: boolean;
  onClick?: () => void;
  onHover?: () => void;
  onLeave?: () => void;
}

function PersonaNode({ persona, isCenter = false, onClick, onHover, onLeave }: PersonaNodeProps) {
  return (
    <motion.div
      className={`relative bg-white rounded-2xl shadow-lg border border-gray-200 p-3 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden ${
        isCenter ? "w-36 h-40 md:w-40 md:h-44" : "w-32 h-36 md:w-36 md:h-40"
      }`}
      whileHover={{ scale: 1.05, y: -5 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: Math.random() * 0.3 }}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Profile Image */}
      <div className="relative mb-2">
        <img
          src={persona.image}
          alt={persona.name}
          className={`rounded-full object-cover mx-auto ${
            isCenter ? "w-16 h-16 md:w-18 md:h-18" : "w-14 h-14 md:w-16 md:h-16"
          }`}
        />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
      </div>

      {/* Name */}
      <h3 className={`font-semibold text-gray-900 text-center leading-tight truncate px-1 ${
        isCenter ? "text-sm md:text-base" : "text-xs md:text-sm"
      }`}>
        {persona.name}
      </h3>

      {/* Occupation */}
      <p className={`text-gray-500 text-center leading-tight mt-1 px-1 ${
        isCenter ? "text-xs md:text-sm" : "text-xs"
      }`}>
        <span className="block truncate">
          {persona.occupation.length > 20 ? 
            persona.occupation.substring(0, 20) + '...' : 
            persona.occupation
          }
        </span>
      </p>

      {/* Location */}
      <p className={`text-gray-400 text-center truncate px-1 ${
        isCenter ? "text-xs" : "text-xs"
      }`}>
        {persona.location.split(',')[0]}
      </p>
    </motion.div>
  );
}