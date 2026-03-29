"use client";

import React, { useRef, useEffect } from "react";

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  settled: boolean;
}

interface ParticleTextProps {
  text?: string;
  fontSize?: number;
  particleSize?: number;
  particleGap?: number;
  className?: string;
}

export function ParticleText({
  text = "Persona Labs",
  fontSize = 120,
  particleSize = 1.3,
  particleGap = 3,
  className = "",
}: ParticleTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // Fixed sampling dimensions for resolution-independent shape
    const SAMPLE_W = 1600;
    const SAMPLE_H = 400;

    const sampleText = () => {
      const offscreen = document.createElement("canvas");
      offscreen.width = SAMPLE_W;
      offscreen.height = SAMPLE_H;
      const offCtx = offscreen.getContext("2d");
      if (!offCtx) return [];

      offCtx.fillStyle = "#000";
      // Use bold, larger font for high-fidelity sampling
      offCtx.font = `900 ${fontSize * 1.4}px "Inter", "system-ui", sans-serif`;
      offCtx.textAlign = "center";
      offCtx.textBaseline = "middle";
      offCtx.fillText(text, SAMPLE_W / 2, SAMPLE_H / 2);

      const imageData = offCtx.getImageData(0, 0, SAMPLE_W, SAMPLE_H);
      const pixels = imageData.data;
      const discovered: Particle[] = [];

      for (let y = 0; y < SAMPLE_H; y += particleGap) {
        for (let x = 0; x < SAMPLE_W; x += particleGap) {
          const i = (y * SAMPLE_W + x) * 4;
          if (pixels[i + 3] > 120) {
            discovered.push({
              x: x, 
              y: y,
              originX: x,
              originY: y,
              vx: 0,
              vy: 0,
              size: particleSize + Math.random() * 0.5,
              color: "rgba(0,0,0,",
              alpha: 0,
              settled: false,
            });
          }
        }
      }
      return discovered;
    };

    const initialParticles = sampleText();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) continue;
        
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.resetTransform();
        ctx.scale(dpr, dpr);

        // Calculate Responsive Scale
        // If screen is too narrow for 1600px logo, scale it down.
        const logoPadding = 60;
        const availableWidth = width - logoPadding;
        const scale = Math.min(1, availableWidth / SAMPLE_W);
        const logoW = SAMPLE_W * scale;
        const logoH = SAMPLE_H * scale;

        const offsetX = (width - logoW) / 2;
        const offsetY = (height - logoH) / 2;

        particlesRef.current = initialParticles.map(p => {
          const sx = (p.originX * scale) + offsetX;
          const sy = (p.originY * scale) + offsetY;
          return {
            ...p,
            x: sx + (Math.random() - 0.5) * 100,
            y: sy + (Math.random() - 0.5) * 100,
            originX: sx,
            originY: sy,
          };
        });
      }
    });

    resizeObserver.observe(canvas);

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    canvas.addEventListener("mousemove", handleMouse);
    canvas.addEventListener("mouseleave", () => {
      mouseRef.current = { x: -9999, y: -9999 };
    });

    const animate = () => {
      if (!ctx || !canvas) return;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      const mouse = mouseRef.current;
      const mouseRadius = 140;
      const ps = particlesRef.current;

      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        if (p.alpha < 1) p.alpha += 0.08;

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouseRadius) {
          const force = (mouseRadius - dist) / mouseRadius;
          p.vx += (dx / dist) * force * 7;
          p.vy += (dy / dist) * force * 7;
        }

        p.vx += (p.originX - p.x) * 0.12; 
        p.vy += (p.originY - p.y) * 0.12;
        p.vx *= 0.83;
        p.vy *= 0.83;
        p.x += p.vx;
        p.y += p.vy;

        const distOrig = Math.abs(p.x - p.originX) + Math.abs(p.y - p.originY);
        const breathe = distOrig < 1 ? Math.sin(Date.now() * 0.003 + p.originX * 0.05) * 0.35 : 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + breathe, 0, Math.PI * 2);
        ctx.fillStyle = p.color + (p.alpha * (0.95 + breathe)).toFixed(2) + ")";
        ctx.fill();
      }
      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animRef.current);
    };
  }, [text, fontSize, particleSize, particleGap]);

  return (
    <canvas
      ref={canvasRef}
      className={`relative block ${className}`}
      style={{ 
        height: fontSize * 2.2, 
        width: "100%",
        zIndex: 100,
        pointerEvents: "auto"
      }}
    />
  );
}





