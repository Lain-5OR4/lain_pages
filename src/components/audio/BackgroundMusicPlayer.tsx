"use client";
import { Button } from "@/components/ui/button";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import { Volume2, VolumeX } from "lucide-react";

export function BackgroundMusicPlayer() {
  const { isPlaying, togglePlay } = useBackgroundMusic("/music/rain.mp3");

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={togglePlay}
      aria-label={isPlaying ? "Pause background music" : "Play background music"}
    >
      {isPlaying ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </Button>
  );
}
