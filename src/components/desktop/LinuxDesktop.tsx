"use client";

import Background from "@/components/background/Background";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import "./desktop.css";
import "./desktop-icons.css";
import { DesktopAudio } from "./DesktopAudio";
import { DesktopIcon } from "./DesktopIcon";

export function LinuxDesktop() {
  const [visible, setVisible] = useState(true);
  const [maximized, setMaximized] = useState(false);
  const [menu, setMenu] = useState(false);
  const [command, setCommand] = useState("");
  const [lines, setLines] = useState<string[]>([]);
  const [clock, setClock] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const desktop = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLElement>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const history = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const update = () =>
      setClock(new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }));
    update();
    const timer = setInterval(update, 10000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (lines.length) history.current?.scrollTo(0, history.current.scrollHeight);
  }, [lines]);
  function move(x: number, y: number) {
    const d = desktop.current;
    const w = windowRef.current;
    if (!d || !w) return;
    setPosition({
      x: Math.max(-w.offsetLeft, Math.min(d.clientWidth - w.offsetLeft - w.offsetWidth, x)),
      y: Math.max(-w.offsetTop, Math.min(d.clientHeight - w.offsetTop - 45, y)),
    });
  }
  function submit() {
    const value = command.trim();
    if (!value) return;
    const responses: Record<string, string> = {
      help: "about · whoami · date · clear\n読書記録と写真日記は、デスクトップのアイコンから開けます。",
      about: "mizora / 埼玉",
      whoami: "mizora",
      date: new Date().toLocaleString("ja-JP"),
    };
    if (value === "clear") setLines([]);
    else
      setLines((p) =>
        [
          ...p,
          `mizora@wired:~$ ${value}`,
          Object.hasOwn(responses, value)
            ? responses[value]
            : `command not found: ${value}\n使えるコマンドは help で確認できます。`,
        ].slice(-40),
      );
    setCommand("");
  }
  return (
    <div className="lx-page lx-wired lx-home" lang="ja">
      <div className="lx-desktop" ref={desktop}>
        <div className="lx-wired-scenery" aria-hidden="true">
          <img
            className="lx-wired-wallpaper"
            src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/assets/wired-sky-v2.webp`}
            alt=""
          />
          <span className="lx-wired-label">WIRED / 接続中</span>
          <span className="lx-wired-shadow" />
        </div>
        <Background className="lx-rain" color="rgba(56,67,61,.28)" count={80} />
        <header className="lx-panel">
          <button
            type="button"
            className="lx-apps"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            ◉ アクティビティ
          </button>
          <span className="lx-panel-name">mizoraのデスクトップ</span>
          <span className="lx-panel-clock">{clock || "--:--"}</span>
          <DesktopAudio />
          <span className="lx-panel-status" aria-label="接続表示">
            ●
          </span>
        </header>
        {menu && (
          <nav className="lx-menu" aria-label="アプリケーション">
            <button
              type="button"
              onClick={() => {
                setVisible(true);
                setMenu(false);
              }}
            >
              ▣ プロフィール端末
            </button>
            <Link href="/reading">▤ 読書記録</Link>
            <Link href="/diary">▧ 写真日記</Link>
            <a href="https://github.com/Lain-5OR4">⌘ GitHub ↗</a>
          </nav>
        )}
        <nav className="lx-icons" aria-label="デスクトップ">
          <button type="button" onClick={() => setVisible(true)}>
            <DesktopIcon kind="profile" />
            プロフィール
          </button>
          <Link href="/reading">
            <DesktopIcon kind="reading" />
            読書記録
          </Link>
          <Link href="/diary">
            <DesktopIcon kind="diary" />
            写真日記
          </Link>
        </nav>
        <div className="lx-wallpaper-mark" aria-hidden="true">
          w.
          <small>mizora / personal computer</small>
        </div>
        {visible && (
          <section
            ref={windowRef}
            className={`lx-window ${maximized ? "lx-maximized" : ""}`}
            style={
              maximized ? undefined : { transform: `translate(${position.x}px, ${position.y}px)` }
            }
            aria-label="プロフィール端末"
          >
            <div className="lx-titlebar">
              <button
                type="button"
                className="lx-drag"
                aria-label="ウィンドウを動かす。矢印キーでも移動できます"
                onPointerDown={(e) => {
                  if (maximized || window.innerWidth < 700) return;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  drag.current = { x: e.clientX, y: e.clientY, left: position.x, top: position.y };
                }}
                onPointerMove={(e) => {
                  const d = drag.current;
                  if (d) move(d.left + e.clientX - d.x, d.top + e.clientY - d.y);
                }}
                onPointerUp={() => {
                  drag.current = null;
                }}
                onPointerCancel={() => {
                  drag.current = null;
                }}
                onKeyDown={(e) => {
                  if (maximized) return;
                  const deltas: Record<string, number[]> = {
                    ArrowLeft: [-15, 0],
                    ArrowRight: [15, 0],
                    ArrowUp: [0, -15],
                    ArrowDown: [0, 15],
                  };
                  const d = deltas[e.key];
                  if (d) {
                    e.preventDefault();
                    move(position.x + d[0], position.y + d[1]);
                  }
                }}
              >
                ▣ <span>プロフィール</span>
              </button>
              <div className="lx-window-buttons">
                <button type="button" aria-label="最小化" onClick={() => setVisible(false)}>
                  −
                </button>
                <button
                  type="button"
                  aria-label={maximized ? "元のサイズに戻す" : "最大化"}
                  onClick={() => setMaximized(!maximized)}
                >
                  □
                </button>
                <button type="button" aria-label="閉じる" onClick={() => setVisible(false)}>
                  ×
                </button>
              </div>
            </div>
            <div className="lx-menubar">
              ファイル <span>編集</span> 表示 <span>端末</span>
            </div>
            <div className="lx-terminal">
              <p className="lx-command">
                mizora@wired:~$ <span>whoami --profile</span>
              </p>
              <div className="lx-profile">
                <div className="lx-avatar" aria-label="プロフィール画像の仮アイコン">
                  m<span>●</span>
                </div>
                <div>
                  <p className="lx-profile-kicker">PERSONAL PROFILE</p>
                  <h1 className="lx-neon" aria-label="mizora">
                    <span className="lx-neon-ink" aria-hidden="true">
                      mizora
                    </span>
                    <span className="lx-neon-echo lx-neon-echo-a" aria-hidden="true">
                      mizora
                    </span>
                    <span className="lx-neon-echo lx-neon-echo-b" aria-hidden="true">
                      mizora
                    </span>
                  </h1>
                  <p>Saitama, Japan</p>
                </div>
              </div>
              <div className="lx-about">
                <a href="https://github.com/Lain-5OR4">GitHub ↗</a>
              </div>
              <div className="lx-console">
                <div className="lx-history" ref={history} role="log" aria-label="端末の出力">
                  {lines.map((line, i) => (
                    <pre key={`${i}-${line}`}>{line}</pre>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit();
                  }}
                >
                  <label htmlFor="lx-input">mizora@wired:~$</label>
                  <span className="lx-cursor" aria-hidden="true" />
                  <input
                    id="lx-input"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    aria-label="端末コマンド"
                  />

                  <button type="submit">実行 ↵</button>
                </form>
                <p className="lx-help">help で使えるコマンドを表示</p>
              </div>
            </div>
          </section>
        )}
        <footer className="lx-dock">
          <button
            type="button"
            className={visible ? "running" : ""}
            onClick={() => setVisible(!visible)}
            aria-label="プロフィール端末の表示切替"
          >
            <span>&gt;_</span>
            <small>プロフィール</small>
          </button>
          <Link href="/reading">
            <span>▤</span>
            <small>読書記録</small>
          </Link>
          <Link href="/diary">
            <span>▧</span>
            <small>写真日記</small>
          </Link>
        </footer>
      </div>
    </div>
  );
}
