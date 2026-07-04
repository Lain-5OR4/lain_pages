"use client";
import WalkingCharacter from "@/components/animation/WalkingCharacter";
import { BackgroundMusicPlayer } from "@/components/audio/BackgroundMusicPlayer";
import Footer from "@/components/footer/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTypingEffect } from "@/hooks/useTypingEffect";
import Link from "next/link";
import type { ReactNode } from "react";
import "@/app/styles/glitch.css";

const TERMINAL_CARD =
  "bg-black border-green-500 border-2 text-green-500 shadow-[0_0_10px_rgba(0,255,0,0.3)] font-mono";

const QUICK_FACTS: ReactNode[] = [
  <span key="handle">
    my handle is <span className="text-green-300">mizora</span>
  </span>,
  "based in Saitama, Japan",
  "i like horror and computers",
  "currently playing: Danganronpa series, HUNDREDLINE",
  <span key="steam" className="text-green-600/60">
    steam profile coming soon...
  </span>,
];

const MINI_APPS = [
  { href: "/text-delta", label: "TextDelta.exe" },
  { href: "/void", label: "Wired_Connection.exe" },
  { href: "/fragments", label: "Fragments.exe" },
];

const GATEWAYS = [
  {
    title: "READING_LOGS",
    blurb: "Retrieving data from external database (Notion)...",
    cta: "ACCESS_DB",
    href: "https://well-timimus-c9d.notion.site/3b762091a4d04987a6a93473678c7527?v=d7cea027c9b34e2bae2e88f7ac49ab0f",
    external: true,
  },
  {
    title: "PHOTO_DIARY",
    blurb: "Loading memory fragments from local storage...",
    cta: "OPEN_DIARY",
    href: "/diary",
    external: false,
  },
  {
    title: "JOURNAL",
    blurb: "Decompressing long-form build logs...",
    cta: "READ_JOURNAL",
    href: "/blog",
    external: false,
  },
];

function CardHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xl font-bold mb-2 border-b border-green-900 pb-2">
      <span className="mr-2">{">"}</span>
      {children}
    </h3>
  );
}

function CardBlinker({ className = "mt-4" }: { className?: string }) {
  return (
    <div
      className={`${className} pt-2 border-t border-green-900/50 text-xs text-green-400/70 text-right`}
    >
      <span className="animate-blink">_</span>
    </div>
  );
}

function GatewayCard({ title, blurb, cta, href, external }: (typeof GATEWAYS)[number]) {
  const button = (
    <Button
      variant="outline"
      className="w-full border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-bold uppercase tracking-wider"
    >
      {cta}
    </Button>
  );
  return (
    <Card className={`${TERMINAL_CARD} hover:scale-105 transition-transform duration-300`}>
      <CardContent className="p-6">
        <CardHeading>{title}</CardHeading>
        <p className="mb-4 text-sm text-left mt-4 text-green-400/80">{blurb}</p>
        {external ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="block mt-6">
            {button}
          </a>
        ) : (
          <Link href={href}>{button}</Link>
        )}
        <CardBlinker />
      </CardContent>
    </Card>
  );
}

export default function Component() {
  const fullText = "Welcome to my digital realm ";
  const renderTypingEffect = useTypingEffect(fullText);

  return (
    <div className="bg-black text-green-500 font-mono relative overflow-hidden min-h-screen flex flex-col">
      <BackgroundMusicPlayer />
      <WalkingCharacter />
      <main className="container mx-auto relative z-10 flex-1 p-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 glitch" data-text="Mizora">
            Mizora
          </h1>
          {renderTypingEffect()}
        </header>

        <section className="mb-12">
          <Card className={TERMINAL_CARD}>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 border-b border-green-900 pb-2">
                <span className="mr-2">{">"}</span>USER_PROFILE
              </h2>
              <p className="text-green-600 text-xs mb-4">{"// some quick facts:"}</p>
              <ul className="space-y-2 text-sm font-mono">
                {QUICK_FACTS.map((fact, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static list
                  <li key={i} className="flex gap-2">
                    <span className="text-green-700 select-none">•</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-4 border-t border-green-900/30 text-xs text-green-600">
                <p>
                  {">"} Waiting for input<span className="animate-blink">_</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-8 text-green-500 font-mono tracking-widest text-shadow-[0_0_10px_rgba(0,255,0,0.5)]">
            {">"} PROJECTS_
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className={`${TERMINAL_CARD} hover:scale-105 transition-transform duration-300`}>
              <CardContent className="p-6">
                <CardHeading>MINI_APPS</CardHeading>
                <ul className="space-y-2 text-left text-sm mt-4">
                  {MINI_APPS.map((app) => (
                    <li key={app.href}>
                      <Link
                        href={app.href}
                        className="text-green-400 hover:text-green-300 hover:underline transition-colors flex items-center group"
                      >
                        <span className="w-2 h-2 bg-green-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {app.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <CardBlinker className="mt-8" />
              </CardContent>
            </Card>

            {GATEWAYS.map((gw) => (
              <GatewayCard key={gw.title} {...gw} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
