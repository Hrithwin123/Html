"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { HeroHighlight } from "@/components/ui/hero-highlight";
import { PersonaNetworkCanvas, type CanvasPersona } from "@/components/PersonaNetworkCanvas";
import { motion } from "framer-motion";
import { AdoptionCurve } from "@/components/AdoptionCurve";
import { SimulationReport } from "@/components/SimulationReport";
import { useEffect, useState, useMemo } from "react";
import {
  getAdoptionCurve,
  getGraphData,
  getInsights,
  getIntelligence,
  getNarratives,
  getMarketConfig,
  pollUntilDone,
  type AdoptionCurvePoint,
  type GraphData,
  type SimulationInsights,
  type AdoptionIntelligence,
  type MarketConfig,
  type JobStatus,
} from "@/lib/api";

// ── helpers ──────────────────────────────────────────────────────────────────

// Animation variants for staggered text reveals
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

function SectionLabel({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <motion.div 
      className="flex items-center gap-4 mb-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUp}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className={`h-8 w-1 ${color} rounded-full`}
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
      <h2 className="text-3xl font-bold tracking-tight">{children}</h2>
    </motion.div>
  );
}

function Card({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div 
      className={`bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-shadow ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeInUp}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

function CardTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <motion.div 
      className="mb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-400 text-xs font-mono uppercase tracking-widest">{sub}</p>
    </motion.div>
  );
}

// ── sentiment helper for network canvas ──────────────────────────────────────

function sentimentFromNode(node: { adopted: boolean; fit_score: number }): "positive" | "neutral" | "negative" {
  if (node.adopted) return "positive";
  if (node.fit_score > 50) return "neutral";
  return "negative";
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function ResultsFrontendPage() {
  // ── state ──
  const [jobId, setJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [pollStatus, setPollStatus] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── fetched data ──
  const [curveData, setCurveData] = useState<AdoptionCurvePoint[] | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [insights, setInsights] = useState<SimulationInsights | null>(null);
  const [intelligence, setIntelligence] = useState<AdoptionIntelligence | null>(null);
  const [narratives, setNarratives] = useState<{ type: string; week?: number; narrative: string }[] | null>(null);
  const [marketConfig, setMarketConfig] = useState<MarketConfig | null>(null);

  // ── read jobId from URL or localStorage ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("jobId") || localStorage.getItem("currentJobId");
    const skipPoll = params.get("skipPoll") === "true";
    
    if (id) {
      setJobId(id);
      if (skipPoll) {
        // Skip polling, go straight to fetching results
        setPolling(false);
        setLoading(true);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // ── poll + fetch when jobId is set ──
  useEffect(() => {
    if (!jobId) return;

    async function run() {
      try {
        const params = new URLSearchParams(window.location.search);
        const skipPoll = params.get("skipPoll") === "true";
        
        if (!skipPoll) {
          setPolling(true);
          setError(null);

          // Poll until done
          const finalStatus = await pollUntilDone(
            jobId!,
            (status) => setPollStatus(status),
            4000,
            1800000,
          );

          if (finalStatus.status === "failed") {
            setError(finalStatus.error || "Simulation failed");
            setPolling(false);
            setLoading(false);
            return;
          }

          setPolling(false);
        }

        // Fetch all data in parallel
        const [curve, graph, ins, intel, narr, mkt] = await Promise.all([
          getAdoptionCurve(jobId!).catch(() => null),
          getGraphData(jobId!).catch(() => null),
          getInsights(jobId!).catch(() => null),
          getIntelligence(jobId!).catch(() => null),
          getNarratives(jobId!).catch(() => null),
          getMarketConfig(jobId!).catch(() => null),
        ]);

        setCurveData(curve);
        setGraphData(graph);
        setInsights(ins);
        setIntelligence(intel);
        setNarratives(narr);
        setMarketConfig(mkt);
      } catch (err: any) {
        setError(err.message || "Failed to load results");
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [jobId]);

  // ── derive display data ──

  const adoptionCurvePoints = useMemo(() => {
    if (!curveData) return undefined;
    return curveData.map((d) => ({
      week: `W${d.week}`,
      value: Math.round(d.adopted_pct * 10) / 10,
    }));
  }, [curveData]);

  const networkPersonas: CanvasPersona[] = useMemo(() => {
    if (!graphData) return [];
    const hubCount = Math.min(8, graphData.nodes.length);
    // Sort by fit_score descending so top-fit personas become hubs
    const sorted = [...graphData.nodes].sort((a, b) => b.fit_score - a.fit_score);
    return sorted.map((node, i) => ({
      id: node.id,
      name: node.name,
      occupation: node.segment,
      location: `Age ${node.age} · ${node.gender}`,
      sentiment: sentimentFromNode(node),
      image: i < hubCount ? `https://randomuser.me/api/portraits/${node.gender === "Female" ? "women" : "men"}/${(parseInt(node.id) || i) % 99}.jpg` : "",
    }));
  }, [graphData]);

  const adoptionSegments = useMemo(() => {
    if (!marketConfig || !graphData) return [];
    return marketConfig.segments.map((seg) => {
      // Count adopted in this segment
      const segNodes = graphData.nodes.filter((n) => n.segment === seg.name);
      const adoptedCount = segNodes.filter((n) => n.adopted).length;
      const pct = segNodes.length > 0 ? Math.round((adoptedCount / segNodes.length) * 100) : 0;
      return { label: seg.name.toUpperCase(), pct, shade: "bg-indigo-400" };
    });
  }, [marketConfig, graphData]);

  const weeklyBars = useMemo(() => {
    if (!curveData) return [];
    const shades = ["bg-amber-100", "bg-amber-200", "bg-amber-300", "bg-amber-400", "bg-amber-500", "bg-amber-600"];
    return curveData.map((d, i) => ({
      week: `W${d.week}`,
      h: d.new_adopters,
      shade: shades[i % shades.length],
    }));
  }, [curveData]);

  const influencers = useMemo(() => {
    if (!graphData) return [];
    return [...graphData.nodes]
      .sort((a, b) => b.social_influence - a.social_influence)
      .slice(0, 4)
      .map((node, i) => ({
        name: node.name,
        role: node.segment,
        score: `${(node.social_influence * 10).toFixed(1)}/10`,
        img: `https://randomuser.me/api/portraits/${node.gender === "Female" ? "women" : "men"}/${(parseInt(node.id) || i) % 99}.jpg`,
      }));
  }, [graphData]);

  const whyAdopted = useMemo(() => {
    if (!intelligence?.why_they_adopted?.top_drivers) return [];
    return intelligence.why_they_adopted.top_drivers.slice(0, 3).map(([label, count], i) => ({
      n: String(i + 1).padStart(2, "0"),
      label,
      meta: `${count} counts`,
    }));
  }, [intelligence]);

  const whyNot = useMemo(() => {
    if (!intelligence?.why_they_didnt?.top_objections) return [];
    return intelligence.why_they_didnt.top_objections.slice(0, 3).map(([label], i) => ({
      n: String(i + 1).padStart(2, "0"),
      label,
    }));
  }, [intelligence]);

  const whatConverts = useMemo(() => {
    if (!intelligence?.why_they_didnt?.top_fixes) return [];
    return intelligence.why_they_didnt.top_fixes.slice(0, 3).map(([label], i) => ({
      n: String(i + 1).padStart(2, "0"),
      label,
    }));
  }, [intelligence]);

  const objections = useMemo(() => {
    if (!intelligence?.why_they_didnt?.by_segment) return [];
    return Object.entries(intelligence.why_they_didnt.by_segment).slice(0, 5).map(([segment, data]: [string, any]) => ({
      segment,
      objection: data.top_objection || "N/A",
      dots: data.count > 10 ? 3 : data.count > 5 ? 2 : 1,
      potential: data.count > 10 ? "HIGH" : data.count > 5 ? "MEDIUM" : "LOW",
    }));
  }, [intelligence]);

  const adopterQuotes = useMemo(() => {
    if (!intelligence?.why_they_adopted?.representative_thoughts) return [];
    return intelligence.why_they_adopted.representative_thoughts.slice(0, 3).map((t, i) => ({
      id: `P${i + 1}`,
      role: `${t.segment} Persona`,
      quote: t.thought,
    }));
  }, [intelligence]);

  const nonAdopterQuotes = useMemo(() => {
    if (!intelligence?.why_they_didnt?.representative_thoughts) return [];
    return intelligence.why_they_didnt.representative_thoughts.slice(0, 3).map((t, i) => ({
      id: `N${i + 1}`,
      role: `${t.segment} Persona`,
      quote: t.thought,
    }));
  }, [intelligence]);

  // ── no jobId ──
  if (!jobId && !loading) {
    return (
      <MainLayout navigationDelay={0}>
        <HeroHighlight containerClassName="min-h-screen items-center justify-center">
          <div className="text-center p-10">
            <h1 className="text-4xl font-bold mb-4">No Simulation Found</h1>
            <p className="text-gray-500 text-lg mb-8">Start a simulation from the Launch page first.</p>
            <a href="/main" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
              Go to Launch →
            </a>
          </div>
        </HeroHighlight>
      </MainLayout>
    );
  }

  // ── error state ──
  if (error) {
    return (
      <MainLayout navigationDelay={0}>
        <HeroHighlight containerClassName="min-h-screen items-center justify-center">
          <div className="text-center p-10">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Simulation Failed</h1>
            <p className="text-gray-500 mb-6">{error}</p>
            <a href="/main" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
              Try Again →
            </a>
          </div>
        </HeroHighlight>
      </MainLayout>
    );
  }

  // ── has data → check if anything loaded ──
  const hasData = curveData || graphData || insights || intelligence;

  // ── character bar colors ──
  const barColors = [
    { from: '#b6eee2', to: '#a8dfd4', eye: '#245a52' },
    { from: '#ffdbd0', to: '#f5cbbf', eye: '#694b42' },
    { from: '#f2d2fe', to: '#e3c4ef', eye: '#5d4569' },
    { from: '#dee3e6', to: '#d5dbdd', eye: '#2d3335' },
    { from: '#fef3c7', to: '#fde68a', eye: '#78350f' },
    { from: '#fecaca', to: '#fca5a5', eye: '#7f1d1d' },
  ];

  // Normalize weekly bars for chart height
  const maxNewAdopters = Math.max(...weeklyBars.map(b => b.h), 1);

  return (
    <MainLayout navigationDelay={0}>
      <HeroHighlight containerClassName="min-h-screen items-start">
        <div className="w-full pt-12 pb-32 px-6">
          <div className="max-w-7xl mx-auto">

            {/* ── Page Header ── */}
            <motion.div
              className="mb-16"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.h1 
                className="text-5xl md:text-6xl font-extrabold tracking-tighter mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Simulation{" "}
                <motion.span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(to right, #6366f1, #a855f7)" }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Results
                </motion.span>
              </motion.h1>
              <motion.p 
                className="text-gray-500 text-xl max-w-2xl font-medium leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {insights?.product
                  ? `Market adoption analysis for "${insights.product}" across ${graphData?.nodes.length ?? "N/A"} AI personas.`
                  : "Analyzing the trajectory of market adoption through neural persona simulations."}
              </motion.p>
            </motion.div>

            {/* ── AI Market Analysis Report ── */}
            <SimulationReport
              summary={intelligence?.executive_summary}
              finalAdoptionPct={insights?.final_adoption_pct}
              peakWeek={insights?.peak_growth_week}
              whyAdopted={intelligence?.why_they_adopted?.top_drivers}
              whyNot={intelligence?.why_they_didnt?.top_objections}
              topFixes={intelligence?.why_they_didnt?.top_fixes}
            />

            {/* ═══ SECTION 1 — Market Dynamics ═══ */}
            <section className="mb-20">
              <SectionLabel color="bg-indigo-500">Market Dynamics</SectionLabel>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                {/* S-Curve */}
                <Card className="md:col-span-7 relative overflow-hidden shadow-[0_2px_12px_rgba(26,29,46,0.07)]">
                  <AdoptionCurve data={adoptionCurvePoints} />
                </Card>

                {/* Top Influencers */}
                <Card className="md:col-span-5">
                  <CardTitle title="Top Influencers" sub="Node Impact Ranking" />
                  <div className="space-y-6">
                    {influencers.length > 0 ? influencers.map((inf) => (
                      <motion.div
                        key={inf.name}
                        className="flex items-center justify-between cursor-pointer"
                        whileHover={{ scale: 1.03, x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-4">
                          <img src={inf.img} alt={inf.name} className="w-10 h-10 rounded-full object-cover" />
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{inf.name}</p>
                            <p className="text-xs text-gray-400">{inf.role}</p>
                          </div>
                        </div>
                        <span className="text-indigo-600 font-mono text-sm font-bold">{inf.score}</span>
                      </motion.div>
                    )) : (
                      <p className="text-gray-400 text-sm">No influencer data available</p>
                    )}
                  </div>
                </Card>

                {/* Weekly New Adopters Bar Chart */}
                <Card className="md:col-span-12">
                  <CardTitle title="New Adopters" sub="Weekly Velocity" />
                  <div className="flex mt-8">
                    <div className="flex flex-col justify-between items-end pr-6 text-gray-400 font-bold text-xs tracking-tighter" style={{ height: '280px', marginTop: '50px' }}>
                      {[...Array(7)].map((_, i) => {
                        const value = Math.round(maxNewAdopters * (6 - i) / 6);
                        return (
                          <span key={i}>{value}</span>
                        );
                      })}
                    </div>
                    <div className="flex-1 relative" style={{ height: '400px' }}>
                      <div className="flex items-end justify-around gap-4 border-b border-gray-200" style={{ height: '350px', marginTop: '50px' }}>
                        <div className="absolute flex flex-col justify-between pointer-events-none opacity-20" style={{ height: '280px', bottom: '50px', left: 0, right: 0 }}>
                          {[...Array(7)].map((_, i) => (
                            <div key={i} className="w-full border-t border-gray-300" />
                          ))}
                        </div>
                        {weeklyBars.map((b, idx) => {
                          const color = barColors[idx % barColors.length];
                          const heightPx = Math.round((b.h / maxNewAdopters) * 280);
                          // Add base height for the character face (50px) on top of the data height
                          const faceHeight = 50;
                          const finalHeight = heightPx + faceHeight;
                          
                          return (
                            <div key={b.week} className="group relative flex flex-col items-center">
                              <motion.div
                                className="w-16 rounded-full shadow-lg flex flex-col items-center pt-6 border-t-2 border-white/40 relative"
                                style={{
                                  background: `linear-gradient(to bottom, ${color.from}, ${color.to})`,
                                  boxShadow: `0 8px 24px ${color.from}40`,
                                }}
                                initial={{ height: `${faceHeight}px` }}
                                whileInView={{ height: `${finalHeight}px` }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ 
                                  duration: 0.8, 
                                  delay: idx * 0.1,
                                  ease: "easeOut"
                                }}
                                whileHover={{ scaleY: 1.05, filter: 'brightness(1.05)' }}
                              >
                                {/* Always show face now that we have minimum height */}
                                <>
                                  {/* Animated Eyes */}
                                  <motion.div
                                    className="flex gap-2.5"
                                    animate={{
                                      x: [0, 1.5, 0, -1.5, 0],
                                    }}
                                    transition={{
                                      duration: 4,
                                      repeat: Infinity,
                                      delay: idx * 0.3,
                                      ease: "easeInOut"
                                    }}
                                  >
                                    <motion.div
                                      className="w-1.5 h-1.5 rounded-full"
                                      style={{ background: color.eye }}
                                      animate={{
                                        scaleY: [1, 0.1, 1],
                                      }}
                                      transition={{
                                        duration: 0.2,
                                        repeat: Infinity,
                                        repeatDelay: 3 + idx * 0.5,
                                      }}
                                    />
                                    <motion.div
                                      className="w-1.5 h-1.5 rounded-full"
                                      style={{ background: color.eye }}
                                      animate={{
                                        scaleY: [1, 0.1, 1],
                                      }}
                                      transition={{
                                        duration: 0.2,
                                        repeat: Infinity,
                                        repeatDelay: 3 + idx * 0.5,
                                      }}
                                    />
                                  </motion.div>
                                  {/* Animated Mouth */}
                                  <motion.div
                                    className="w-3 h-0.5 rounded-full mt-2 translate-x-1"
                                    style={{ background: `${color.eye}66` }}
                                    animate={{
                                      scaleX: [1, 1.2, 1],
                                    }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      delay: idx * 0.2,
                                    }}
                                  />
                                </>
                                {/* Floating number above the character's head */}
                                <motion.div 
                                  className="absolute -top-8 left-1/2 -translate-x-1/2"
                                  initial={{ opacity: 0, y: 10 }}
                                  whileInView={{ opacity: 1, y: 0 }}
                                  viewport={{ once: true, margin: "-50px" }}
                                  transition={{ duration: 0.4, delay: idx * 0.1 + 0.5 }}
                                >
                                  <span 
                                    className="text-lg font-black"
                                    style={{ color: color.eye }}
                                  >
                                    {b.h}
                                  </span>
                                </motion.div>
                              </motion.div>
                              <span className="mt-4 font-bold text-xs text-gray-400 uppercase tracking-widest">{b.week}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Social Network Canvas */}
                {networkPersonas.length > 0 && (
                  <Card className="md:col-span-12 overflow-hidden relative">
                    <div className="relative z-10 mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Social Network</h3>
                        <p className="text-gray-400 text-xs font-mono uppercase tracking-widest">
                          Final State Connection Map · {graphData?.nodes.length} nodes · {graphData?.edges.length} edges
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ background: "linear-gradient(135deg, rgba(205,250,230,0.65), rgba(165,240,205,0.28))", border: "1px solid rgba(160,235,205,0.5)" }} />
                          <span className="text-gray-600">Adopted</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.55), rgba(240,240,248,0.25))", border: "1px solid rgba(200,200,220,0.45)" }} />
                          <span className="text-gray-600">Neutral</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ background: "linear-gradient(135deg, rgba(255,215,225,0.65), rgba(255,185,205,0.28))", border: "1px solid rgba(255,185,205,0.5)" }} />
                          <span className="text-gray-600">Non-Adopted</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-[380px] w-full">
                      <PersonaNetworkCanvas personas={networkPersonas} />
                    </div>
                  </Card>
                )}

                {/* Adoption % by Segment */}
                {adoptionSegments.length > 0 && (
                  <Card className="md:col-span-12">
                    <h3 className="text-xl font-bold text-gray-900 mb-8">Adoption % by Segment</h3>
                    <div className={`grid grid-cols-1 md:grid-cols-${Math.min(adoptionSegments.length, 4)} gap-12`}>
                      {adoptionSegments.map((seg) => (
                        <div key={seg.label} className="space-y-3">
                          <div className="flex justify-between font-mono text-xs">
                            <span className="text-gray-500">{seg.label}</span>
                            <span className="text-indigo-600">{seg.pct}%</span>
                          </div>
                          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${seg.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </section>

            {/* ═══ SECTION 2 — Adoption Intelligence ═══ */}
            {(whyAdopted.length > 0 || whyNot.length > 0 || whatConverts.length > 0) && (
              <section className="mb-20">
                <SectionLabel color="bg-purple-500">Adoption Intelligence</SectionLabel>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  {/* Why They Adopted */}
                  <Card className="flex flex-col h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-8 -mt-8 opacity-40" />
                    <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <span className="text-green-500 text-xl">✓</span>
                      Why They Adopted
                    </h4>
                    <ul className="space-y-6 flex-grow">
                      {whyAdopted.map((item) => (
                        <li key={item.n} className="flex gap-4">
                          <span className="font-mono text-gray-300 text-xl font-bold">{item.n}</span>
                          <div>
                            <p className="font-semibold text-sm">{item.label}</p>
                            <span className="text-xs text-gray-400">{item.meta}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  {/* Why They Didn't */}
                  <Card className="flex flex-col h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-8 -mt-8 opacity-40" />
                    <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <span className="text-red-500 text-xl">✕</span>
                      Why They Didn&apos;t
                    </h4>
                    <ul className="space-y-6 flex-grow">
                      {whyNot.map((item) => (
                        <li key={item.n} className="flex gap-4">
                          <span className="font-mono text-red-200 text-xl font-bold">{item.n}</span>
                          <div>
                            <p className="font-semibold text-sm text-red-700">{item.label}</p>
                            <span className="font-mono text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded uppercase">
                              Blocked
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  {/* What Would Convert */}
                  <Card className="flex flex-col h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-8 -mt-8 opacity-40" />
                    <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <span className="text-blue-500 text-xl">💡</span>
                      What Would Convert
                    </h4>
                    <ul className="space-y-6 flex-grow">
                      {whatConverts.map((item) => (
                        <li key={item.n} className="flex gap-4">
                          <span className="font-mono text-blue-200 text-xl font-bold">{item.n}</span>
                          <p className="font-semibold text-sm text-blue-700">{item.label}</p>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>

                {/* Objections Table */}
                {objections.length > 0 && (
                  <Card>
                    <h3 className="text-xl font-bold text-gray-900 mb-8">Objections by Segment</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="text-left font-mono text-xs text-gray-400 border-b border-gray-100">
                            <th className="pb-4 font-normal">SEGMENT</th>
                            <th className="pb-4 font-normal">PRIMARY OBJECTION</th>
                            <th className="pb-4 font-normal">SEVERITY</th>
                            <th className="pb-4 font-normal">CONVERSION POTENTIAL</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {objections.map((row) => (
                            <tr key={row.segment}>
                              <td className="py-6 font-bold text-sm">{row.segment}</td>
                              <td className="py-6 text-sm">{row.objection}</td>
                              <td className="py-6">
                                <div className="flex gap-1">
                                  {[...Array(3)].map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-2 h-2 rounded-full ${
                                        i < row.dots
                                          ? row.potential === "LOW" ? "bg-red-400" : "bg-orange-400"
                                          : "bg-gray-200"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </td>
                              <td className="py-6 text-xs font-mono">{row.potential}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}
              </section>
            )}

            {/* ═══ SECTION 3 — Persona Narratives ═══ */}
            {(adopterQuotes.length > 0 || nonAdopterQuotes.length > 0) && (
              <section className="mb-32">
                <SectionLabel color="bg-gray-900">Persona Narratives</SectionLabel>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Adopter thoughts */}
                  <div className="space-y-6">
                    <h4 className="text-sm font-mono uppercase tracking-widest text-green-600 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Adopter Inner Thoughts
                    </h4>
                    {adopterQuotes.map((q) => (
                      <div
                        key={q.id}
                        className="bg-white rounded-2xl p-6 border-l-4 border-l-green-500 border-y border-r border-gray-100 shadow-sm"
                      >
                        <p className="italic text-gray-600 mb-4 leading-relaxed">&quot;{q.quote}&quot;</p>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-mono text-xs">
                            {q.id}
                          </div>
                          <span className="text-xs font-bold">{q.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Non-adopter thoughts */}
                  <div className="space-y-6">
                    <h4 className="text-sm font-mono uppercase tracking-widest text-red-600 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Non-Adopter Inner Thoughts
                    </h4>
                    {nonAdopterQuotes.map((q) => (
                      <div
                        key={q.id}
                        className="bg-white rounded-2xl p-6 border-l-4 border-l-red-500 border-y border-r border-gray-100 shadow-sm"
                      >
                        <p className="italic text-gray-600 mb-4 leading-relaxed">&quot;{q.quote}&quot;</p>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-mono text-xs">
                            {q.id}
                          </div>
                          <span className="text-xs font-bold">{q.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* ═══ Diffusion Narratives ═══ */}
            {narratives && narratives.length > 0 && (
              <section className="mb-32">
                <SectionLabel color="bg-amber-500">Diffusion Narratives</SectionLabel>
                <div className="space-y-6">
                  {narratives.map((n, i) => (
                    <Card key={i}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-mono font-bold rounded-full uppercase">
                          {n.type}{n.week != null ? ` · Week ${n.week}` : ""}
                        </span>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{n.narrative}</p>
                    </Card>
                  ))}
                </div>
              </section>
            )}

          </div>
        </div>
      </HeroHighlight>
    </MainLayout>
  );
}
