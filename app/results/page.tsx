"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Info, Eye, EyeOff, MessageSquare, BarChart3, Lightbulb, TrendingUp } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";

export default function ResultsPage() {
  const [user, setUser] = useState<any>(null);
  const [simulationInput, setSimulationInput] = useState("");
  const [simulationResults, setSimulationResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const userData = localStorage.getItem("user-data");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // Redirect to auth if not logged in
      window.location.href = "/auth";
    }

    // Get simulation input and results
    const input = localStorage.getItem("simulationInput");
    if (input) {
      setSimulationInput(input);
    }

    const results = localStorage.getItem("simulationResults");
    if (results) {
      try {
        setSimulationResults(JSON.parse(results));
      } catch (error) {
        console.error('Error parsing simulation results:', error);
      }
    }

    setLoading(false);
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!simulationResults) {
    return (
      <MainLayout navigationDelay={0}>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">No simulation results found</h2>
            <p className="text-gray-600 mb-6">Please run a simulation first.</p>
            <a href="/simulation" className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800">
              Go to Simulation
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

        <div className="w-full max-w-7xl mx-auto relative z-10">
          {/* Back Button */}
          <motion.a
            href="/simulation"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ArrowLeft size={20} />
            Back to Simulation
          </motion.a>

          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <BarChart3 className="text-gray-700" size={28} />
              <span className="text-gray-600 text-xl">Simulation Results</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Analysis Complete
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Here's how your personas responded to: <span className="font-semibold">"{simulationInput}"</span>
            </p>
          </motion.div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Analytics Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <AnalyticsSection analytics={simulationResults.analytics} />
            </motion.div>

            {/* Insights Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <InsightsSection insights={simulationResults.insights} />
            </motion.div>
          </div>

          {/* Conversations Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <ConversationsSection conversations={simulationResults.conversations} />
          </motion.div>

          {/* Individual Persona Responses Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8"
          >
            <PersonaResponsesSection personaOpinions={simulationResults.personaOpinions} />
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}

function AnalyticsSection({ analytics }: { analytics: any }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 h-full">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="text-gray-700" size={24} />
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
      </div>

      {/* Impact Score */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="text-gray-600" size={18} />
          <h3 className="text-lg font-semibold text-gray-900">Impact Score</h3>
          <Info className="text-gray-400" size={16} />
        </div>
        
        <div className="flex items-end gap-4 mb-4">
          <span className="text-4xl font-bold text-gray-900">{analytics.impactScore.score}</span>
          <span className="text-lg text-gray-500 mb-1">/{analytics.impactScore.maxScore}</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium mb-1 ${
            analytics.impactScore.color === 'green' ? 'bg-green-100 text-green-800' :
            analytics.impactScore.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {analytics.impactScore.level}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
          <div 
            className={`h-3 rounded-full ${
              analytics.impactScore.color === 'green' ? 'bg-gradient-to-r from-green-400 to-green-500' :
              analytics.impactScore.color === 'yellow' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
              'bg-gradient-to-r from-red-400 to-red-500'
            }`}
            style={{ width: `${analytics.impactScore.score}%` }}
          ></div>
        </div>
      </div>

      {/* Engagement Breakdown */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="text-gray-600" size={18} />
          <h3 className="text-lg font-semibold text-gray-900">Engagement</h3>
          <Info className="text-gray-400" size={16} />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="text-green-500" size={16} />
              <span className="text-gray-700">High Interest</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${analytics.engagement.highInterest}%` }}></div>
              </div>
              <span className="text-sm font-medium text-gray-900 w-8">{analytics.engagement.highInterest}%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="text-blue-500" size={16} />
              <span className="text-gray-700">Moderate Interest</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${analytics.engagement.moderateInterest}%` }}></div>
              </div>
              <span className="text-sm font-medium text-gray-900 w-8">{analytics.engagement.moderateInterest}%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <EyeOff className="text-red-500" size={16} />
              <span className="text-gray-700">Low Interest</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${analytics.engagement.lowInterest}%` }}></div>
              </div>
              <span className="text-sm font-medium text-gray-900 w-8">{analytics.engagement.lowInterest}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sentiment Breakdown */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="text-gray-600" size={18} />
          <h3 className="text-lg font-semibold text-gray-900">Sentiment</h3>
          <Info className="text-gray-400" size={16} />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Positive</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${analytics.sentiment?.positive || 0}%` }}></div>
              </div>
              <span className="text-sm font-medium text-gray-900 w-8">{analytics.sentiment?.positive || 0}%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
              <span className="text-gray-700">Neutral</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-gray-500 h-2 rounded-full" style={{ width: `${analytics.sentiment?.neutral || 0}%` }}></div>
              </div>
              <span className="text-sm font-medium text-gray-900 w-8">{analytics.sentiment?.neutral || 0}%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-gray-700">Negative</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${analytics.sentiment?.negative || 0}%` }}></div>
              </div>
              <span className="text-sm font-medium text-gray-900 w-8">{analytics.sentiment?.negative || 0}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightsSection({ insights }: { insights: any }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 h-full">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="text-gray-700" size={24} />
        <h2 className="text-2xl font-bold text-gray-900">Insights</h2>
        <Info className="text-gray-400" size={16} />
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-gray-900 font-medium text-lg leading-relaxed mb-4">
            {insights.primaryInsight}
          </p>
        </div>

        {insights.secondaryInsights.map((insight: string, index: number) => (
          <div key={index}>
            <p className="text-gray-700 leading-relaxed mb-4">
              {insight}
            </p>
          </div>
        ))}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-blue-100 rounded-full">
              <Lightbulb className="text-blue-600" size={16} />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">{insights.recommendation.title}</h4>
              <p className="text-blue-800 text-sm">
                {insights.recommendation.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConversationsSection({ conversations }: { conversations: any[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="text-gray-700" size={24} />
        <h2 className="text-2xl font-bold text-gray-900">Conversations</h2>
        <Info className="text-gray-400" size={16} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {conversations.map((conversation, index) => (
          <motion.div
            key={index}
            className="bg-gray-50 rounded-xl p-5 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <h3 className="font-semibold text-gray-900 mb-3">{conversation.title}</h3>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              {conversation.description}
            </p>
            
            <div className="space-y-2">
              {conversation.quotes.slice(0, 3).map((quote: string, quoteIndex: number) => (
                <div key={quoteIndex} className="border-l-3 border-gray-300 pl-3">
                  <p className="text-gray-700 text-sm italic">{quote}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PersonaResponsesSection({ personaOpinions }: { personaOpinions: any[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="text-gray-700" size={24} />
        <h2 className="text-2xl font-bold text-gray-900">Individual Responses</h2>
        <span className="text-sm text-gray-500 ml-2">({personaOpinions.length} personas)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personaOpinions.map((persona, index) => (
          <motion.div
            key={persona.personaId}
            className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          >
            {/* Persona Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {persona.personaName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{persona.personaName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    persona.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                    persona.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {persona.sentiment}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    persona.engagementLevel === 'high' ? 'bg-blue-100 text-blue-800' :
                    persona.engagementLevel === 'low' ? 'bg-orange-100 text-orange-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {persona.engagementLevel} interest
                  </span>
                </div>
              </div>
            </div>

            {/* Response */}
            <div className="mb-4">
              <p className="text-gray-700 leading-relaxed text-sm">
                "{persona.opinion}"
              </p>
            </div>

            {/* Key Points */}
            {persona.keyPoints && persona.keyPoints.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Key Points</h4>
                <div className="flex flex-wrap gap-1">
                  {persona.keyPoints.slice(0, 3).map((point: string, pointIndex: number) => (
                    <span 
                      key={pointIndex}
                      className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs text-gray-600"
                    >
                      {point}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}