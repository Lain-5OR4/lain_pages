import VoidSpace from "@/components/miniapps/VoidSpace";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function VoidPage() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <VoidSpace />

      <div className="absolute top-8 left-8 z-50">
        <Link href="/">
          <Button
            variant="outline"
            className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-mono tracking-widest bg-black/50 backdrop-blur-sm"
          >
            {"<"} RETURN_TO_REALITY
          </Button>
        </Link>
      </div>

      <div className="absolute bottom-8 right-8 z-50 pointer-events-none">
        <h1 className="text-4xl font-mono font-bold text-green-500 opacity-50 tracking-[1em] text-right">
          THE_WIRED
        </h1>
        <p className="text-green-400 font-mono text-sm text-right mt-2 opacity-70">
          Connecting to layer 01...
        </p>
      </div>
    </div>
  );
}
