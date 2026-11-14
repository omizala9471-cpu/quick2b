import React from 'react';

export default function Quick2BLogo({ size = 36, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
    >
      <defs>
        {/* Obsidian Titanium Background */}
        <linearGradient id="q2b-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#090d16" />
          <stop offset="0.6" stopColor="#0f172a" />
          <stop offset="1" stopColor="#1e293b" />
        </linearGradient>

        {/* Primary Sapphire Stream (Books Ledger) */}
        <linearGradient id="q2b-stream-1" x1="10" y1="12" x2="36" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="0.55" stopColor="#2563eb" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>

        {/* Secondary Electric Indigo Stream (GSTR-2B Statutory Stream) */}
        <linearGradient id="q2b-stream-2" x1="38" y1="14" x2="14" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a78bfa" />
          <stop offset="0.5" stopColor="#6366f1" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>

        {/* Central Core Parity Spark */}
        <linearGradient id="q2b-spark" x1="20" y1="20" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#67e8f9" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>

        {/* Soft Ambient Core Glow */}
        <radialGradient id="q2b-glow" cx="24" cy="24" r="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" stopOpacity="0.35" />
          <stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>

        {/* Glass Edge Sheen */}
        <linearGradient id="q2b-border" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#475569" stopOpacity="0.8" />
          <stop offset="0.5" stopColor="#334155" stopOpacity="0.4" />
          <stop offset="1" stopColor="#1e293b" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Titanium Container Plate */}
      <rect 
        x="1.5" 
        y="1.5" 
        width="45" 
        height="45" 
        rx="13" 
        fill="url(#q2b-bg)" 
        stroke="url(#q2b-border)" 
        strokeWidth="1.5" 
      />

      {/* Ambient Internal Glow */}
      <circle cx="24" cy="24" r="14" fill="url(#q2b-glow)" />

      {/* Interlocking Dual-Stream Reconciliation Monogram ('Q' + '2B' Synergy) */}
      
      {/* Stream 1: Top-Left to Bottom Arc (Books Flow) */}
      <path 
        d="M13 22C13 16.4772 17.4772 12 23 12C28.5228 12 33 16.4772 33 22C33 24.2 32.2 26.2 31 27.8L22 36H35" 
        stroke="url(#q2b-stream-1)" 
        strokeWidth="3.2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* Stream 2: Interlocking Counter-Loop & Dynamic Q Tail (2B Parity Stream) */}
      <path 
        d="M35 24C35 29.5228 30.5228 34 25 34C20.8 34 17.2 31.4 15.6 27.8M31 31L37 37" 
        stroke="url(#q2b-stream-2)" 
        strokeWidth="3.2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* Bit-Perfect Central Parity Star (AI Matching Engine) */}
      <path 
        d="M24 19.5L25.2 22.8L28.5 24L25.2 25.2L24 28.5L22.8 25.2L19.5 24L22.8 22.8Z" 
        fill="url(#q2b-spark)" 
      />

      {/* Micro Status Dot */}
      <circle cx="34" cy="14" r="2" fill="#38bdf8" />
    </svg>
  );
}
