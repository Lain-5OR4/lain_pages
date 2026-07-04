"use client";
import WalkingCharacter from "@/components/animation/WalkingCharacter";
import { BackgroundMusicPlayer } from "@/components/audio/BackgroundMusicPlayer";
import Footer from "@/components/footer/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTypingEffect } from "@/hooks/useTypingEffect";
import Link from "next/link";
import "@/app/styles/glitch.css";

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
          <Card className="bg-black border-green-500 border-2 text-green-500 shadow-[0_0_10px_rgba(0,255,0,0.3)] font-mono">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 border-b border-green-900 pb-2">
                <span className="mr-2">{">"}</span>USER_PROFILE
              </h2>
              <p className="text-green-600 text-xs mb-4">{"// some quick facts:"}</p>
              <ul className="space-y-2 text-sm font-mono">
                <li className="flex gap-2">
                  <span className="text-green-700 select-none">•</span>
                  <span>
                    my handle is <span className="text-green-300">mizora</span>
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-700 select-none">•</span>
                  <span>based in Saitama, Japan</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-700 select-none">•</span>
                  <span>i like horror and computers</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-700 select-none">•</span>
                  <span>currently playing: Danganronpa series, HUNDREDLINE</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-700 select-none">•</span>
                  <span className="text-green-600/60">steam profile coming soon...</span>
                </li>
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
            <Card className="bg-black border-green-500 border-2 text-green-500 shadow-[0_0_10px_rgba(0,255,0,0.3)] font-mono hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 border-b border-green-900 pb-2">
                  <span className="mr-2">{">"}</span>MINI_APPS
                </h3>
                <ul className="space-y-2 text-left text-sm mt-4">
                  <li>
                    <Link
                      href="/text-delta"
                      className="text-green-400 hover:text-green-300 hover:underline transition-colors flex items-center group"
                    >
                      <span className="w-2 h-2 bg-green-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      TextDelta.exe
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/void"
                      className="text-green-400 hover:text-green-300 hover:underline transition-colors flex items-center group"
                    >
                      <span className="w-2 h-2 bg-green-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      Wired_Connection.exe
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/fragments"
                      className="text-green-400 hover:text-green-300 hover:underline transition-colors flex items-center group"
                    >
                      <span className="w-2 h-2 bg-green-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      Fragments.exe
                    </Link>
                  </li>
                </ul>
                <div className="mt-8 pt-2 border-t border-green-900/50 text-xs text-green-400/70 text-right">
                  <span className="animate-blink">_</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black border-green-500 border-2 text-green-500 shadow-[0_0_10px_rgba(0,255,0,0.3)] font-mono hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 border-b border-green-900 pb-2">
                  <span className="mr-2">{">"}</span>READING_LOGS
                </h3>
                <p className="mb-4 text-sm text-left mt-4 text-green-400/80">
                  Retrieving data from external database (Notion)...
                </p>
                <a
                  href="https://well-timimus-c9d.notion.site/3b762091a4d04987a6a93473678c7527?v=d7cea027c9b34e2bae2e88f7ac49ab0f"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-6"
                >
                  <Button
                    variant="outline"
                    className="w-full border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-bold uppercase tracking-wider"
                  >
                    ACCESS_DB
                  </Button>
                </a>
                <div className="mt-4 pt-2 border-t border-green-900/50 text-xs text-green-400/70 text-right">
                  <span className="animate-blink">_</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black border-green-500 border-2 text-green-500 shadow-[0_0_10px_rgba(0,255,0,0.3)] font-mono hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 border-b border-green-900 pb-2">
                  <span className="mr-2">{">"}</span>PHOTO_DIARY
                </h3>
                <p className="mb-4 text-sm text-left mt-4 text-green-400/80">
                  Loading memory fragments from local storage...
                </p>
                <Link href="/diary">
                  <Button
                    variant="outline"
                    className="w-full border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-bold uppercase tracking-wider"
                  >
                    OPEN_DIARY
                  </Button>
                </Link>
                <div className="mt-4 pt-2 border-t border-green-900/50 text-xs text-green-400/70 text-right">
                  <span className="animate-blink">_</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black border-green-500 border-2 text-green-500 shadow-[0_0_10px_rgba(0,255,0,0.3)] font-mono hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 border-b border-green-900 pb-2">
                  <span className="mr-2">{">"}</span>JOURNAL
                </h3>
                <p className="mb-4 text-sm text-left mt-4 text-green-400/80">
                  Decompressing long-form build logs...
                </p>
                <Link href="/blog">
                  <Button
                    variant="outline"
                    className="w-full border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-bold uppercase tracking-wider"
                  >
                    READ_JOURNAL
                  </Button>
                </Link>
                <div className="mt-4 pt-2 border-t border-green-900/50 text-xs text-green-400/70 text-right">
                  <span className="animate-blink">_</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
