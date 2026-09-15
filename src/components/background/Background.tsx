"use client";
import { useEffect, useRef } from "react";

type RainProps = {
  className?: string;
  color?: string;
  count?: number;
};

type Drop = { x: number; y: number; length: number; speed: number };

export default function Background({
  className = "fixed inset-0 z-10 w-full h-full pointer-events-none",
  color = "rgba(0, 180, 200, 0.6)",
  count = 100,
}: RainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let frame: number | null = null;
    let previous: number | null = null;
    let drops: Drop[] = [];

    function paint(delta: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const drop of drops) {
        drop.y += drop.speed * delta;
        if (drop.y > height) {
          drop.y = -drop.length;
          drop.x = Math.random() * width;
        }
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
      }
      ctx.stroke();
    }

    function stop() {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      previous = null;
    }

    function tick(time: number) {
      frame = null;
      const delta = previous === null ? 0 : Math.min((time - previous) / 1000, 0.05);
      previous = time;
      paint(delta);
      frame = requestAnimationFrame(tick);
    }

    function syncAnimation() {
      stop();
      if (document.hidden || width === 0 || height === 0) return;
      paint(0);
      if (!motion.matches) frame = requestAnimationFrame(tick);
    }

    function resize() {
      if (!canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      drops = Array.from({ length: Math.max(0, Math.min(500, Math.floor(count))) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        length: 10 + Math.random() * 20,
        speed: 300 + Math.random() * 600,
      }));
      syncAnimation();
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", syncAnimation);
    motion.addEventListener("change", syncAnimation);
    resize();
    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", syncAnimation);
      motion.removeEventListener("change", syncAnimation);
    };
  }, [color, count]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" tabIndex={-1} />;
}
