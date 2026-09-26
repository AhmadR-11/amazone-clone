'use client';

import React, { useState, useEffect, useRef } from 'react';

interface AuthMascotProps {
  isPasswordFocused: boolean;
  isPasswordVisible: boolean;
  isEmailFocused?: boolean;
}

export default function AuthMascot({
  isPasswordFocused,
  isPasswordVisible,
  isEmailFocused = false,
}: AuthMascotProps) {
  const isCoveringEyes = isPasswordFocused && !isPasswordVisible;
  const isPeeking = isPasswordFocused && isPasswordVisible;

  const mascotRef = useRef<HTMLDivElement>(null);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!mascotRef.current) return;
      const rect = mascotRef.current.getBoundingClientRect();
      const mascotCenterX = rect.left + rect.width / 2;
      const mascotCenterY = rect.top + rect.height / 2;

      const deltaX = e.clientX - mascotCenterX;
      const deltaY = e.clientY - mascotCenterY;
      const distance = Math.hypot(deltaX, deltaY);

      // Max pupil displacement ±4.2px
      const maxOffset = 4.2;
      const factor = Math.min(distance / 250, 1);
      const angle = Math.atan2(deltaY, deltaX);

      const offsetX = Math.cos(angle) * maxOffset * factor;
      const offsetY = Math.sin(angle) * maxOffset * factor;

      setPupilOffset({ x: offsetX, y: offsetY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const leftPupilX = (isEmailFocused ? 50 : 54) + pupilOffset.x;
  const leftPupilY = 66 + pupilOffset.y;
  const rightPupilX = (isEmailFocused ? 82 : 86) + pupilOffset.x;
  const rightPupilY = 66 + pupilOffset.y;

  const leftShineX = 56 + pupilOffset.x * 0.4;
  const leftShineY = 63 + pupilOffset.y * 0.4;
  const rightShineX = 88 + pupilOffset.x * 0.4;
  const rightShineY = 63 + pupilOffset.y * 0.4;

  return (
    <div ref={mascotRef} className="flex justify-center items-center py-2 relative select-none">
      <div className="w-28 h-28 relative flex items-center justify-center">
        {/* Soft Radial Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 via-cyan-500/20 to-transparent rounded-full blur-2xl animate-pulse pointer-events-none" />

        <svg
          viewBox="0 0 140 140"
          className="w-full h-full relative z-10 drop-shadow-xl transition-transform duration-500"
        >
          <defs>
            {/* Body Metallic Dark Gradient */}
            <linearGradient id="mascotBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="50%" stopColor="#020617" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            {/* Visor Glass Gradient */}
            <linearGradient id="mascotVisor" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            {/* Accent Neon Blue Gradient */}
            <linearGradient id="accentBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>

            {/* Paw Gradient */}
            <linearGradient id="pawGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* Glass Highlight */}
            <linearGradient id="glassShine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* MAIN BODY FRAME */}
          <g
            className={`transition-all duration-500 ease-out origin-center ${
              isEmailFocused
                ? 'rotate-[-3deg] scale-[1.02]'
                : isCoveringEyes
                ? 'scale-[0.98]'
                : 'rotate-[0deg]'
            }`}
          >
            {/* Outer Body Capsule */}
            <rect
              x="25"
              y="30"
              width="90"
              height="85"
              rx="42"
              fill="url(#mascotBody)"
              stroke="#334155"
              strokeWidth="2.5"
            />

            {/* Glass Reflection Ring */}
            <rect
              x="27"
              y="32"
              width="86"
              height="81"
              rx="40"
              fill="none"
              stroke="url(#glassShine)"
              strokeWidth="1.5"
            />

            {/* Left Antenna / Ear */}
            <g className="transition-transform duration-300">
              <rect x="22" y="16" width="10" height="20" rx="5" fill="url(#accentBlue)" />
              <circle cx="27" cy="18" r="3" fill="#ffffff" />
            </g>

            {/* Right Antenna / Ear */}
            <g className="transition-transform duration-300">
              <rect x="108" y="16" width="10" height="20" rx="5" fill="url(#accentBlue)" />
              <circle cx="113" cy="18" r="3" fill="#ffffff" />
            </g>

            {/* Inner Visor / Faceplate */}
            <rect
              x="36"
              y="44"
              width="68"
              height="48"
              rx="22"
              fill="url(#mascotVisor)"
              stroke={isCoveringEyes ? '#60a5fa' : '#38bdf8'}
              strokeWidth="2"
              className="transition-colors duration-300"
            />

            {/* Visor Glare Line */}
            <path
              d="M 44 48 Q 70 46 96 48"
              fill="none"
              stroke="url(#glassShine)"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* EYES LAYER */}
            {!isCoveringEyes && (
              <g className="transition-all duration-300">
                {/* Left Eye White */}
                <circle
                  cx="54"
                  cy="66"
                  r="9"
                  fill="#ffffff"
                  className="transition-all duration-300"
                />
                {/* Left Eye Pupil (Tracks Cursor) */}
                <circle
                  cx={leftPupilX}
                  cy={leftPupilY}
                  r="5"
                  fill="#2563eb"
                  className="transition-all duration-75 ease-out"
                />
                <circle cx={leftShineX} cy={leftShineY} r="2" fill="#ffffff" />

                {/* Right Eye White */}
                <circle
                  cx="86"
                  cy="66"
                  r="9"
                  fill="#ffffff"
                  className="transition-all duration-300"
                />
                {/* Right Eye Pupil (Tracks Cursor) */}
                <circle
                  cx={rightPupilX}
                  cy={rightPupilY}
                  r="5"
                  fill="#2563eb"
                  className="transition-all duration-75 ease-out"
                />
                <circle cx={rightShineX} cy={rightShineY} r="2" fill="#ffffff" />
              </g>
            )}

            {/* CLOSED EYES LAYER (When Password Hidden & Password Focused) */}
            {isCoveringEyes && (
              <g className="transition-all duration-300">
                {/* Left Closed Eye Slot */}
                <path
                  d="M 46 66 Q 54 72 62 66"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Right Closed Eye Slot */}
                <path
                  d="M 78 66 Q 86 72 94 66"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </g>
            )}

            {/* Mouth Curve */}
            <path
              d={
                isPeeking
                  ? 'M 62 78 Q 70 85 78 78'
                  : isCoveringEyes
                  ? 'M 64 80 Q 70 77 76 80'
                  : 'M 62 77 Q 70 83 78 77'
              }
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* HANDS / PAWS LAYER */}
            {/* Left Paw */}
            <g
              className={`transition-all duration-500 ease-out origin-[40px_105px] ${
                isCoveringEyes
                  ? 'translate-y-[-32px] translate-x-[12px] rotate-[22deg]'
                  : isPeeking
                  ? 'translate-y-[-26px] translate-x-[2px] rotate-[10deg]'
                  : 'translate-y-[0px] translate-x-[0px]'
              }`}
            >
              <circle cx="42" cy="104" r="13" fill="url(#pawGradient)" stroke="#020617" strokeWidth="2.5" />
              <circle cx="42" cy="104" r="7" fill="#ffffff" fillOpacity="0.9" />
            </g>

            {/* Right Paw */}
            <g
              className={`transition-all duration-500 ease-out origin-[100px_105px] ${
                isCoveringEyes
                  ? 'translate-y-[-32px] translate-x-[-12px] rotate-[-22deg]'
                  : isPeeking
                  ? 'translate-y-[-26px] translate-x-[-2px] rotate-[-10deg]'
                  : 'translate-y-[0px] translate-x-[0px]'
              }`}
            >
              <circle cx="98" cy="104" r="13" fill="url(#pawGradient)" stroke="#020617" strokeWidth="2.5" />
              <circle cx="98" cy="104" r="7" fill="#ffffff" fillOpacity="0.9" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}


