"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTypingEffect } from "@/hooks/useTypingEffect";
import "./styles/glitch.css";

export default function Component() {
  const fullText = "Welcome to my digital realm ";
  /*
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const raindrops: { x: number; y: number; length: number; speed: number }[] = [];

    for (let i = 0; i < 100; i++) {
      raindrops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 20 + 10,
        speed: Math.random() * 10 + 5,
      });
    }

    function drawRain() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(0, 255, 0, 0.5)";
      ctx.lineWidth = 1;

      for (const drop of raindrops) {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.stroke();

        drop.y += drop.speed;
        if (drop.y > canvas.height) {
          drop.y = -drop.length;
          drop.x = Math.random() * canvas.width;
        }
      }

      requestAnimationFrame(drawRain);
    }

    drawRain();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  */

  return (
    <div className="min-h-screen bg-black text-green-500 p-8 font-mono relative overflow-hidden">
      <main className="container mx-auto relative z-10">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 glitch" data-text="5OR4dev">
            5OR4dev
          </h1>
          <p className="text-xl">
            {useTypingEffect(fullText, 100)}
            <span className="animate-blink">❚</span>
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-gray-900 border-green-500 text-red-600">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">About Me</h2>
              <p>Coming soon...</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-green-500">
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
                <Card key={uniqueKey} className="bg-gray-900 border-green-500">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">{project}</h3>
                    <p>Coming soon...</p>
                    <Button
                      variant="outline"
                      className="mt-4 border-green-500 text-green-500 hover:bg-green-500 hover:text-black"
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
