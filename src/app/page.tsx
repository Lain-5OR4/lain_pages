"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTypingEffect } from "@/hooks/useTypingEffect";
import Link from "next/link";
import Footer from "@/components/footer/Footer";
import "./styles/glitch.css";

export default function Component() {
  const fullText = "Welcome to my digital realm ";
  const renderTypingEffect = useTypingEffect(fullText);

  return (
    <div className="bg-black text-green-500 font-mono relative overflow-hidden min-h-screen flex flex-col">
      <main className="container mx-auto relative z-10 flex-1 p-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 glitch" data-text="5OR4dev">
            5OR4dev
          </h1>
          {renderTypingEffect()}
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-gray-900 border-green-500 text-slate-300">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">About Me</h2>
              <p>Coming soon...</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-green-500 text-slate-300">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Skills</h2>
              <ul className="list-disc list-inside">
                <li>HTML/CSS/JavaScript</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-900 border-green-500 text-slate-300">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Mini Apps</h3>
                <ul className="space-y-2 text-left text-sm">
                  <li>
                    <Link
                      href="/text-delta"
                      className="text-green-400 hover:text-green-300 hover:underline transition-colors"
                    >
                      TextDelta
                    </Link>
                  </li>
                  <li>
                    <a
                      // biome-ignore lint/a11y/useValidAnchor: <explanation>
                      href="#"
                      className="text-green-400 hover:text-green-300 hover:underline transition-colors"
                    >
                      Coming soon...
                    </a>
                  </li>
                  <li>
                    <a
                      // biome-ignore lint/a11y/useValidAnchor: <explanation>
                      href="#"
                      className="text-green-400 hover:text-green-300 hover:underline transition-colors"
                    >
                      Coming soon...
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {["Coming soon...1", "Coming soon...2"].map((project) => {
              const uniqueKey = `${project}`;
              return (
                <Card key={uniqueKey} className="bg-gray-900 border-green-500 text-slate-300">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">{project}</h3>
                    <p>Coming soon...</p>
                    <Button
                      variant="outline"
                      className="mt-4 border-green-500 text-green-500 hover:bg-green-500 hover:text-black bg-sky-100"
                    >
                      View Project
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
