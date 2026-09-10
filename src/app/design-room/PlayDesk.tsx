"use client";

import Link from "next/link";
import { type CSSProperties, type ReactNode, useRef, useState } from "react";
import "./play-desk.css";

const INITIAL = [
  [3, 8, -5],
  [32, 16, 9],
  [66, 7, -8],
  [62, 62, 5],
  [9, 70, -11],
];
const TIDY = [
  [3, 6, 0],
  [33, 6, 0],
  [65, 6, 0],
  [65, 62, 0],
  [6, 70, 0],
];
const LABELS = ["プロフィール", "読書ノート", "写真", "カセット", "ステッカー"];

export function PlayDesk({ onBack }: { onBack: () => void }) {
  const [positions, setPositions] = useState(INITIAL);
  const [top, setTop] = useState(0);
  const [opened, setOpened] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [turns, setTurns] = useState(0);
  const [audioError, setAudioError] = useState("");
  const surface = useRef<HTMLDivElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const drag = useRef<{ id: number; x: number; y: number; left: number; top: number } | null>(null);
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  function item(id: number, className: string, children: ReactNode) {
    return (
      <section
        className={`pd-object ${className}`}
        style={
          {
            left: `${positions[id][0]}%`,
            top: `${positions[id][1]}%`,
            "--angle": `${positions[id][2]}deg`,
            zIndex: top === id ? 10 : 2,
          } as CSSProperties
        }
      >
        <button
          type="button"
          className="pd-grip"
          aria-label={`${LABELS[id]}を動かす（矢印キーでも移動）`}
          onPointerDown={(e) => {
            const s = surface.current;
            if (!s) return;
            setTop(id);
            e.currentTarget.setPointerCapture(e.pointerId);
            drag.current = {
              id,
              x: e.clientX,
              y: e.clientY,
              left: positions[id][0],
              top: positions[id][1],
            };
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            const s = surface.current;
            if (!d || d.id !== id || !s) return;
            const box = s.getBoundingClientRect();
            const object = e.currentTarget.parentElement;
            const maxX = Math.max(0, 100 - ((object?.offsetWidth ?? 0) / box.width) * 100);
            const maxY = Math.max(0, 100 - ((object?.offsetHeight ?? 0) / box.height) * 100);
            setPositions((p) =>
              p.map((v, i) =>
                i === id
                  ? [
                      Math.min(maxX, Math.max(0, d.left + ((e.clientX - d.x) / box.width) * 100)),
                      Math.min(maxY, Math.max(0, d.top + ((e.clientY - d.y) / box.height) * 100)),
                      v[2],
                    ]
                  : v,
              ),
            );
          }}
          onPointerUp={(e) => {
            drag.current = null;
            e.currentTarget.releasePointerCapture(e.pointerId);
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
          onKeyDown={(e) => {
            const delta = {
              ArrowLeft: [-2, 0],
              ArrowRight: [2, 0],
              ArrowUp: [0, -2],
              ArrowDown: [0, 2],
            }[e.key];
            if (!delta) return;
            e.preventDefault();
            const s = surface.current;
            const o = e.currentTarget.parentElement;
            if (!s || !o) return;
            const maxX = Math.max(0, 100 - (o.offsetWidth / s.clientWidth) * 100);
            const maxY = Math.max(0, 100 - (o.offsetHeight / s.clientHeight) * 100);
            setTop(id);
            setPositions((p) =>
              p.map((v, i) =>
                i === id
                  ? [
                      Math.min(maxX, Math.max(0, v[0] + delta[0])),
                      Math.min(maxY, Math.max(0, v[1] + delta[1])),
                      v[2],
                    ]
                  : v,
              ),
            );
          }}
        >
          ⠿ <span>{LABELS[id]}</span>
        </button>
        {children}
      </section>
    );
  }

  async function toggleAudio() {
    const a = audio.current;
    if (!a) return;
    if (!a.paused) {
      a.pause();
      setPlaying(false);
      return;
    }
    try {
      a.volume = 0.35;
      await a.play();
      setPlaying(true);
      setAudioError("");
    } catch {
      setAudioError("雨音を再生できませんでした。");
    }
  }

  return (
    <div className="pd-page" lang="ja">
      <header className="pd-toolbar">
        <div>
          <strong>
            mizora<span>’s desk</span>
          </strong>
          <small>DESIGN STUDY / C</small>
        </div>
        <nav aria-label="デモ操作">
          <button type="button" onClick={() => setPositions(TIDY)}>
            整頓する ↗
          </button>
          <button type="button" onClick={() => setPositions(INITIAL)}>
            散らかす
          </button>
          <button type="button" onClick={onBack}>
            前の2案
          </button>
          <Link href="/">今のトップ</Link>
        </nav>
      </header>
      <main className="pd-mat" ref={surface}>
        <div className="pd-mat-label" aria-hidden="true">
          PERSONAL SPACE
          <br />
          <span>BOOKS, PHOTOS & A LITTLE NOISE.</span>
        </div>
        {item(
          0,
          "pd-receipt",
          <>
            <div className="pd-receipt-title">
              ABOUT ME <span>001</span>
            </div>
            <h1>mizora</h1>
            <div className="pd-avatar" aria-hidden="true">
              m<span>✳</span>
            </div>
            <p>
              埼玉に住んでいます。
              <br />
              ホラーとコンピュータが好き。
            </p>
            <dl>
              <dt>LOCATION</dt>
              <dd>Saitama, JP</dd>
              <dt>PLAYING</dt>
              <dd>
                ダンガンロンパ
                <br />
                HUNDRED LINE
              </dd>
            </dl>
            <a href="https://github.com/Lain-5OR4">GitHub ↗</a>
            <div className="pd-barcode" aria-hidden="true" />
            <small>THANK YOU FOR STOPPING BY</small>
          </>,
        )}
        {item(
          1,
          `pd-notebook ${opened ? "pd-open" : ""}`,
          <>
            <button
              className="pd-cover"
              type="button"
              aria-expanded={opened}
              onClick={() => setOpened(!opened)}
            >
              <span>
                READING
                <br />
                NOTES
              </span>
              <span className="pd-book-symbol" aria-hidden="true">
                ✳
              </span>
              <small>
                読書記録 <span>{opened ? "閉じる −" : "開く ＋"}</span>
              </small>
            </button>
            {opened && (
              <div className="pd-book-inside">
                <span>しおりのところから。</span>
                <Link href="/reading">本棚を開く ↗</Link>
              </div>
            )}
          </>,
        )}
        {item(
          2,
          `pd-polaroid ${flipped ? "pd-flipped" : ""}`,
          <>
            <button
              type="button"
              className="pd-photo-flip"
              onClick={() => setFlipped(!flipped)}
              aria-label={flipped ? "写真を表にする" : "写真を裏返す"}
            >
              {flipped ? (
                <span className="pd-photo-back">
                  写真日記
                  <br />
                  <small>撮ったもの、日々の記録。</small>
                  <span className="pd-back-stamp">MIZORA</span>
                </span>
              ) : (
                <span className="pd-photo-front">
                  <span className="pd-rain-picture" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <i />
                    <span>RAINY DAY</span>
                  </span>
                  <span className="pd-photo-hand">
                    写真日記 <small>↶ 裏を見る</small>
                  </span>
                </span>
              )}
            </button>
            {flipped && (
              <Link className="pd-photo-link" href="/diary">
                写真日記を開く ↗
              </Link>
            )}
          </>,
        )}
        {item(
          3,
          "pd-cassette",
          <>
            <div className="pd-tape-label">
              <span>SIDE A</span>
              <strong>雨音 / RAIN</strong>
              <span>∞</span>
            </div>
            <div className={`pd-reels ${playing ? "spinning" : ""}`} aria-hidden="true">
              <i>✳</i>
              <span />
              <i>✳</i>
            </div>
            <button type="button" className="pd-play" onClick={toggleAudio} aria-pressed={playing}>
              {playing ? "■ STOP" : "▶ PLAY"}
              <span>{playing ? "再生中" : "雨音を流す"}</span>
            </button>
            <output>{audioError}</output>
          </>,
        )}
        {item(
          4,
          "pd-sticker-holder",
          <button
            type="button"
            className="pd-sticker"
            aria-label="ステッカーを回す"
            onClick={() => setTurns(turns + 1)}
            style={{ transform: `rotate(${turns * 90}deg)` }}
          >
            <span>DON’T PANIC</span>
            <strong>☺</strong>
            <span>STILL LOADING...</span>
          </button>,
        )}
        <span className="pd-mat-corner" aria-hidden="true">
          ＋
        </span>
      </main>
      {/* Audio starts only after pressing the cassette play button. */}
      {/* biome-ignore lint/a11y/useMediaCaption: Rain ambience only; the cassette label identifies the sound and there is no speech. */}
      <audio
        ref={audio}
        src={`${base}/music/rain.mp3`}
        loop
        preload="none"
        onError={() => {
          setPlaying(false);
          setAudioError("雨音を読み込めませんでした。");
        }}
      />
      <footer className="pd-footer">
        <span>⠿ をつかんで動かす · 本を開く · 写真を裏返す</span>
        <span>本と写真は、実際の記録ページにつながっています。</span>
      </footer>
    </div>
  );
}
