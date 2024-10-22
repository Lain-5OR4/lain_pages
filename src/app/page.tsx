"use client";
import Icon from "@/components/icon_component/createIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTypingEffect } from "@/hooks/useTypingEffect";
import { use, useEffect, useRef, useState } from "react";
import { siGithub, siX } from "simple-icons";
import "./styles/glitch.css";

export default function Component() {
	const fullText = "Welcome to my digital realm!";
	const canvasRef = useRef<HTMLCanvasElement>(null);

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
			<canvas
				ref={canvasRef}
				className="absolute top-0 left-0 w-full h-full pointer-events-none"
				aria-hidden="true"
				tabIndex={-1}
			/>
			<main className="container mx-auto relative z-10">
				<header className="text-center mb-12">
					<h1 className="text-4xl font-bold mb-4 glitch" data-text="XXXX">
						XXXX
					</h1>
					<p className="text-xl">
						{useTypingEffect(fullText, 100)}
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
							<Icon icon={siGithub} />
							<span className="sr-only">GitHub</span>
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black"
						>
							<Icon icon={siX} />
							<span className="sr-only">Twitter</span>
						</Button>
					</div>
					<p>&copy; 2024 John Doe. All rights reserved.</p>
				</footer>
			</main>
		</div>
	);
}
