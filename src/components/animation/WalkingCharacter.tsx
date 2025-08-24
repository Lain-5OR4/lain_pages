"use client";
import { useEffect, useState } from "react";

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
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  // 新しいランダムな目標位置を生成
  const getRandomTarget = (): Target => {
    return {
      x: Math.random() * (window.innerWidth - 100) + 50,
      y: Math.random() * (window.innerHeight - 100) + 50,
    };
  };

  // 初期化と目標位置の設定
  useEffect(() => {
    const initialTarget = getRandomTarget();
    setTarget(initialTarget);
    setPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  }, []);

  // アニメーションループ
  useEffect(() => {
    const speed = 1; // 移動速度（ピクセル/フレーム）
    const interval = setInterval(() => {
      setPosition(currentPos => {
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
          setDirection('right');
        } else if (dx < 0) {
          setDirection('left');
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
  }, [target]);

  return (
    <div
      className="fixed pointer-events-none z-20 transition-transform duration-75"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
      }}
    >
      {/* 歩き回る猫のSVGアイコン */}
      <div className="relative">
        <svg
          width="50"
          height="40"
          viewBox="0 0 50 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          {/* 猫の体 */}
          <ellipse
            cx="25"
            cy="28"
            rx="18"
            ry="8"
            fill="#666"
            stroke="#444"
            strokeWidth="0.5"
          />
          {/* 猫の頭 */}
          <circle
            cx="25"
            cy="18"
            r="10"
            fill="#666"
            stroke="#444"
            strokeWidth="0.5"
          />
          {/* 耳 */}
          <path
            d="M18 12 L20 8 L22 12 Z"
            fill="#666"
            stroke="#444"
            strokeWidth="0.5"
          />
          <path
            d="M28 12 L30 8 L32 12 Z"
            fill="#666"
            stroke="#444"
            strokeWidth="0.5"
          />
          {/* 耳の中 */}
          <path
            d="M19 11 L20 9 L21 11 Z"
            fill="#ff69b4"
          />
          <path
            d="M29 11 L30 9 L31 11 Z"
            fill="#ff69b4"
          />
          {/* 目 */}
          <ellipse
            cx="21"
            cy="16"
            rx="2"
            ry="3"
            fill="#00ff00"
          />
          <ellipse
            cx="29"
            cy="16"
            rx="2"
            ry="3"
            fill="#00ff00"
          />
          {/* 瞳 */}
          <ellipse
            cx="21"
            cy="16"
            rx="1"
            ry="2"
            fill="#000"
          />
          <ellipse
            cx="29"
            cy="16"
            rx="1"
            ry="2"
            fill="#000"
          />
          {/* 鼻 */}
          <path
            d="M25 19 L23 21 L27 21 Z"
            fill="#ff69b4"
          />
          {/* 口 */}
          <path
            d="M25 21 Q22 23 20 22"
            stroke="#000"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M25 21 Q28 23 30 22"
            stroke="#000"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
          />
          {/* ひげ */}
          <line
            x1="15"
            y1="18"
            x2="10"
            y2="17"
            stroke="#000"
            strokeWidth="0.8"
          />
          <line
            x1="15"
            y1="20"
            x2="10"
            y2="20"
            stroke="#000"
            strokeWidth="0.8"
          />
          <line
            x1="35"
            y1="18"
            x2="40"
            y2="17"
            stroke="#000"
            strokeWidth="0.8"
          />
          <line
            x1="35"
            y1="20"
            x2="40"
            y2="20"
            stroke="#000"
            strokeWidth="0.8"
          />
          {/* 足 */}
          <ellipse
            cx="15"
            cy="35"
            rx="3"
            ry="2"
            fill="#444"
          />
          <ellipse
            cx="22"
            cy="35"
            rx="3"
            ry="2"
            fill="#444"
          />
          <ellipse
            cx="28"
            cy="35"
            rx="3"
            ry="2"
            fill="#444"
          />
          <ellipse
            cx="35"
            cy="35"
            rx="3"
            ry="2"
            fill="#444"
          />
          {/* しっぽ */}
          <path
            d="M42 25 Q48 20 45 15 Q42 18 44 22"
            stroke="#666"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}