"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

export interface CanvasPersona {
  id: string;
  name: string;
  occupation: string;
  location: string;
  image: string;
  sentiment?: "positive" | "neutral" | "negative";
}

interface NodeDef {
  id: string;
  x: number;
  y: number;
  type: "card" | "circle";
  persona: CanvasPersona;
  fixed?: boolean;
}

interface EdgeDef { from: string; to: string }

const CARD_W = 148;
const CARD_H = 170;
const CR = 16;
const MIN_CC = CR * 2 + 14;
const MIN_CK = CR + Math.max(CARD_W, CARD_H) / 2 + 20;

function makePRNG(seed: number) {
  let s = (seed ^ 0xdeadbeef) >>> 0;
  return () => {
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s ^= s >>> 16;
    return (s >>> 0) / 0x100000000;
  };
}

function buildLayout(personas: CanvasPersona[]): { nodes: NodeDef[]; edges: EdgeDef[]; canvasW: number; canvasH: number } {
  if (!personas.length) return { nodes: [], edges: [], canvasW: 800, canvasH: 400 };
  const total = personas.length;
  const rng = makePRNG(total);
  const canvasH = 500;
  const midY = canvasH / 2;
  const hubCount = Math.min(8, total); // Increased to 8 hubs
  const circleCount = total - hubCount;
  const gridCols = Math.ceil(Math.sqrt(circleCount * 4)); // More horizontal spread
  const canvasW = Math.max(2400, gridCols * (MIN_CC + 4) + 400); // Wider canvas
  const nodes: NodeDef[] = [];
  const edges: EdgeDef[] = [];
  const hubSpacing = canvasW / (hubCount + 1);
  const hubNodes: NodeDef[] = [];

  for (let h = 0; h < hubCount; h++) {
    const p = personas[h];
    const node: NodeDef = { id: p.id, x: hubSpacing * (h + 1), y: midY + (rng() - 0.5) * 40, type: "card", persona: p, fixed: true };
    nodes.push(node);
    hubNodes.push(node);
  }

  const circlePersonas = personas.slice(hubCount);
  const gridRows = 4;
  const gridColsActual = Math.ceil(circleCount / gridRows);
  const cellW = canvasW / gridColsActual;
  const cellH = (canvasH - CARD_H - 60) / (gridRows / 2);

  circlePersonas.forEach((p, ci) => {
    const col = ci % gridColsActual;
    const row = Math.floor(ci / gridColsActual);
    const x = col * cellW + cellW * (0.15 + rng() * 0.7);
    let y: number;
    if (row % 2 === 0) {
      const bandH = midY - CARD_H / 2 - 30;
      const rowFrac = (Math.floor(row / 2) + 0.5) / (gridRows / 2);
      y = bandH * (1 - rowFrac) + CR + 10 + rng() * (cellH * 0.4);
    } else {
      const bandTop = midY + CARD_H / 2 + 30;
      const bandH = canvasH - bandTop - CR - 10;
      const rowFrac = (Math.floor(row / 2) + 0.5) / (gridRows / 2);
      y = bandTop + bandH * rowFrac + (rng() - 0.5) * (cellH * 0.4);
    }
    nodes.push({ id: p.id, x, y, type: "circle", persona: p });
  });

  const circleNodes = nodes.filter(n => n.type === "circle");
  for (let pass = 0; pass < 120; pass++) {
    let moved = false;
    for (let i = 0; i < circleNodes.length; i++) {
      for (let j = i + 1; j < circleNodes.length; j++) {
        const a = circleNodes[i], b = circleNodes[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        if (dist < MIN_CC) {
          const push = (MIN_CC - dist) / 2 + 0.5;
          const nx = dx / dist, ny = dy / dist;
          a.x -= nx * push; a.y -= ny * push;
          b.x += nx * push; b.y += ny * push;
          moved = true;
        }
      }
    }
    for (const c of circleNodes) {
      for (const k of hubNodes) {
        const dx = c.x - k.x, dy = c.y - k.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        if (dist < MIN_CK) {
          const push = MIN_CK - dist + 1;
          c.x += (dx / dist) * push;
          c.y += (dy / dist) * push;
          moved = true;
        }
      }
    }
    if (!moved) break;
  }

  nodes.forEach(n => {
    if (n.fixed) return;
    n.x = Math.max(CR + 2, Math.min(canvasW - CR - 2, n.x));
    n.y = Math.max(CR + 2, Math.min(canvasH - CR - 2, n.y));
  });

  // bridge nodes between hubs
  for (let i = 0; i < hubNodes.length - 1; i++) {
    const a = hubNodes[i], b = hubNodes[i + 1];
    const xLeft = a.x + CARD_W / 2 + CR + 8;
    const xRight = b.x - CARD_W / 2 - CR - 8;
    const xSpan = xRight - xLeft;
    if (xSpan < CR * 2) { edges.push({ from: a.id, to: b.id }); continue; }
    const bridgeIds: string[] = [];
    for (const [bx, by, k] of [[xLeft + xSpan * 0.35, midY - 28 - rng() * 20, 1], [xLeft + xSpan * 0.65, midY + 28 + rng() * 20, 2]] as [number, number, number][]) {
      const bridgeId = `bridge_${i}_${k}`;
      const src = circlePersonas[i * 2 + k - 1];
      nodes.push({ id: bridgeId, x: bx, y: by, type: "circle", persona: { id: bridgeId, name: src?.name ?? `N${i}${k}`, occupation: src?.occupation ?? "", location: "", image: "", sentiment: src?.sentiment } });
      bridgeIds.push(bridgeId);
    }
    edges.push({ from: a.id, to: bridgeIds[0] }, { from: bridgeIds[0], to: bridgeIds[1] }, { from: bridgeIds[1], to: b.id });
  }

  const circleNodesFinal = nodes.filter(n => n.type === "circle");
  circleNodesFinal.forEach(c => {
    let nearestHub = hubNodes[0], nearestDist = Infinity;
    hubNodes.forEach(h => { const d = Math.hypot(c.x - h.x, c.y - h.y); if (d < nearestDist) { nearestDist = d; nearestHub = h; } });
    edges.push({ from: nearestHub.id, to: c.id });
  });
  circleNodesFinal.forEach((a, ai) => {
    circleNodesFinal.map((b, bi) => ({ bi, d: Math.hypot(b.x - a.x, b.y - a.y) }))
      .filter(e => e.bi !== ai).sort((x, y) => x.d - y.d).slice(0, 2)
      .forEach(({ bi }) => {
        const b = circleNodesFinal[bi];
        if (!edges.some(e => (e.from === a.id && e.to === b.id) || (e.from === b.id && e.to === a.id)))
          edges.push({ from: a.id, to: b.id });
      });
  });

  return { nodes, edges, canvasW, canvasH };
}

// ── helpers ───────────────────────────────────────────────────────────────────
function depthProps(node: NodeDef, canvasW: number, canvasH: number) {
  const cx = canvasW / 2, cy = canvasH / 2;
  const t = Math.min(Math.hypot(node.x - cx, node.y - cy) / Math.hypot(cx, cy), 1);
  return { scale: 1 - t * 0.35 };
}

function Controls({ onFit }: { onFit: () => void }) {
  const { zoomIn, zoomOut } = useControls();
  return (
    <div className="absolute top-3 right-3 z-20 flex flex-col gap-1">
      {[
        { icon: <ZoomIn size={13} />, fn: () => zoomIn(0.3) },
        { icon: <ZoomOut size={13} />, fn: () => zoomOut(0.3) },
        { icon: <Maximize2 size={13} />, fn: onFit },
      ].map((b, i) => (
        <button key={i} onClick={b.fn}
          className="w-7 h-7 bg-white/90 border border-gray-200 rounded-lg shadow-sm flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
          {b.icon}
        </button>
      ))}
    </div>
  );
}

export function PersonaNetworkCanvas({ personas }: { personas: CanvasPersona[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const wrapperRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { nodes, edges, canvasW, canvasH } = useMemo(() => buildLayout(personas), [personas]);
  const nodeMap = useMemo(() => { const m: Record<string, NodeDef> = {}; nodes.forEach(n => (m[n.id] = n)); return m; }, [nodes]);

  const [initScale, setInitScale] = useState(1);
  const [initX, setInitX] = useState(0);
  const [initY, setInitY] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [animReady, setAnimReady] = useState(false);

  // Fire animations only once the canvas is scrolled into view
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setAnimReady(true); observer.disconnect(); } },
      { threshold: 1.0 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!containerRef.current || isInitialized) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    // Zoom in more and center on canvas center
    const s = Math.min(1.2, height / (canvasH * 0.76));
    setInitScale(s);
    setInitX(width / 2 - (canvasW / 2) * s);
    setInitY(height / 2 - (canvasH / 2) * s);
    setIsInitialized(true);
  }, [canvasW, canvasH, isInitialized]);

  // Center the view after wrapper is ready
  useEffect(() => {
    if (!wrapperRef.current || !containerRef.current || !isInitialized) return;
    const timer = setTimeout(() => {
      const { width, height } = containerRef.current!.getBoundingClientRect();
      const s = Math.min(1.2, height / (canvasH * 0.76));
      const x = width / 2 - (canvasW / 2) * s;
      const y = height / 2 - (canvasH / 2) * s;
      wrapperRef.current.setTransform(x, y, s, 0);
    }, 50);
    return () => clearTimeout(timer);
  }, [isInitialized, canvasW, canvasH]);

  const handleFit = () => {
    if (!wrapperRef.current || !containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const s = Math.min(width / canvasW, height / canvasH) * 0.88;
    wrapperRef.current.setTransform((width - canvasW * s) / 2, (height - canvasH * s) / 2, s, 300, "easeOut");
  };

  return (
    <div ref={containerRef} className="relative w-full h-full rounded-xl overflow-hidden select-none">
      <TransformWrapper ref={wrapperRef} initialScale={initScale} initialPositionX={initX} initialPositionY={initY}
        minScale={0.08} maxScale={3} wheel={{ step: 0.08 }} panning={{ excluded: ["pn-node"] }} doubleClick={{ disabled: true }}>
        {() => (
          <>
            <Controls onFit={handleFit} />
            <p className="absolute bottom-2 left-3 z-20 text-[10px] text-gray-400 font-mono pointer-events-none">
              scroll to zoom · drag to pan
            </p>
            <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: canvasW, height: canvasH, position: "relative" }}>

              {/* static base edges */}
              <svg style={{ position: "absolute", inset: 0, width: canvasW, height: canvasH, pointerEvents: "none", overflow: "visible" }}>
                {edges.map((e, i) => {
                  const a = nodeMap[e.from], b = nodeMap[e.to];
                  if (!a || !b) return null;
                  const lit = hovered === e.from || hovered === e.to;
                  const isHub = a.type === "card" || b.type === "card";
                  return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke={lit ? "#6366f1" : "#e5e7eb"}
                    strokeWidth={lit ? 1.5 : 0.6}
                    opacity={lit ? 0.9 : 0.5} />;
                })}
              </svg>

              {/* particle + glow canvas removed */}

              {/* card hubs — glassmorphic */}
              {nodes.filter(n => n.type === "card").map((node, idx) => {
                const isHov = hovered === node.id;
                
                // Determine glass tint based on sentiment
                const glassStyle: React.CSSProperties = node.persona.sentiment === "positive" 
                  ? {
                      background: "linear-gradient(135deg, rgba(205,250,230,0.65) 0%, rgba(165,240,205,0.28) 50%, rgba(120,225,180,0.10) 100%)",
                      border: "1px solid rgba(160,235,205,0.5)",
                      boxShadow: "inset 0 1.5px 2px rgba(255,255,255,0.75), inset 0 -1px 2px rgba(50,200,130,0.10), 0 6px 20px rgba(50,200,130,0.09), 0 1px 5px rgba(50,200,130,0.06)",
                    }
                  : node.persona.sentiment === "negative"
                  ? {
                      background: "linear-gradient(135deg, rgba(255,215,225,0.65) 0%, rgba(255,185,205,0.28) 50%, rgba(255,150,175,0.10) 100%)",
                      border: "1px solid rgba(255,185,205,0.5)",
                      boxShadow: "inset 0 1.5px 2px rgba(255,255,255,0.75), inset 0 -1px 2px rgba(255,120,155,0.10), 0 6px 20px rgba(255,100,140,0.09), 0 1px 5px rgba(255,100,140,0.06)",
                    }
                  : {
                      background: "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(240,240,248,0.25) 50%, rgba(220,220,235,0.12) 100%)",
                      border: "1px solid rgba(200,200,220,0.45)",
                      boxShadow: "inset 0 1.5px 2px rgba(255,255,255,0.8), inset 0 -1px 2px rgba(180,180,200,0.15), 0 6px 20px rgba(0,0,0,0.07), 0 1px 5px rgba(0,0,0,0.05)",
                    };

                return (
                  <motion.div key={node.id} className="pn-node absolute rounded-2xl p-3 cursor-pointer overflow-hidden"
                    style={{ 
                      left: node.x - CARD_W / 2, 
                      top: node.y - CARD_H / 2, 
                      width: CARD_W, 
                      height: CARD_H, 
                      zIndex: isHov ? 40 : 20,
                      ...glassStyle,
                      backdropFilter: "blur(14px)",
                      WebkitBackdropFilter: "blur(14px)",
                    }}
                    whileHover={{ scale: 1.04, y: -3 }}
                    onMouseEnter={() => setHovered(node.id)} onMouseLeave={() => setHovered(null)}
                    initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: idx * 0.08 }}>
                    
                    {/* Frosted sheen overlay */}
                    <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
                      background: "linear-gradient(135deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.00) 65%, rgba(200,205,240,0.08) 100%)",
                      zIndex: 0,
                    }} />
                    
                    {/* Specular streak — top edge glint */}
                    <div className="absolute top-0 left-[15%] right-[15%] h-[1px] pointer-events-none" style={{
                      background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 100%)",
                      zIndex: 1,
                    }} />
                    
                    {/* Shimmer on hover */}
                    {isHov && (
                      <motion.div 
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{
                          background: "linear-gradient(135deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0) 70%)",
                          zIndex: 3,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex justify-center mb-2 relative">
                        {/* Glass ring around avatar */}
                        <div className="relative">
                          <div className="absolute inset-[-3px] rounded-full" style={{
                            background: "rgba(255,255,255,0.55)",
                            border: "1px solid rgba(255,255,255,0.7)",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                          }} />
                          <img src={node.persona.image} alt={node.persona.name} className="relative w-14 h-14 rounded-full object-cover" />
                        </div>
                        <span className="absolute top-0 right-5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white shadow-sm" />
                      </div>
                      <p className="font-semibold text-gray-900 text-center text-xs leading-tight truncate px-1">{node.persona.name}</p>
                      <p className="text-gray-600 text-center text-[11px] mt-0.5 px-1 leading-tight"
                        style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {node.persona.occupation}
                      </p>
                      <p className="text-gray-500 text-center text-[10px] mt-0.5 truncate px-1">{node.persona.location.split(",")[0]}</p>
                      {node.persona.sentiment && (
                        <div className="mt-2 flex justify-center">
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
                            style={{
                              backdropFilter: "blur(10px)",
                              WebkitBackdropFilter: "blur(10px)",
                              ...(node.persona.sentiment === "positive" 
                                ? { background: "rgba(52,199,89,0.12)", border: "1px solid rgba(52,199,89,0.30)", color: "#1a7a38" }
                                : node.persona.sentiment === "negative"
                                ? { background: "rgba(255,59,48,0.12)", border: "1px solid rgba(255,59,48,0.28)", color: "#c0392b" }
                                : { background: "rgba(142,142,147,0.13)", border: "1px solid rgba(142,142,147,0.30)", color: "#48484f" }
                              )
                            }}>
                            <span className="w-[5px] h-[5px] rounded-full" style={{
                              background: node.persona.sentiment === "positive" ? "#28a745" 
                                : node.persona.sentiment === "negative" ? "#e03020" 
                                : "#8e8e93"
                            }} />
                            {node.persona.sentiment}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* circle nodes — glass tint style */}
              {nodes.filter(n => n.type === "circle").map((node, idx) => {
                const isHov = hovered === node.id;
                const { scale: dScale } = depthProps(node, canvasW, canvasH);
                const size = CR * 2 * dScale;

                // Assign tint based on sentiment + influence (deterministic by id)
                const idHash = node.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
                const isInfluential = idHash % 7 === 0; // ~14% get blue
                const tint = isInfluential ? "blue"
                  : node.persona.sentiment === "positive" ? "mint"
                    : node.persona.sentiment === "negative" ? "rose"
                      : "frost";

                const glassStyles: Record<string, React.CSSProperties> = {
                  frost: {
                    background: "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(240,240,248,0.25) 50%, rgba(220,220,235,0.12) 100%)",
                    border: "1px solid rgba(200,200,220,0.45)",
                    boxShadow: "inset 0 1.5px 2px rgba(255,255,255,0.8), inset 0 -1px 2px rgba(180,180,200,0.15), 0 6px 20px rgba(0,0,0,0.07), 0 1px 5px rgba(0,0,0,0.05)",
                  },
                  blue: {
                    background: "linear-gradient(135deg, rgba(210,228,255,0.65) 0%, rgba(170,205,255,0.28) 50%, rgba(130,175,255,0.10) 100%)",
                    border: "1px solid rgba(160,200,255,0.5)",
                    boxShadow: "inset 0 1.5px 2px rgba(255,255,255,0.75), inset 0 -1px 2px rgba(100,160,255,0.12), 0 6px 20px rgba(80,140,255,0.10), 0 1px 5px rgba(80,140,255,0.07)",
                  },
                  rose: {
                    background: "linear-gradient(135deg, rgba(255,215,225,0.65) 0%, rgba(255,185,205,0.28) 50%, rgba(255,150,175,0.10) 100%)",
                    border: "1px solid rgba(255,185,205,0.5)",
                    boxShadow: "inset 0 1.5px 2px rgba(255,255,255,0.75), inset 0 -1px 2px rgba(255,120,155,0.10), 0 6px 20px rgba(255,100,140,0.09), 0 1px 5px rgba(255,100,140,0.06)",
                  },
                  mint: {
                    background: "linear-gradient(135deg, rgba(205,250,230,0.65) 0%, rgba(165,240,205,0.28) 50%, rgba(120,225,180,0.10) 100%)",
                    border: "1px solid rgba(160,235,205,0.5)",
                    boxShadow: "inset 0 1.5px 2px rgba(255,255,255,0.75), inset 0 -1px 2px rgba(50,200,130,0.10), 0 6px 20px rgba(50,200,130,0.09), 0 1px 5px rgba(50,200,130,0.06)",
                  },
                };

                const labelColors: Record<string, string> = {
                  frost: "rgba(50,50,70,0.55)",
                  blue: "rgba(40,80,160,0.65)",
                  rose: "rgba(160,40,80,0.65)",
                  mint: "rgba(30,120,80,0.65)",
                };

                return (
                  <motion.div key={node.id} className="pn-node absolute cursor-pointer"
                    style={{ left: node.x - size / 2, top: node.y - size / 2, width: size, height: size, zIndex: isHov ? 30 : 10 }}
                    onMouseEnter={() => setHovered(node.id)} onMouseLeave={() => setHovered(null)}
                    initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.15, delay: Math.min(idx * 0.005, 0.5) }}>

                    {/* Glass face */}
                    <div className="absolute inset-0 rounded-full" style={{
                      ...(isHov
                        ? { background: "radial-gradient(circle at 38% 35%, #374151, #111827)", border: "1px solid rgba(107,114,128,0.7)", boxShadow: "0 2px 8px rgba(0,0,0,0.35)" }
                        : glassStyles[tint]
                      ),
                      backdropFilter: "blur(14px)",
                      WebkitBackdropFilter: "blur(14px)",
                      transition: "all 0.15s",
                    }} />

                    {/* Specular glint */}
                    {!isHov && (
                      <div className="absolute rounded-full pointer-events-none" style={{
                        top: "13%", left: "15%", width: "40%", height: "24%",
                        background: "radial-gradient(ellipse at 40% 40%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 75%)",
                        zIndex: 2,
                      }} />
                    )}

                    {/* Label */}
                    <div className="absolute inset-0 flex items-center justify-center" style={{
                      fontSize: Math.max(8, 11 * dScale), fontWeight: 500,
                      color: isHov ? "#fff" : labelColors[tint],
                      letterSpacing: "0.3px",
                      zIndex: 3,
                    }}>
                      {node.persona.name.charAt(0).toUpperCase()}
                    </div>

                    {isHov && (
                      <motion.div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl pointer-events-none z-50"
                        style={{ whiteSpace: "nowrap" }}
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }}>
                        <p className="font-semibold">{node.persona.name}</p>
                        <p className="text-gray-300 text-[10px]">{node.persona.occupation}</p>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}

            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
