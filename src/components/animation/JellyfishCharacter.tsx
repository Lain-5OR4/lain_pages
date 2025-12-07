"use client";

export const JellyfishCharacter = () => {
  return (
    <div className="relative w-[25px] h-[30px]">
      <style jsx>{`
        @keyframes swim {
          0%, 100% { transform: translateY(0) scale(1, 1); }
          50% { transform: translateY(-4px) scale(0.9, 1.1); } /* Adjusted swim distance for smaller size */
        }
        @keyframes tentacles {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes inner-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        .jellyfish-body {
          animation: swim 3s infinite ease-in-out;
        }
        .tentacle {
           transform-origin: top center;
           animation: tentacles 2s infinite ease-in-out alternate;
        }
        .tentacle-1 { animation-delay: 0s; }
        .tentacle-2 { animation-delay: 0.5s; }
        .tentacle-3 { animation-delay: 1s; }
      `}</style>
      <svg
        width="25"
        height="30"
        viewBox="0 0 60 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_5px_rgba(0,255,255,0.3)]"
        aria-label="Jellyfish Character"
        role="img"
      >
        <title>Jellyfish Character</title>
        <g
          className="jellyfish-body"
          style={{ transformBox: "fill-box", transformOrigin: "center top" }}
        >
          <path
            d="M5 30 C 5 10, 55 10, 55 30 C 55 45, 5 45, 5 30 Z"
            fill="rgba(0, 255, 255, 0.1)"
            stroke="rgba(0, 255, 255, 0.6)"
            strokeWidth="1.5"
          />
          <ellipse
            cx="30"
            cy="30"
            rx="15"
            ry="8"
            fill="rgba(0, 255, 255, 0.5)"
            className="inner-glow"
            style={{ animation: "inner-glow 2s infinite" }}
            filter="blur(2px)"
          />

          <g transform="translate(0, 45)">
            <path
              className="tentacle tentacle-1"
              d="M15 0 Q 10 15, 15 30"
              stroke="rgba(0, 255, 255, 0.6)"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              className="tentacle tentacle-2"
              d="M30 0 Q 25 15, 30 35"
              stroke="rgba(0, 255, 255, 0.6)"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              className="tentacle tentacle-3"
              d="M45 0 Q 50 15, 45 30"
              stroke="rgba(0, 255, 255, 0.6)"
              strokeWidth="1.5"
              fill="none"
            />

            <path
              className="tentacle tentacle-2"
              d="M25 0 Q 20 20, 28 40"
              stroke="rgba(0,255,255,0.3)"
              strokeWidth="0.5"
              fill="none"
            />
            <path
              className="tentacle tentacle-1"
              d="M35 0 Q 40 20, 32 40"
              stroke="rgba(0,255,255,0.3)"
              strokeWidth="0.5"
              fill="none"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};
