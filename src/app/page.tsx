"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTypingEffect } from "@/hooks/useTypingEffect";
import "./styles/glitch.css";

export default function Component() {
  const fullText = "Welcome to my digital realm ";
  const renderTypingEffect = useTypingEffect(fullText);

  return (
    <div className="min-h-screen bg-black text-green-500 p-8 font-mono relative overflow-hidden">
      <main className="container mx-auto relative z-10">
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
            {["Coming soon...1", "Coming soon...2", "Coming soon...3"].map((project) => {
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
    </div>
  );
}
