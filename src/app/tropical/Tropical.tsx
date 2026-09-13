"use client";

import Link from "next/link";
import { useState } from "react";
import "./tropical.css";

const activities = [
  {
    name: "Beach",
    title: "海のそばで。",
    text: "タオルとサングラス。それだけ持って砂浜へ。",
    symbol: "↗",
    detail: "01 / SAND BETWEEN YOUR TOES",
  },
  {
    name: "Coffee",
    title: "氷、多めで。",
    text: "日陰のテラスで、ゆっくりアイスコーヒー。",
    symbol: "◒",
    detail: "02 / SOMETHING COLD, PLEASE",
  },
  {
    name: "Music",
    title: "お気に入りを一曲。",
    text: "波の音に混ぜるなら、今日はどんな曲？",
    symbol: "♫",
    detail: "03 / YOUR SUMMER SOUNDTRACK",
  },
];

export default function Tropical() {
  const [sunset, setSunset] = useState(false);
  const [activity, setActivity] = useState(0);
  const current = activities[activity];
  return (
    <main className={`tp-page${sunset ? " tp-sunset" : ""}`} lang="ja">
      <header className="tp-header">
        <a className="tp-brand" href="#home" aria-label="Sunday Club ホーム">
          <span aria-hidden="true">✳</span> sunday club
        </a>
        <nav aria-label="ページ内ナビゲーション">
          <a href="#club">THE CLUB</a>
          <a href="#menu">DAY OFF MENU</a>
        </nav>
        <a className="tp-header-link" href="#menu">
          ひと休みする <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section className="tp-hero" id="home" aria-labelledby="tp-title">
        <div className="tp-intro">
          <div className="tp-eyebrow">
            <span /> A LITTLE CLOSER TO SUMMER
          </div>
          <h1 id="tp-title">
            TROPICAL
            <br />
            <span>DAY OFF.</span>
          </h1>
          <div className="tp-intro-bottom">
            <p>
              海と、コーヒーと、好きな音楽。
              <br />
              日曜日の気分でどうぞ。
            </p>
            <a className="tp-cta" href="#menu">
              今日の過ごし方 <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="tp-side-note">
            <span aria-hidden="true">✳</span>
            <span>
              NO DRESS CODE.
              <br />
              JUST A GOOD MOOD.
            </span>
            <span className="tp-handwritten">See you by the sea!</span>
          </div>
        </div>

        <div className="tp-poster-wrap">
          <div
            className="tp-poster"
            aria-label={sunset ? "夕暮れの海と白いヤシの葉" : "太陽、青い海と白いヤシの葉"}
            role="img"
          >
            <div className="tp-sun" />
            <div className="tp-sea" />
            <div className="tp-sea-lines" />
            <img
              className="tp-palms"
              src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/assets/tropical/fix.webp`}
              alt=""
            />
            <span className="tp-poster-top">SUNDAY CLUB / EST. IN YOUR MIND</span>
            <span className="tp-poster-word">
              a good
              <br />
              <i>day.</i>
            </span>
            <span className="tp-poster-bottom">
              {sunset ? "GOLDEN HOUR / 18:30" : "SOMEWHERE SUNNY / 14:00"}
            </span>
          </div>
          <div className="tp-stamp" aria-hidden="true">
            100%
            <br />
            <small>DAY OFF</small>
            <span>✳</span>
          </div>
          <button
            type="button"
            className="tp-time"
            aria-pressed={sunset}
            onClick={() => setSunset(!sunset)}
          >
            <span aria-hidden="true">{sunset ? "◐" : "☀"}</span>{" "}
            {sunset ? "夕暮れ → 昼にする" : "昼 → 夕暮れにする"}
          </button>
        </div>
      </section>

      <div className="tp-ribbon" aria-hidden="true">
        <span>SUN ON YOUR FACE</span> ✳ <span>SALT IN THE AIR</span> ✳ <span>TAKE YOUR TIME</span> ✳{" "}
        <span>SUNDAY CLUB</span> ✳
      </div>

      <section id="club" className="tp-club">
        <p className="tp-eyebrow">WELCOME TO THE CLUB / 01</p>
        <div>
          <h2>
            休日に、
            <br />
            決まりごとはいらない。
          </h2>
          <p>
            朝から海に入っても、お昼まで寝ていても。
            <br />
            Sunday Club は、そんな海辺の休日をイメージした場所。
            <br />
            まずは、今日の気分を選んでみて。
          </p>
        </div>
        <span className="tp-club-flower" aria-hidden="true">
          ✳
        </span>
      </section>

      <section id="menu" className="tp-menu" aria-labelledby="tp-menu-title">
        <div className="tp-menu-heading">
          <div>
            <p className="tp-eyebrow">MAKE IT YOUR SUNDAY / 02</p>
            <h2 id="tp-menu-title">What's the mood?</h2>
          </div>
          <span>今日は、何する？</span>
        </div>
        <fieldset className="tp-choices" aria-label="今日の気分">
          {activities.map((item, index) => (
            <button
              type="button"
              key={item.name}
              aria-pressed={activity === index}
              onClick={() => setActivity(index)}
            >
              <span>0{index + 1}</span>
              {item.name}
              <span aria-hidden="true">{item.symbol}</span>
            </button>
          ))}
        </fieldset>
        <div className="tp-mood" aria-live="polite">
          <div className="tp-mood-symbol" aria-hidden="true">
            {current.symbol}
          </div>
          <div>
            <p className="tp-eyebrow">{current.detail}</p>
            <h3>{current.title}</h3>
            <p>{current.text}</p>
          </div>
          <span className="tp-mood-note">
            sounds like
            <br />
            <i>a plan.</i>
          </span>
        </div>
      </section>

      <footer className="tp-footer">
        <a className="tp-brand" href="#home">
          <span aria-hidden="true">✳</span> sunday club
        </a>
        <p>架空のビーチクラブをテーマにしたデザインデモ。</p>
        <Link href="/">デスクトップへ戻る ↗</Link>
      </footer>
    </main>
  );
}
