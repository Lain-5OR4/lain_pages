import PhysicsTextGrid from "@/components/miniapps/PhysicsTextGrid";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PhysicsTextPage() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <PhysicsTextGrid />

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

      <div className="absolute bottom-8 left-8 z-50 pointer-events-none font-mono text-xs text-green-400/60 space-y-1">
        <p>CLICK to spawn balls</p>
        <p>TAB to change shape</p>
      </div>
    </div>
  );
}
