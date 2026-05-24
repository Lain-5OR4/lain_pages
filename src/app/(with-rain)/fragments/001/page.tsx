import Microscope from "@/components/miniapps/Microscope";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MicroscopePage() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Microscope />

      <div className="absolute top-8 left-8 z-50">
        <Link href="/fragments">
          <Button
            variant="outline"
            className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-mono tracking-widest bg-black/50 backdrop-blur-sm"
          >
            {"<"} FRAGMENTS
          </Button>
        </Link>
      </div>

      {/* UI Panel */}
      <div className="absolute top-8 right-8 z-50 pointer-events-none font-mono text-xs text-green-400/80 bg-black/60 backdrop-blur-sm border border-green-500/30 px-4 py-3 space-y-1 leading-relaxed">
        <div className="text-green-500 font-bold tracking-wider">◉ MICROSCOPE VIEW</div>
        <div className="text-green-500/30">─────────────────</div>
        <div id="organism-count">Organisms: 0</div>
        <div id="fps-display">FPS: 60</div>
        <div className="text-green-500/30">─────────────────</div>
        <div className="text-green-500/50">[SCROLL] Zoom</div>
        <div className="text-green-500/50">[CLICK] Add organism</div>
        <div className="text-green-500/50">[DRAG] Pan view</div>
        <div className="text-green-500/50">[SPACE] Reset</div>
        <div className="text-green-500/50">[1-5] Change stain</div>
      </div>

      {/* Magnification display */}
      <div
        id="mag-display"
        className="absolute bottom-8 right-8 z-50 pointer-events-none font-mono text-2xl text-green-500/60 font-bold tracking-widest"
      >
        400x
      </div>
    </div>
  );
}
