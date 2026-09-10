"use client";

import Link from "next/link";
import { type CSSProperties, useState } from "react";
import "./room.css";
import { PlayDesk } from "./PlayDesk";

const DROPS = Array.from({ length: 36 }, (_, i) => ({
  id: i,
  left: `${(i * 37) % 100}%`,
  delay: `${-(i % 9)}s`,
  speed: `${1.1 + (i % 5) * 0.4}s`,
}));

export default function RoomStudy() {
  const [view, setView] = useState<"window" | "desk" | "play">("play");
  const [light, setLight] = useState(true);
  if (view === "play") return <PlayDesk onBack={() => setView("window")} />;
  return (
    <div className={`room-study ${view} ${light ? "light-on" : "light-off"}`} lang="ja">
      <div className="study-controls">
        <span>TOP PAGE STUDY / 01</span>
        <fieldset aria-label="デザイン案">
          <button type="button" onClick={() => setView("play")}>
            C — 触れる机
          </button>
          <button type="button" aria-pressed={view === "window"} onClick={() => setView("window")}>
            A — 窓辺
          </button>
          <button type="button" aria-pressed={view === "desk"} onClick={() => setView("desk")}>
            B — 机の上
          </button>
        </fieldset>
        <Link href="/">現在のトップ ↗</Link>
      </div>
      <main className="room-interior">
        <header className="room-name">
          <span>mizora / personal site</span>
          <button type="button" onClick={() => setLight(!light)} aria-pressed={light}>
            灯り {light ? "ON" : "OFF"}
            <span className="light-dot" />
          </button>
        </header>
        <div className="room-composition">
          <section className="room-profile">
            <span className="room-small">01 / PROFILE</span>
            <h1>
              mizora<span>.</span>
            </h1>
            <p>
              埼玉に住んでいます。
              <br />
              ホラーとコンピュータが好きです。
            </p>
            <div className="room-playing">
              <span>PLAYING</span>
              <p>
                ダンガンロンパ シリーズ
                <br />
                HUNDRED LINE
              </p>
            </div>
            <a className="room-github" href="https://github.com/Lain-5OR4">
              GitHub ↗
            </a>
          </section>
          <div className="room-window" aria-hidden="true">
            <div className="window-sky" />
            <div className="city-blocks">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="window-wire" />
            <div className="window-rain">
              {DROPS.map((d) => (
                <i
                  key={d.id}
                  style={
                    {
                      left: d.left,
                      animationDelay: d.delay,
                      animationDuration: d.speed,
                    } as CSSProperties
                  }
                />
              ))}
            </div>
            <span className="window-cross" />
            <span className="window-sill" />
          </div>
          <nav className="room-objects" aria-label="記録">
            <Link className="room-book" href="/reading">
              <span className="object-index">02</span>
              <span className="book-title">読書記録</span>
              <span className="book-en">
                READING
                <br />
                NOTES
              </span>
              <span className="object-open">本棚を開く ↗</span>
            </Link>
            <Link className="room-photo" href="/diary">
              <span className="photo-scene" aria-hidden="true">
                <i />
              </span>
              <span className="photo-caption">
                03 / 写真日記 <span>↗</span>
              </span>
            </Link>
            <span className="desk-line" aria-hidden="true" />
          </nav>
        </div>
        <footer className="room-bottom">
          <span>SAITAMA, JAPAN</span>
          <span>読書 / 写真 / コンピュータ</span>
        </footer>
      </main>
      <aside className="study-note" aria-live="polite">
        <strong>{view === "window" ? "A / 窓辺を中心に" : "B / 机の上を中心に"}</strong>
        <p>
          {view === "window"
            ? "雨と余白を大きく。本や写真は、部屋の片隅に。"
            : "本と写真を手前に。生活の気配と、触れる楽しさを多めに。"}
        </p>
        <span>配置と空気感の比較用デモ</span>
      </aside>
    </div>
  );
}
