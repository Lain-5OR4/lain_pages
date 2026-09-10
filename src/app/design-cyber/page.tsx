"use client";

import Background from "@/components/background/Background";
import Link from "next/link";
import { type CSSProperties, useState } from "react";
import "./cyber.css";

export default function CyberStudy() {
  const [frequency, setFrequency] = useState(76);

  const [logOpen, setLogOpen] = useState(false);
  const unstable = frequency > 88;
  return (
    <div
      className={`cyber-demo ${unstable ? "cy-unstable" : ""}`}
      style={{ "--signal": frequency / 100 } as CSSProperties}
      lang="ja"
    >
      <div className="cy-city" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
        <span className="cy-beacon" />
      </div>
      <Background className="cy-rain" color="rgba(42, 83, 99, 0.42)" count={110} />
      <div className="cy-scan" aria-hidden="true" />
      <div className="cy-shell">
        <header className="cy-header">
          <Link href="/" className="cy-brand">
            M<span> / </span>個人端末
          </Link>
          <span className="cy-edition">DESIGN STUDY — 02</span>
          <Link href="/design-room/" className="cy-back">
            前のデモ ↗
          </Link>
        </header>
        <main>
          <div className="cy-status">
            <span>
              <i /> CONNECTION ESTABLISHED
            </span>
            <span>SAITAMA / JP</span>
            <span className="cy-status-right">
              PRIVATE NODE <b>07</b>
            </span>
          </div>
          <section className="cy-person" aria-labelledby="cy-title">
            <div className="cy-person-heading">
              <div className="cy-avatar" aria-label="プロフィールアイコン未設定">
                m<span aria-hidden="true">＋</span>
              </div>
              <div>
                <p className="cy-person-label">PROFILE / SAITAMA, JAPAN</p>
                <h1 id="cy-title">
                  mizora<span>_</span>
                </h1>
              </div>
            </div>
            <div className="cy-person-body">
              <div className="cy-person-about">
                <h2>こんにちは、mizoraです。</h2>
                <p>
                  埼玉に住んでいます。
                  <br />
                  ホラーとコンピュータが好きです。
                </p>
                <a href="https://github.com/Lain-5OR4">GitHub ↗</a>
              </div>
              <dl className="cy-person-facts">
                <div>
                  <dt>好きなもの</dt>
                  <dd>ホラー / コンピュータ</dd>
                </div>
                <div>
                  <dt>いま遊んでいるゲーム</dt>
                  <dd>
                    ダンガンロンパ シリーズ
                    <br />
                    HUNDRED LINE
                  </dd>
                </div>
              </dl>
            </div>
            <nav className="cy-person-links" aria-label="個人の記録">
              <span>日々の記録</span>
              <Link href="/reading">読書記録 ↗</Link>
              <Link href="/diary">写真日記 ↗</Link>
            </nav>
          </section>
          <section className="cy-bottom" aria-label="端末の調整">
            <div className="cy-tuner">
              <div className="cy-tuner-title">
                <label htmlFor="cy-frequency">
                  SIGNAL TUNER <small>周波数を合わせる</small>
                </label>
                <output htmlFor="cy-frequency">
                  {frequency.toFixed(1)} <small>MHz</small>
                </output>
              </div>
              <input
                id="cy-frequency"
                type="range"
                min="60"
                max="100"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
              />
              <div className="cy-scale">
                <span>60</span>
                <span>70</span>
                <span>80</span>
                <span>90</span>
                <span>100</span>
              </div>
              <p aria-live="polite">
                {unstable
                  ? "UNKNOWN SIGNAL / 発信元不明"
                  : frequency < 68
                    ? "WEAK SIGNAL / 受信感度低下"
                    : "SIGNAL STABLE / 正常に受信しています"}
              </p>
            </div>
            <div className="cy-log">
              <button type="button" onClick={() => setLogOpen(!logOpen)} aria-expanded={logOpen}>
                SYSTEM LOG <span>{logOpen ? "−" : "+"}</span>
              </button>
              <p>
                <span>00:01</span> archive mounted
              </p>
              <p>
                <span>00:02</span> visitor connected <b>●</b>
              </p>
              {logOpen && (
                <p className="cy-log-secret">
                  <span>--:--</span>{" "}
                  {unstable ? "誰か、聞こえますか。" : "listening to the rain..."}
                </p>
              )}
              <p className="cy-console-prompt">
                <span>mizora@wired</span> {">"}
                <span className="cy-block-cursor" aria-hidden="true" />
              </p>
            </div>
          </section>
        </main>
        <footer className="cy-footer">
          <span>
            <i /> ONLINE
          </span>
          <span>MIZORA / PERSONAL NETWORK</span>
          <Link href="/">現在のトップへ ↗</Link>
        </footer>
      </div>
    </div>
  );
}
