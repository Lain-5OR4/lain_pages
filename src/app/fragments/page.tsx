"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

interface FragmentEntry {
  id: string;
  title: string;
  description: string;
  href: string;
  tags: string[];
  date: string;
}

const fragments: FragmentEntry[] = [
  {
    id: "001",
    title: "FRAGMENT 001",
    description:
      "Interactive microscope simulation with amoeba, paramecium, euglena, bacteria, diatoms, and rotifers. Multiple staining modes.",
    href: "/fragments/001",
    tags: ["p5.js", "simulation", "biology"],
    date: "2025.04",
  },
  {
    id: "002",
    title: "FRAGMENT 002",
    description:
      "Physics text grid. SVG shapes formed from characters act as collision bodies for falling particles.",
    href: "/fragments/002",
    tags: ["matter-js", "physics", "canvas"],
    date: "2025.05",
  },
];

export default function FragmentsPage() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="bg-black text-green-500 font-mono min-h-screen relative overflow-hidden">
      {/* Subtle scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(0,255,0,0.03)_2px,transparent_3px)]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <Link href="/">
              <Button
                variant="outline"
                className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-mono tracking-widest bg-black/50 backdrop-blur-sm"
              >
                {"<"} RETURN
              </Button>
            </Link>
            <span className="text-xs text-green-500/30">[{fragments.length}] entries loaded</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-[0.2em] mb-4">
            <span className="text-green-500/40">{">"}</span> FRAGMENTS
          </h1>
          <p className="text-green-400/60 text-sm max-w-lg">
            Digital fragments. Small pieces of code exploring motion, geometry, and interactivity.
          </p>
          <div className="mt-4 h-px bg-gradient-to-r from-green-500/50 via-green-500/20 to-transparent" />
        </header>

        {/* Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fragments.map((fragment, index) => (
            <Link key={fragment.id} href={fragment.href}>
              <div
                className={`group relative border border-green-500/20 hover:border-green-500/60 bg-black/50 p-6 transition-all duration-300 cursor-pointer h-full ${
                  hoveredId === fragment.id ? "shadow-[0_0_20px_rgba(0,255,0,0.1)]" : ""
                }`}
                onMouseEnter={() => setHoveredId(fragment.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Index number */}
                <span className="absolute top-3 right-3 text-xs text-green-500/20 font-mono">
                  #{String(index + 1).padStart(3, "0")}
                </span>

                {/* Title */}
                <h3 className="text-lg font-bold mb-2 group-hover:text-green-300 transition-colors">
                  <span className="text-green-500/40 mr-1">{"//"}</span>
                  {fragment.title}
                </h3>

                {/* Description */}
                <p className="text-green-400/50 text-xs mb-4 leading-relaxed">
                  {fragment.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {fragment.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 border border-green-500/20 text-green-500/40 uppercase tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Date */}
                <span className="text-[10px] text-green-500/25">{fragment.date}</span>

                {/* Hover indicator */}
                <div className="absolute bottom-0 left-0 h-[2px] bg-green-500 transition-all duration-300 w-0 group-hover:w-full" />
              </div>
            </Link>
          ))}

          {/* Empty slot placeholder */}
          <div className="border border-dashed border-green-500/10 p-6 flex items-center justify-center min-h-[160px]">
            <span className="text-green-500/20 text-xs tracking-widest">AWAITING_UPLOAD...</span>
          </div>
        </section>

        {/* Footer info */}
        <footer className="mt-16 pt-8 border-t border-green-500/10">
          <p className="text-xs text-green-500/25 text-center">
            {">"} Each fragment is a self-contained experiment.
            <br />
            {">"} Click to enter.
            <span className="animate-blink">_</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
