"use client";
import { useCallback, useEffect, useState } from "react";
import { JellyfishCharacter } from "./JellyfishCharacter";

interface Position {
  x: number;
  y: number;
}

interface Target {
  x: number;
  y: number;
}

export default function WalkingCharacter() {
  const [position, setPosition] = useState<Position>({ x: 50, y: 50 });
  const [target, setTarget] = useState<Target>({ x: 50, y: 50 });
  const [direction, setDirection] = useState<"left" | "right">("right");

  // 新しいランダムな目標位置を生成
  const getRandomTarget = useCallback((): Target => {
    return {
      x: Math.random() * (window.innerWidth - 100) + 50,
      y: Math.random() * (window.innerHeight - 100) + 50,
    };
  }, []);

  // 初期化と目標位置の設定
  useEffect(() => {
    const initialTarget = getRandomTarget();
    setTarget(initialTarget);
    setPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  }, [getRandomTarget]);

  // アニメーションループ
  useEffect(() => {
    const speed = 1; // 移動速度（ピクセル/フレーム）
    const interval = setInterval(() => {
      setPosition((currentPos) => {
        const dx = target.x - currentPos.x;
        const dy = target.y - currentPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 目標に近づいたら新しい目標を設定
        if (distance < 5) {
          const newTarget = getRandomTarget();
          setTarget(newTarget);
          return currentPos;
        }

        // 移動方向に基づいて向きを決定
        if (dx > 0) {
          setDirection("right");
        } else if (dx < 0) {
          setDirection("left");
        }

        // 目標に向かって移動
        const moveX = (dx / distance) * speed;
        const moveY = (dy / distance) * speed;

        return {
          x: currentPos.x + moveX,
          y: currentPos.y + moveY,
        };
      });
    }, 16); // 約60FPS

    return () => clearInterval(interval);
  }, [target, getRandomTarget]);

  return (
    <div
      className="fixed pointer-events-none z-20 transition-transform duration-75"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: direction === "left" ? "scaleX(-1)" : "scaleX(1)",
      }}
    >
      <div className="relative">
        <JellyfishCharacter />
      </div>
    </div>
  );
}
