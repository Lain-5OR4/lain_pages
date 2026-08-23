"use client";
import { useEffect, useState } from "react";
import { JellyfishCharacter } from "./JellyfishCharacter";

interface RenderState {
  x: number;
  y: number;
  direction: "left" | "right";
}

export default function WalkingCharacter() {
  // Simulation state (position/target) lives inside the effect; only the
  // values needed for rendering are committed to React state, once per frame.
  const [render, setRender] = useState<RenderState | null>(null);

  useEffect(() => {
    const speed = 1; // px per frame

    const randomTarget = () => ({
      x: Math.random() * (window.innerWidth - 100) + 50,
      y: Math.random() * (window.innerHeight - 100) + 50,
    });

    let pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let target = randomTarget();
    let direction: RenderState["direction"] = "right";
    let frameId = 0;

    const step = () => {
      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 5) {
        target = randomTarget();
      } else {
        if (dx > 0) direction = "right";
        else if (dx < 0) direction = "left";
        pos = { x: pos.x + (dx / distance) * speed, y: pos.y + (dy / distance) * speed };
      }

      setRender({ x: pos.x, y: pos.y, direction });
      frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Nothing to draw until the first frame has measured the window.
  if (!render) return null;

  return (
    <div
      className="fixed left-0 top-0 pointer-events-none z-20"
      style={{
        transform: `translate(${render.x}px, ${render.y}px) scaleX(${
          render.direction === "left" ? -1 : 1
        })`,
      }}
    >
      <div className="relative">
        <JellyfishCharacter />
      </div>
    </div>
  );
}
