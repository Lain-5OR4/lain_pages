"use client";

import Matter from "matter-js";
import { useEffect, useRef } from "react";

// SVG paths for alphabet shapes (outer + inner cutout for evenodd fill)
const SHAPES: { name: string; path: string }[] = [
  {
    name: "A",
    // Outer A shape + inner triangle hole
    path: "M 50 5 L 5 95 L 25 95 L 35 70 L 65 70 L 75 95 L 95 95 L 50 5 Z M 42 58 L 50 38 L 58 58 Z",
  },
  {
    name: "B",
    // Outer B + two inner holes
    path: "M 15 5 L 15 95 L 65 95 Q 90 95 90 75 Q 90 55 65 52 Q 85 48 85 30 Q 85 5 60 5 Z M 35 18 L 58 18 Q 68 18 68 30 Q 68 40 58 40 L 35 40 Z M 35 55 L 62 55 Q 73 55 73 70 Q 73 82 62 82 L 35 82 Z",
  },
  {
    name: "D",
    // Outer D + inner hole
    path: "M 15 5 L 15 95 L 55 95 Q 90 95 90 50 Q 90 5 55 5 Z M 35 20 L 55 20 Q 72 20 72 50 Q 72 80 55 80 L 35 80 Z",
  },
  {
    name: "O",
    // Outer O + inner hole
    path: "M 50 5 Q 5 5 5 50 Q 5 95 50 95 Q 95 95 95 50 Q 95 5 50 5 Z M 50 22 Q 75 22 75 50 Q 75 78 50 78 Q 25 78 25 50 Q 25 22 50 22 Z",
  },
];

const TEXT_SOURCE =
  "吾輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。" +
  "何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。" +
  "吾輩はここで始めて人間というものを見た。しかもあとで聞くとそれは書生という" +
  "人間中で一番獰悪な種族であったそうだ。この書生というのは時々我々を捕えて煮て食うという話である。" +
  "しかしその当時は何という考もなかったから別段恐しいとも思わなかった。" +
  "ただ彼の掌に載せられてスーと持ち上げられた時何だかフワフワした感じがあったばかりである。";
const CELL_SIZE = 16;
const MAX_BALLS = 60;

export default function PhysicsTextGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const shapeIndexRef = useRef(0);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctxOrNull = canvas.getContext("2d");
    if (!ctxOrNull) return;
    const ctx: CanvasRenderingContext2D = ctxOrNull;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    // Matter.js setup
    const engine = Matter.Engine.create({ gravity: { x: 0, y: 1 } });
    engineRef.current = engine;
    const world = engine.world;

    // Floor and walls
    const walls = [
      Matter.Bodies.rectangle(w / 2, h + 25, w + 100, 50, { isStatic: true }),
      Matter.Bodies.rectangle(-25, h / 2, 50, h, { isStatic: true }),
      Matter.Bodies.rectangle(w + 25, h / 2, 50, h, { isStatic: true }),
    ];
    Matter.Composite.add(world, walls);

    // Grid data - fill with literary text
    const cols = Math.ceil(w / CELL_SIZE);
    const rows = Math.ceil(h / CELL_SIZE);
    const textChars = [...TEXT_SOURCE];
    const gridChars: string[] = new Array(cols * rows);
    for (let i = 0; i < gridChars.length; i++) {
      gridChars[i] = textChars[i % textChars.length];
    }

    // Track static bodies for shape
    let shapeBodies: Matter.Body[] = [];
    let shapeMask: boolean[] = [];

    function computeShapeMask(shapeIndex: number): boolean[] {
      const shape = SHAPES[shapeIndex];
      const path2d = new Path2D();

      // Scale SVG (0-100 coordinate space) to fit centered in viewport
      const size = Math.min(w, h) * 0.7;
      const offsetX = (w - size) / 2;
      const offsetY = (h - size) / 2;
      const scale = size / 100;

      // Parse and scale the path manually using transform
      const svgPath = new Path2D(shape.path);
      const matrix = new DOMMatrix();
      matrix.translateSelf(offsetX, offsetY);
      matrix.scaleSelf(scale, scale);
      path2d.addPath(svgPath, matrix);

      const mask: boolean[] = new Array(cols * rows).fill(false);
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * CELL_SIZE + CELL_SIZE / 2;
          const y = row * CELL_SIZE + CELL_SIZE / 2;
          if (ctx.isPointInPath(path2d, x, y, "evenodd")) {
            mask[row * cols + col] = true;
          }
        }
      }
      return mask;
    }

    function buildShapeBodies(mask: boolean[]) {
      // Remove old shape bodies
      if (shapeBodies.length > 0) {
        Matter.Composite.remove(world, shapeBodies);
      }
      shapeBodies = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (mask[row * cols + col]) {
            const x = col * CELL_SIZE + CELL_SIZE / 2;
            const y = row * CELL_SIZE + CELL_SIZE / 2;
            const body = Matter.Bodies.rectangle(x, y, CELL_SIZE, CELL_SIZE, {
              isStatic: true,
              friction: 0.3,
              restitution: 0.4,
            });
            shapeBodies.push(body);
          }
        }
      }
      Matter.Composite.add(world, shapeBodies);
    }

    // Initial shape
    shapeMask = computeShapeMask(shapeIndexRef.current);
    buildShapeBodies(shapeMask);

    // Balls
    const balls: Matter.Body[] = [];

    function spawnBall(x: number, y: number) {
      const radius = 6 + Math.random() * 6;
      const ball = Matter.Bodies.circle(x, y, radius, {
        restitution: 0.6,
        friction: 0.1,
        density: 0.002,
      });
      // Give slight random horizontal velocity
      Matter.Body.setVelocity(ball, { x: (Math.random() - 0.5) * 4, y: 0 });
      balls.push(ball);
      Matter.Composite.add(world, [ball]);

      // Cap ball count
      while (balls.length > MAX_BALLS) {
        const old = balls.shift();
        if (old) Matter.Composite.remove(world, old);
      }
    }

    // Auto-spawn
    let autoSpawnTimer = 0;

    // Click handler
    const handleClick = (e: MouseEvent) => {
      spawnBall(e.clientX, e.clientY);
    };
    canvas.addEventListener("click", handleClick);

    // Key handler for shape switching
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        shapeIndexRef.current = (shapeIndexRef.current + 1) % SHAPES.length;
        shapeMask = computeShapeMask(shapeIndexRef.current);
        buildShapeBodies(shapeMask);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Animation loop
    let rafId: number;
    let lastTime = performance.now();

    const render = () => {
      rafId = requestAnimationFrame(render);
      const now = performance.now();
      const delta = now - lastTime;
      lastTime = now;

      // Physics step
      Matter.Engine.update(engine, Math.min(delta, 32));

      // Auto-spawn balls
      autoSpawnTimer += delta;
      if (autoSpawnTimer > 300) {
        autoSpawnTimer = 0;
        spawnBall(Math.random() * w, -20);
      }

      // Remove balls that fell too far
      for (let i = balls.length - 1; i >= 0; i--) {
        if (balls[i].position.y > h + 100) {
          Matter.Composite.remove(world, balls[i]);
          balls.splice(i, 1);
        }
      }

      // Draw
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);

      // Background text grid (dim)
      ctx.font = `${CELL_SIZE - 2}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const idx = row * cols + col;
          const x = col * CELL_SIZE + CELL_SIZE / 2;
          const y = row * CELL_SIZE + CELL_SIZE / 2;

          if (shapeMask[idx]) {
            // Shape text - bright
            ctx.fillStyle = "rgba(0, 255, 100, 0.85)";
          } else {
            // Background text - very dim
            ctx.fillStyle = "rgba(0, 255, 0, 0.06)";
          }
          ctx.fillText(gridChars[idx], x, y);
        }
      }

      // Draw balls with glow
      ctx.shadowBlur = 12;
      ctx.shadowColor = "rgba(0, 255, 150, 0.8)";
      for (const ball of balls) {
        const { x, y } = ball.position;
        const r = (ball as Matter.Body & { circleRadius: number }).circleRadius || 8;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 255, 180, 0.9)";
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    };

    render();

    // Resize
    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;

      // Rebuild walls
      Matter.Composite.remove(world, walls);
      walls[0] = Matter.Bodies.rectangle(w / 2, h + 25, w + 100, 50, { isStatic: true });
      walls[1] = Matter.Bodies.rectangle(-25, h / 2, 50, h, { isStatic: true });
      walls[2] = Matter.Bodies.rectangle(w + 25, h / 2, 50, h, { isStatic: true });
      Matter.Composite.add(world, walls);

      // Recompute grid
      const newCols = Math.ceil(w / CELL_SIZE);
      const newRows = Math.ceil(h / CELL_SIZE);
      gridChars.length = newCols * newRows;
      for (let i = 0; i < gridChars.length; i++) {
        if (!gridChars[i]) gridChars[i] = textChars[i % textChars.length];
      }

      // Rebuild shape
      shapeMask = computeShapeMask(shapeIndexRef.current);
      buildShapeBodies(shapeMask);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      Matter.Engine.clear(engine);
      engineRef.current = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full z-0"
      style={{ display: "block" }}
    />
  );
}
