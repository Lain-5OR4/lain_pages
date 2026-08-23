import { useCallback, useEffect, useRef, useState } from "react";

export function useBackgroundMusic(audioSrc: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wasPlayingBeforeHiddenRef = useRef(false);

  useEffect(() => {
    audioRef.current = new Audio(audioSrc);
    audioRef.current.volume = 0.25;
    audioRef.current.loop = true;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioSrc]);

  // play() returns a promise that rejects when autoplay policy blocks it
  // (likely for the non-user-gesture resume below) — only report "playing"
  // once it actually succeeded.
  const startPlayback = useCallback((audio: HTMLAudioElement) => {
    audio.play().then(
      () => setIsPlaying(true),
      () => setIsPlaying(false),
    );
  }, []);

  // タブの表示/非表示で BGM を一時停止/再開する
  useEffect(() => {
    const handleVisibilityChange = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (document.hidden) {
        if (!audio.paused) {
          wasPlayingBeforeHiddenRef.current = true;
          audio.pause();
          setIsPlaying(false);
        }
      } else if (wasPlayingBeforeHiddenRef.current) {
        wasPlayingBeforeHiddenRef.current = false;
        startPlayback(audio);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [startPlayback]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      startPlayback(audio);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return { isPlaying, togglePlay };
}
