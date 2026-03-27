"use client";

import { motion } from "framer-motion";

// ── default data (used when no props) ─────────────────────────────────────────

const defaultAdoptionLogic = [
  {
    title: "Utility-First Transition",
    desc: "Early adopters are motivated by immediate workflow optimization rather than long-term strategic transformation.",
  },
  {
    title: "Validation Feedback Loops",
    desc: "Adoption accelerates once the first 15% of a network's nodes report >20% efficiency gains.",
  },
];

const defaultBarriers = [
  {
    title: "Cognitive Load Resistance",
    desc: "Legacy personas perceive high switching costs due to complex existing folder-based filing systems.",
  },
  {
    title: "Financial Rigidity",
    desc: "The lack of a per-seat consumption model prevents bottom-up individual adoption in enterprise environments.",
  },
];

const defaultNetworkEffects = [
  {
    label: "Primary Driver",
    color: "indigo",
    title: "Collaborative Intelligence",
    desc: "Shared data pools increase model accuracy for all cluster nodes.",
  },
  {
    label: "Secondary Driver",
    color: "purple",
    title: "Standardized Output",
    desc: "Format lock-in forces adjacent teams to adopt for compatibility.",
  },
];

const defaultRecommendations = [
  {
    bg: "bg-indigo-600",
    icon: "1",
    title: "Launch Freemium",
    desc: "Lower the initial barrier for 'Budget Conscious' nodes to trigger network effects.",
    sub: "text-indigo-100",
  },
  {
    bg: "bg-purple-600",
    icon: "2",
    title: "Certify Security",
    desc: "Prioritize SOC2 and GDPR compliance tools to unlock the 'Legacy System' segment.",
    sub: "text-purple-100",
  },
  {
    bg: "bg-zinc-900",
    icon: "3",
    title: "Refine UX",
    desc: "Simplify onboarding logic to reduce friction for low-tech-proficiency personas.",
    sub: "text-zinc-400",
  },
];

// ── types ─────────────────────────────────────────────────────────────────────

interface ReportProps {
  summary?: string;
  finalAdoptionPct?: number;
  peakWeek?: number;
  adoptionLogic?: { title: string; desc: string }[];
  barriers?: { title: string; desc: string }[];
  networkEffects?: { label: string; color: string; title: string; desc: string }[];
  recommendations?: { bg: string; icon: string; title: string; desc: string; sub: string }[];
  whyAdopted?: [string, number][];
  whyNot?: [string, number][];
  topFixes?: [string, number][];
}

// ── component ─────────────────────────────────────────────────────────────────

export function SimulationReport({
  summary,
  finalAdoptionPct,
  peakWeek,
  adoptionLogic: propAdoptionLogic,
  barriers: propBarriers,
  networkEffects: propNetworkEffects,
  recommendations: propRecommendations,
  whyAdopted,
  whyNot,
  topFixes,
}: ReportProps = {}) {
  const adoptionLogic = propAdoptionLogic ?? (whyAdopted && whyAdopted.length > 0
    ? whyAdopted.slice(0, 3).map(([driver, count]) => ({
        title: driver,
        desc: `Identified in ${count} persona simulations as a key adoption driver.`,
      }))
    : defaultAdoptionLogic);

  const barriers = propBarriers ?? (whyNot && whyNot.length > 0
    ? whyNot.slice(0, 3).map(([objection, count]) => ({
        title: objection,
        desc: `Raised by ${count} non-adopter personas as a primary blocker.`,
      }))
    : defaultBarriers);

  const networkEffects = propNetworkEffects ?? defaultNetworkEffects;

  const recommendations = propRecommendations ?? (topFixes && topFixes.length > 0
    ? topFixes.slice(0, 3).map(([fix, count], idx) => ({
        bg: ["bg-indigo-600", "bg-purple-600", "bg-zinc-900"][idx] || "bg-zinc-900",
        icon: (idx + 1).toString(),
        title: fix,
        desc: `Suggested by ${count} personas as a path to conversion.`,
        sub: ["text-indigo-100", "text-purple-100", "text-zinc-400"][idx] || "text-zinc-400",
      }))
    : defaultRecommendations);

  const pctDisplay = finalAdoptionPct != null ? `${finalAdoptionPct.toFixed(1)}%` : "78%";
  const sentiment = finalAdoptionPct != null
    ? finalAdoptionPct > 60 ? "Strongly Positive" : finalAdoptionPct > 30 ? "Moderately Positive" : "Mixed"
    : "Strongly Positive";
  const peakDisplay = peakWeek != null ? `Week ${peakWeek}` : "Q4 2025";

  const summaryText = summary ??
    `The neural persona simulations indicate a robust ${pctDisplay} eventual market penetration for the AI
    synthesis suite. Growth is primarily driven by "Efficiency Seekers" who value the 4h/week time
    savings. However, a significant "Trust Chasm" exists within the Security Compliance segment
    which could stall mid-market adoption without localized data sovereignty controls.`;

  return (
    <motion.section
      className="mb-20 space-y-10"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      {/* Badge */}
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-mono font-bold rounded-full uppercase tracking-widest">
          Market Analysis v2.4
        </span>
      </div>

      {/* Executive Summary */}
      <div className="bg-white/60 border border-zinc-100 rounded-3xl p-10 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 rounded bg-indigo-500" />
          <h3 className="text-2xl font-bold tracking-tight">Executive Summary</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <p className="lg:col-span-2 text-gray-500 leading-loose text-lg">
            {summaryText}
          </p>
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
              <p className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-1">Market Sentiment</p>
              <p className="text-2xl font-bold text-indigo-700">{sentiment}</p>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
              <p className="text-xs font-mono text-purple-400 uppercase tracking-widest mb-1">Peak Growth</p>
              <p className="text-2xl font-bold text-purple-700">{peakDisplay}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Adoption Logic + Barrier Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Adoption Logic */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <h3 className="text-2xl font-bold tracking-tight">Adoption Logic</h3>
          </div>
          {adoptionLogic.map((item) => (
            <div key={item.title} className="p-6 bg-white border border-zinc-100 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <p className="font-bold text-gray-900">{item.title}</p>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Barrier Analysis */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <h3 className="text-2xl font-bold tracking-tight">Barrier Analysis</h3>
          </div>
          {barriers.map((item) => (
            <div key={item.title} className="p-6 bg-white border border-zinc-100 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <p className="font-bold text-red-700">{item.title}</p>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Network Effects */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 rounded bg-purple-500" />
          <h3 className="text-2xl font-bold tracking-tight">Network Effects</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {networkEffects.map((n) => (
            <div
              key={n.label}
              className={`bg-gradient-to-br from-${n.color}-50 to-white border border-${n.color}-100 p-6 rounded-2xl`}
            >
              <p className={`text-xs font-mono text-${n.color}-400 uppercase mb-2`}>{n.label}</p>
              <p className="text-lg font-bold">{n.title}</p>
              <p className="text-sm text-gray-500 mt-2">{n.desc}</p>
            </div>
          ))}
          {/* Clustering Coefficient */}
          <div className="bg-white border border-zinc-100 p-6 rounded-2xl lg:col-span-2">
            <p className="text-xs font-mono text-zinc-400 uppercase mb-2">Final Adoption</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-extrabold text-gray-900">{pctDisplay}</span>
              <span className="text-green-600 font-mono text-sm font-bold">Market Penetration</span>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Simulations show the projected final adoption rate across all persona segments in the target market.
            </p>
          </div>
        </div>
      </div>

      {/* Strategic Recommendations */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 rounded bg-zinc-800" />
          <h3 className="text-2xl font-bold tracking-tight">Strategic Recommendations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((r) => (
            <motion.div
              key={r.title}
              className={`${r.bg} text-white p-8 rounded-3xl shadow-xl cursor-pointer`}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-6 text-xl">
                {r.icon}
              </div>
              <h4 className="text-xl font-bold mb-3">{r.title}</h4>
              <p className={`${r.sub} text-sm leading-relaxed`}>{r.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-zinc-100" />
    </motion.section>
  );
}
