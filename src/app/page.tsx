"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Github, Mail, Twitter } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Component() {
	const [typedText, setTypedText] = useState("");
	const fullText = "Welcome to my digital realm!";
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const timeoutRef = useRef<NodeJS.Timeout>();

	useEffect(() => {
		let current_index = 0;
		const typeNextCharacter = () => {
			if (current_index < fullText.length) {
				setTypedText(fullText.slice(0, current_index + 1));
				current_index++;
				timeoutRef.current = setTimeout(typeNextCharacter, 100);
			}
		};
		typeNextCharacter();

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		const raindrops: { x: number; y: number; length: number; speed: number }[] =
			[];

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

	return (
		<div className="min-h-screen bg-black text-green-500 p-8 font-mono relative overflow-hidden">
			<style jsx>{`
        @keyframes glitch {
          0% {
            transform: translate(0)
          }
          20% {
            transform: translate(-5px, 5px)
          }
          40% {
            transform: translate(-5px, -5px)
          }
          60% {
            transform: translate(5px, 5px)
          }
          80% {
            transform: translate(5px, -5px)
          }
          to {
            transform: translate(0)
          }
        }
        .glitch {
          position: relative;
          animation: glitch 1s infinite;
        }
        .glitch::before,
        .glitch::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .glitch::before {
          left: 2px;
          text-shadow: -2px 0 #ff00c1;
          clip: rect(44px, 450px, 56px, 0);
          animation: glitch-anim 5s infinite linear alternate-reverse;
        }
        .glitch::after {
          left: -2px;
          text-shadow: -2px 0 #00fff9, 2px 2px #ff00c1;
          animation: glitch-anim2 1s infinite linear alternate-reverse;
        }
        @keyframes glitch-anim {
          0% {
            clip: rect(10px, 9999px, 31px, 0);
            transform: skew(0.6deg);
          }
          5% {
            clip: rect(70px, 9999px, 71px, 0);
            transform: skew(0.87deg);
          }
          10% {
            clip: rect(74px, 9999px, 33px, 0);
            transform: skew(0.03deg);
          }
          15% {
            clip: rect(89px, 9999px, 85px, 0);
            transform: skew(0.95deg);
          }
          20% {
            clip: rect(57px, 9999px, 97px, 0);
            transform: skew(0.7deg);
          }
          25% {
            clip: rect(86px, 9999px, 18px, 0);
            transform: skew(0.37deg);
          }
          30% {
            clip: rect(100px, 9999px, 91px, 0);
            transform: skew(0.56deg);
          }
          35% {
            clip: rect(4px, 9999px, 69px, 0);
            transform: skew(0.09deg);
          }
          40% {
            clip: rect(28px, 9999px, 97px, 0);
            transform: skew(0.02deg);
          }
          45% {
            clip: rect(82px, 9999px, 54px, 0);
            transform: skew(0.06deg);
          }
          50% {
            clip: rect(46px, 9999px, 46px, 0);
            transform: skew(0.98deg);
          }
          55% {
            clip: rect(31px, 9999px, 88px, 0);
            transform: skew(0.35deg);
          }
          60% {
            clip: rect(69px, 9999px, 54px, 0);
            transform: skew(0.02deg);
          }
          65% {
            clip: rect(71px, 9999px, 31px, 0);
            transform: skew(0.48deg);
          }
          70% {
            clip: rect(98px, 9999px, 86px, 0);
            transform: skew(0.01deg);
          }
          75% {
            clip: rect(20px, 9999px, 78px, 0);
            transform: skew(0.34deg);
          }
          80% {
            clip: rect(30px, 9999px, 35px, 0);
            transform: skew(0.09deg);
          }
          85% {
            clip: rect(53px, 9999px, 5px, 0);
            transform: skew(0.07deg);
          }
          90% {
            clip: rect(84px, 9999px, 34px, 0);
            transform: skew(0.22deg);
          }
          95% {
            clip: rect(11px, 9999px, 35px, 0);
            transform: skew(0.12deg);
          }
          100% {
            clip: rect(73px, 9999px, 75px, 0);
            transform: skew(0.86deg);
          }
        }
        @keyframes glitch-anim2 {
          0% {
            clip: rect(65px, 9999px, 99px, 0);
            transform: skew(0.39deg);
          }
          5% {
            clip: rect(86px, 9999px, 49px, 0);
            transform: skew(0.22deg);
          }
          10% {
            clip: rect(81px, 9999px, 63px, 0);
            transform: skew(0.55deg);
          }
          15% {
            clip: rect(25px, 9999px, 15px, 0);
            transform: skew(0.05deg);
          }
          20% {
            clip: rect(30px, 9999px, 67px, 0);
            transform: skew(0.2deg);
          }
          25% {
            clip: rect(46px, 9999px, 91px, 0);
            transform: skew(0.67deg);
          }
          30% {
            clip: rect(72px, 9999px, 43px, 0);
            transform: skew(0.98deg);
          }
          35% {
            clip: rect(22px, 9999px, 100px, 0);
            transform: skew(0.86deg);
          }
          40% {
            clip: rect(26px, 9999px, 23px, 0);
            transform: skew(0.01deg);
          }
          45% {
            clip: rect(45px, 9999px, 66px, 0);
            transform: skew(0.65deg);
          }
          50% {
            clip: rect(31px, 9999px, 56px, 0);
            transform: skew(0.79deg);
          }
          55% {
            clip: rect(57px, 9999px, 71px, 0);
            transform: skew(0.26deg);
          }
          60% {
            clip: rect(64px, 9999px, 62px, 0);
            transform: skew(0.78deg);
          }
          65% {
            clip: rect(94px, 9999px, 46px, 0);
            transform: skew(0.21deg);
          }
          70% {
            clip: rect(29px, 9999px, 81px, 0);
            transform: skew(0.65deg);
          }
          75% {
            clip: rect(52px, 9999px, 28px, 0);
            transform: skew(0.45deg);
          }
          80% {
            clip: rect(23px, 9999px, 60px, 0);
            transform: skew(0.02deg);
          }
          85% {
            clip: rect(30px, 9999px, 87px, 0);
            transform: skew(0.33deg);
          }
          90% {
            clip: rect(100px, 9999px, 85px, 0);
            transform: skew(0.1deg);
          }
          95% {
            clip: rect(39px, 9999px, 87px, 0);
            transform: skew(0.43deg);
          }
          100% {
            clip: rect(76px, 9999px, 40px, 0);
            transform: skew(0.98deg);
          }
        }
      `}</style>
			<canvas
				ref={canvasRef}
				className="absolute top-0 left-0 w-full h-full pointer-events-none"
				aria-hidden="true"
				tabIndex={-1}
			/>
			<main className="container mx-auto relative z-10">
				<header className="text-center mb-12">
					<h1 className="text-4xl font-bold mb-4 glitch" data-text="John Doe">
						John Doe
					</h1>
					<p className="text-xl">
						{typedText}
						<span className="animate-blink">|</span>
					</p>
				</header>

				<section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
					<Card className="bg-gray-900 border-green-500">
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
								<li>React & Next.js</li>
								<li>Node.js</li>
								<li>Retro UI Design</li>
								<li>Time Travel (WIP)</li>
							</ul>
						</CardContent>
					</Card>
				</section>

				<section className="text-center mb-12">
					<h2 className="text-2xl font-bold mb-4">Projects</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{["Coming soon", "Coming soon...", "Coming soon"].map((project) => {
							const uniqueKey = `${project}-${Math.random().toString(36).substr(2, 9)}`;
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

				<footer className="text-center">
					<div className="flex justify-center space-x-4 mb-4">
						<Button
							variant="outline"
							size="icon"
							className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black"
						>
							<Github className="h-4 w-4" />
							<span className="sr-only">GitHub</span>
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black"
						>
							<Twitter className="h-4 w-4" />
							<span className="sr-only">Twitter</span>
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black"
						>
							<Mail className="h-4 w-4" />
							<span className="sr-only">Email</span>
						</Button>
					</div>
					<p>&copy; 2024 John Doe. All rights reserved.</p>
				</footer>
			</main>
		</div>
	);
}
