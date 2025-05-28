"use client";
import { Button } from "@/components/ui/button";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import { Volume2, VolumeX } from "lucide-react";

export function BackgroundMusicPlayer() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const { isPlaying, togglePlay } = useBackgroundMusic(`${basePath}/music/rain.mp3`);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={togglePlay}
      className="hover:bg-transparent hover:text-green-500"
      aria-label={isPlaying ? "Pause background music" : "Play background music"}
    >
      {isPlaying ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </Button>
  );
}
