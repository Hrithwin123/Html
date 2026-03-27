"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface DataPoint {
  week: string;
  value: number;
}

const defaultData: DataPoint[] = [
  { week: "W1", value: 2 },
  { week: "W2", value: 5 },
  { week: "W3", value: 12 },
  { week: "W4", value: 25 },
  { week: "W5", value: 45 },
  { week: "W6", value: 68 },
  { week: "W7", value: 82 },
  { week: "W8", value: 91 },
  { week: "W9", value: 96 },
  { week: "W10", value: 98 },
];

interface AdoptionCurveProps {
  data?: DataPoint[];
}

export function AdoptionCurve({ data: propData }: AdoptionCurveProps) {
  const data = propData && propData.length > 0 ? propData : defaultData;
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.5 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Generate smooth curve path
  const generatePath = () => {
    const width = 800;
    const height = 240;
    const points = data.map((d, i) => ({
      x: (i / (data.length - 1)) * width,
      y: height - (d.value / 100) * height,
    }));

    // Create smooth curve using cubic bezier
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cp1x = curr.x + (next.x - curr.x) / 3;
      const cp1y = curr.y;
      const cp2x = curr.x + (2 * (next.x - curr.x)) / 3;
      const cp2y = next.y;
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
    }
    return path;
  };

  const curvePath = generatePath();
  const areaPath = `${curvePath} L 800,240 L 0,240 Z`;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Find nearest data point
    const width = rect.width;
    const pointIndex = Math.round((x / width) * (data.length - 1));
    const clampedIndex = Math.max(0, Math.min(data.length - 1, pointIndex));

    setHoveredPoint(clampedIndex);
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  const lastValue = data[data.length - 1]?.value ?? 0;
  const firstValue = data[0]?.value ?? 0;
  const growth = lastValue - firstValue;

  return (
    <div ref={containerRef} className="relative">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-[#8A8FA8] text-[13px] font-medium mb-1 uppercase tracking-wide">Adoption Rate</p>
          <h3 className="text-[28px] font-bold text-[#1A1D2E] tracking-tight">
            {lastValue}%
          </h3>
          <p className="text-[11px] text-[#8A8FA8] mt-1">Current adoption</p>
        </div>
        <div className="flex items-center gap-2 bg-[#1A1D2E] rounded-full px-3 py-1.5">
          <span className="text-white text-[12px] font-medium">Weekly</span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-[240px] w-full relative mt-8">
        <svg
          ref={svgRef}
          className="w-full h-full cursor-crosshair"
          viewBox="0 0 800 240"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Gradient for area fill */}
            <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(91,78,255,0.18)" />
              <stop offset="100%" stopColor="rgba(91,78,255,0)" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[0, 20, 40, 60, 80, 100].map((val) => (
            <line
              key={val}
              x1="0"
              y1={240 - (val / 100) * 240}
              x2="800"
              y2={240 - (val / 100) * 240}
              stroke="#EBEBF0"
              strokeWidth="1"
              opacity="0.5"
            />
          ))}

          {/* Area fill under curve with animation */}
          <motion.path
            d={areaPath}
            fill="url(#areaGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: inView ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          />

          {/* Main curve line with draw animation */}
          <motion.path
            d={curvePath}
            fill="none"
            stroke="#5B4EFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: inView ? 1 : 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          {/* Hover indicator line */}
          {hoveredPoint !== null && (
            <motion.line
              x1={(hoveredPoint / (data.length - 1)) * 800}
              y1="0"
              x2={(hoveredPoint / (data.length - 1)) * 800}
              y2="240"
              stroke="#C4B5FD"
              strokeWidth="1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}

          {/* Data points as circles */}
          {data.map((point, i) => {
            const x = (i / (data.length - 1)) * 800;
            const y = 240 - (point.value / 100) * 240;
            const isHovered = hoveredPoint === i;

            return (
              <motion.g
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: inView ? 1 : 0, scale: inView ? 1 : 0 }}
                transition={{ duration: 0.3, delay: 1.5 + i * 0.05 }}
              >
                {isHovered && (
                  <>
                    <circle 
                      cx={x} 
                      cy={y} 
                      r="9" 
                      fill="none" 
                      stroke="#5B4EFF" 
                      strokeWidth="1" 
                      opacity="0.3"
                    />
                    <circle 
                      cx={x} 
                      cy={y} 
                      r="6" 
                      fill="none" 
                      stroke="white" 
                      strokeWidth="3"
                    />
                  </>
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? "6" : "4"}
                  fill="#5B4EFF"
                  className="transition-all duration-200"
                />
              </motion.g>
            );
          })}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between text-[11px] text-[#8A8FA8] pr-3 pointer-events-none">
          <span>100%</span>
          <span>80%</span>
          <span>60%</span>
          <span>40%</span>
          <span>20%</span>
          <span>0%</span>
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-12 right-0 flex justify-between text-[11px] text-[#8A8FA8] pointer-events-none">
          {data.map((d) => (
            <span key={d.week}>{d.week}</span>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredPoint !== null && (
        <motion.div
          className="fixed pointer-events-none z-50"
          style={{
            left: mousePos.x + 15,
            top: mousePos.y - 10,
          }}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-white rounded-xl px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.10)] border border-gray-100">
            <p className="text-[#8A8FA8] text-[11px] font-medium mb-1">{data[hoveredPoint].week}</p>
            <p className="text-[#1A1D2E] text-[16px] font-bold">{data[hoveredPoint].value}%</p>
            <p className="text-[#8A8FA8] text-[10px] mt-0.5">adoption rate</p>
          </div>
        </motion.div>
      )}

      {/* Growth indicator */}
      <div className="mt-6 flex items-center gap-2">
        <div className="flex items-center gap-1 bg-[#F0FDF4] px-2 py-1 rounded-md">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 2L6 10M6 2L3 5M6 2L9 5"
              stroke="#16A34A"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[#16A34A] text-[12px] font-semibold">+{growth}%</span>
        </div>
        <span className="text-[#8A8FA8] text-[12px]">total growth</span>
      </div>
    </div>
  );
}
