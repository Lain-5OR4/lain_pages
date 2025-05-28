import { useEffect, useRef, useState } from "react";

export function useBackgroundMusic(audioSrc: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [wasPlayingBeforeHidden, setWasPlayingBeforeHidden] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Page Visibility API でタブの表示/非表示を監視
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (audioRef.current) {
        if (document.hidden) {
          // タブが非表示になった時
          if (isPlaying) {
            setWasPlayingBeforeHidden(true);
            audioRef.current.pause();
            setIsPlaying(false);
          }
        } else {
          // タブが表示された時
          if (wasPlayingBeforeHidden) {
            audioRef.current.play();
            setIsPlaying(true);
            setWasPlayingBeforeHidden(false);
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isPlaying, wasPlayingBeforeHidden]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return { isPlaying, togglePlay };
}
