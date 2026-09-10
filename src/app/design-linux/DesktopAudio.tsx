"use client";

import { useEffect, useRef, useState } from "react";
import { createElectricalHum } from "./electricalHum";

export function DesktopAudio() {
  const rain = useRef<HTMLAudioElement>(null);
  const engine = useRef<{
    context: AudioContext;
    gain: GainNode;
    source: AudioBufferSourceNode;
  } | null>(null);
  const mounted = useRef(true);
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [rainVolume, setRainVolume] = useState(30);
  const [noiseVolume, setNoiseVolume] = useState(25);
  const [error, setError] = useState("");

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (engine.current) {
        engine.current.source.stop();
        void engine.current.context.close();
        engine.current = null;
      }
    };
  }, []);
  useEffect(() => {
    if (rain.current) rain.current.volume = rainVolume / 100;
  }, [rainVolume]);
  useEffect(() => {
    const audio = engine.current;
    if (audio)
      audio.gain.gain.setTargetAtTime((noiseVolume / 100) * 0.18, audio.context.currentTime, 0.08);
  }, [noiseVolume]);

  async function toggle() {
    const media = rain.current;
    if (!media || busy) return false;
    setBusy(true);
    setError("");
    try {
      if (playing) {
        media.pause();
        await engine.current?.context.suspend();
        if (mounted.current) setPlaying(false);
      } else {
        if (!engine.current) {
          const context = new AudioContext();
          const gain = context.createGain();
          gain.gain.value = (noiseVolume / 100) * 0.18;
          const filter = context.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.value = 1800;
          const source = context.createBufferSource();
          source.buffer = createElectricalHum(context);
          source.loop = true;
          source.connect(filter).connect(gain).connect(context.destination);
          engine.current = { context, gain, source };
          source.start();
        }
        media.volume = rainVolume / 100;
        await Promise.all([media.play(), engine.current.context.resume()]);
        if (mounted.current) setPlaying(true);
        else media.pause();
      }
      return true;
    } catch {
      media.pause();
      void engine.current?.context.suspend().catch(() => {});
      if (mounted.current) {
        setPlaying(false);
        setError("再生できませんでした。もう一度お試しください。");
      }
      return false;
    } finally {
      if (mounted.current) setBusy(false);
    }
  }

  return (
    <div className="lx-audio">
      <button
        type="button"
        className="lx-audio-trigger"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        aria-label="雨音と電気音の音量設定"
      >
        {playing ? "♪ 音 ON" : "♪ 音 OFF"}
      </button>
      {open && (
        <div className="lx-audio-panel">
          <div className="lx-audio-heading">
            <strong>環境音</strong>
            <button type="button" onClick={() => setOpen(false)} aria-label="音量設定を閉じる">
              ×
            </button>
          </div>
          <button
            type="button"
            className="lx-audio-toggle"
            onClick={toggle}
            disabled={busy}
            aria-pressed={playing}
          >
            {busy ? "接続中…" : playing ? "■ 停止" : "▶ 雨音と電気音を再生"}
          </button>
          <label>
            雨音 <output>{rainVolume}%</output>
            <input
              type="range"
              min="0"
              max="100"
              value={rainVolume}
              onChange={(e) => setRainVolume(Number(e.target.value))}
            />
          </label>
          <label>
            電気の唸り <output>{noiseVolume}%</output>
            <input
              type="range"
              min="0"
              max="100"
              value={noiseVolume}
              onChange={(e) => setNoiseVolume(Number(e.target.value))}
            />
          </label>
          <p>低く響く「ブーン」という音。0にすると雨音だけになります。</p>
          <output className="lx-audio-error">{error}</output>
        </div>
      )}
      {/* biome-ignore lint/a11y/useMediaCaption: Ambient rain only, no speech; the controls identify the sound. */}
      <audio
        ref={rain}
        loop
        preload="none"
        src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/music/rain.mp3`}
      />
    </div>
  );
}
