import React, { useState } from 'react';
import type { UnlockedElement, IslandTheme } from './useIslandProgression';

export type ThemeConfig = {
  sky: [string, string];
  grass: [string, string];
  accent: string;
};

const THEME_CONFIGS: Record<IslandTheme, ThemeConfig> = {
  spring:   { sky: ['#c8e6ff', '#e8d5f0'], grass: ['#7bc67e', '#5a9e5e'], accent: '#ff9eb5' },
  midnight: { sky: ['#1a1a3e', '#2d1b4e'], grass: ['#2d5a3d', '#1a3d2a'], accent: '#a78bfa' },
  autumn:   { sky: ['#ffd9a0', '#ffb347'], grass: ['#8b6914', '#a07c1a'], accent: '#ff6b35' },
  tropical: { sky: ['#00d2ff', '#3a7bd5'], grass: ['#00b09b', '#96c93d'], accent: '#ffce00' },
};

interface IslandCanvasProps {
  stage: 1 | 2 | 3 | 4 | 5;
  unlockedElements: UnlockedElement[];
  newlyUnlockedIds?: string[];
  theme?: IslandTheme;
  onElementClick?: (element: UnlockedElement) => void;
}

function CloudShape({ x, y, scale = 1, delay = '0s', opacity = 0.85 }: {
  x: number; y: number; scale?: number; delay?: string; opacity?: number;
}) {
  return (
    <g
      transform={`translate(${x}, ${y}) scale(${scale})`}
      style={{ animation: `cloud-drift 8s ease-in-out ${delay} infinite alternate`, opacity }}
    >
      <ellipse cx="30" cy="20" rx="30" ry="18" fill="white" />
      <ellipse cx="55" cy="16" rx="22" ry="16" fill="white" />
      <ellipse cx="80" cy="20" rx="28" ry="17" fill="white" />
      <ellipse cx="55" cy="24" rx="40" ry="14" fill="white" />
    </g>
  );
}

function Sun({ theme }: { theme: IslandTheme }) {
  const sunColor = theme === 'midnight' ? '#6366f1' : theme === 'autumn' ? '#f97316' : '#fde047';
  const glowColor = theme === 'midnight' ? 'rgba(99,102,241,0.4)' : theme === 'autumn' ? 'rgba(249,115,22,0.4)' : 'rgba(253,224,71,0.5)';
  return (
    <g style={{ animation: 'glow-pulse 2s ease-in-out infinite' }}>
      {/* Rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
        <line
          key={angle}
          x1={690 + Math.cos(angle * Math.PI / 180) * 28}
          y1={70 + Math.sin(angle * Math.PI / 180) * 28}
          x2={690 + Math.cos(angle * Math.PI / 180) * 42}
          y2={70 + Math.sin(angle * Math.PI / 180) * 42}
          stroke={sunColor}
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.7"
        />
      ))}
      <circle cx="690" cy="70" r="26" fill={sunColor} filter={`drop-shadow(0 0 12px ${glowColor})`} />
      <circle cx="690" cy="70" r="20" fill={sunColor} opacity="0.9" />
    </g>
  );
}

function WaterLayer() {
  return (
    <g>
      {/* Water body */}
      <ellipse cx="400" cy="420" rx="360" ry="55" fill="#5bc8f5" opacity="0.35" />
      <ellipse cx="400" cy="430" rx="340" ry="40" fill="#38bdf8" opacity="0.25" />
      {/* Wave paths */}
      <path
        d="M60,415 Q130,400 200,415 Q270,430 340,415 Q410,400 480,415 Q550,430 620,415 Q690,400 740,415"
        stroke="#7dd3fc" strokeWidth="2.5" fill="none" opacity="0.7"
        style={{ animation: 'wave-motion 3s ease-in-out infinite' }}
      />
      <path
        d="M80,425 Q150,412 220,425 Q290,438 360,425 Q430,412 500,425 Q570,438 640,425 Q700,412 730,425"
        stroke="#bae6fd" strokeWidth="2" fill="none" opacity="0.5"
        style={{ animation: 'wave-motion 4s ease-in-out 1s infinite' }}
      />
    </g>
  );
}

function IslandBase({ grass }: { grass: [string, string] }) {
  return (
    <g>
      {/* Shadow */}
      <ellipse cx="400" cy="390" rx="280" ry="28" fill="rgba(0,0,0,0.12)" />
      {/* Brown earth base */}
      <ellipse cx="400" cy="360" rx="265" ry="75" fill="#8B6914" />
      <ellipse cx="400" cy="345" rx="260" ry="65" fill="#A0892A" />
      {/* Grass top layer */}
      <ellipse cx="400" cy="315" rx="260" ry="65" fill={grass[0]} />
      <ellipse cx="400" cy="305" rx="255" ry="58" fill={grass[1]} />
      {/* Dirt edge highlight */}
      <path
        d="M140,325 Q200,285 270,275 Q340,265 400,268 Q460,265 530,275 Q600,285 660,325"
        fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3"
      />
    </g>
  );
}

// Stage-specific vegetation layers
function StageVegetation({ stage, grass, accent }: { stage: number; grass: [string, string]; accent: string }) {
  const darkGrass = grass[1];
  const lightGrass = grass[0];

  const elements: React.ReactNode[] = [];

  // Stage 1: bare island with sprout (handled by elements)
  if (stage >= 1) {
    // Bare grass patches
    elements.push(
      <g key="grass-patches">
        <ellipse cx="280" cy="298" rx="25" ry="8" fill={darkGrass} opacity="0.6" />
        <ellipse cx="520" cy="295" rx="20" ry="6" fill={darkGrass} opacity="0.5" />
        <ellipse cx="400" cy="290" rx="18" ry="5" fill={lightGrass} opacity="0.4" />
      </g>
    );
  }

  if (stage >= 2) {
    // Small plants / leaf groups
    elements.push(
      <g key="stage2-plants">
        {/* Left plant cluster */}
        <ellipse cx="310" cy="285" rx="12" ry="8" fill="#6ab04c" opacity="0.9" />
        <ellipse cx="322" cy="280" rx="10" ry="7" fill="#78c758" opacity="0.9" />
        {/* Right plant cluster */}
        <ellipse cx="490" cy="282" rx="11" ry="7" fill="#6ab04c" opacity="0.9" />
        <ellipse cx="478" cy="279" rx="9" ry="6" fill="#78c758" opacity="0.85" />
        {/* Center ground detail */}
        <ellipse cx="400" cy="288" rx="8" ry="5" fill="#78c758" opacity="0.7" />
      </g>
    );
  }

  if (stage >= 3) {
    // Lush greenery, flowers spread
    elements.push(
      <g key="stage3-lush">
        <ellipse cx="290" cy="278" rx="20" ry="14" fill="#5cb85c" opacity="0.85" />
        <ellipse cx="505" cy="275" rx="18" ry="12" fill="#5cb85c" opacity="0.85" />
        <ellipse cx="360" cy="276" rx="15" ry="10" fill="#6dba45" opacity="0.8" />
        <ellipse cx="440" cy="274" rx="14" ry="9" fill="#6dba45" opacity="0.8" />
        {/* Small pond */}
        <ellipse cx="400" cy="300" rx="32" ry="12" fill="#5bc8f5" opacity="0.45" />
        <ellipse cx="400" cy="298" rx="28" ry="9" fill="#7dd3fc" opacity="0.35" />
      </g>
    );
  }

  if (stage >= 4) {
    // Large trees silhouettes, bridge details
    elements.push(
      <g key="stage4-expansion">
        <ellipse cx="250" cy="268" rx="30" ry="20" fill="#4a9c4a" opacity="0.9" />
        <ellipse cx="550" cy="265" rx="28" ry="18" fill="#4a9c4a" opacity="0.9" />
        {/* Pond expanded */}
        <ellipse cx="405" cy="302" rx="42" ry="16" fill="#38bdf8" opacity="0.4" />
        {/* Sparkle particles */}
        {[0, 1, 2, 3, 4].map(i => (
          <circle
            key={i}
            cx={360 + i * 22}
            cy={260 + (i % 2) * 12}
            r="2.5"
            fill={accent}
            opacity="0.8"
            style={{ animation: `sparkle-float ${2 + i * 0.4}s ease-out ${i * 0.5}s infinite` }}
          />
        ))}
      </g>
    );
  }

  if (stage >= 5) {
    // Paradise: lush, magical, waterfalls glow
    elements.push(
      <g key="stage5-paradise">
        {/* Magical aura around island */}
        <ellipse cx="400" cy="305" rx="262" ry="68" fill="none"
          stroke={accent} strokeWidth="1.5" opacity="0.25"
          strokeDasharray="8 4"
          style={{ animation: 'glow-pulse 3s ease-in-out infinite' }}
        />
        {/* Extra sparkles */}
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <circle
            key={i}
            cx={200 + i * 70}
            cy={255 + (i % 3) * 10}
            r="3"
            fill={accent}
            opacity="0.9"
            style={{ animation: `sparkle-float ${2.5 + i * 0.3}s ease-out ${i * 0.3}s infinite` }}
          />
        ))}
        {/* Ground glow */}
        <ellipse cx="400" cy="308" rx="200" ry="40" fill={accent} opacity="0.06" />
      </g>
    );
  }

  return <g>{elements}</g>;
}

// Render individual island elements on canvas
function CanvasElement({
  el,
  isNew,
  accent,
  onClick,
}: {
  el: UnlockedElement;
  isNew: boolean;
  accent: string;
  onClick: () => void;
}) {
  const style: React.CSSProperties = isNew
    ? { animation: 'bloom-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards', opacity: 0, transformOrigin: `${el.x}px ${el.y}px` }
    : {};

  const renderEmoji = (emoji: string, size = 22) => (
    <text
      x={el.x}
      y={el.y}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={size}
      style={{ ...style, cursor: 'pointer', userSelect: 'none' }}
      onClick={onClick}
    >
      {emoji}
    </text>
  );

  switch (el.type) {
    case 'sprout':
      return (
        <g style={style} onClick={onClick} cursor="pointer">
          <line x1={el.x} y1={el.y + 10} x2={el.x} y2={el.y - 8} stroke="#5cb85c" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx={el.x - 6} cy={el.y - 2} rx="7" ry="5" fill="#78c758" transform={`rotate(-20, ${el.x - 6}, ${el.y - 2})`} />
          <ellipse cx={el.x + 6} cy={el.y - 5} rx="7" ry="5" fill="#6ab04c" transform={`rotate(20, ${el.x + 6}, ${el.y - 5})`} />
          {isNew && <circle cx={el.x} cy={el.y} r="14" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.6" style={{ animation: 'glow-pulse 1.5s ease-in-out infinite' }} />}
        </g>
      );
    case 'flower':
      return renderEmoji('🌸', 20);
    case 'rock':
      return (
        <g style={style} onClick={onClick} cursor="pointer">
          <ellipse cx={el.x} cy={el.y + 4} rx="12" ry="7" fill="#888" />
          <ellipse cx={el.x} cy={el.y} rx="11" ry="6" fill="#aaa" />
          <ellipse cx={el.x - 3} cy={el.y - 2} rx="5" ry="3" fill="#bbb" opacity="0.6" />
        </g>
      );
    case 'bush':
      return (
        <g style={style} onClick={onClick} cursor="pointer">
          <ellipse cx={el.x - 8} cy={el.y + 2} rx="10" ry="8" fill="#4a9c3a" />
          <ellipse cx={el.x + 8} cy={el.y + 2} rx="10" ry="8" fill="#4a9c3a" />
          <ellipse cx={el.x} cy={el.y - 2} rx="12" ry="9" fill="#5cb85c" />
        </g>
      );
    case 'mushroom':
      return renderEmoji('🍄', 20);
    case 'tree':
      return (
        <g style={style} onClick={onClick} cursor="pointer">
          <rect x={el.x - 4} y={el.y + 4} width="8" height="20" rx="2" fill="#8B6914" />
          <ellipse cx={el.x} cy={el.y - 8} rx="22" ry="18" fill="#2d8a2d" />
          <ellipse cx={el.x} cy={el.y - 12} rx="18" ry="14" fill="#3aa83a" />
          <ellipse cx={el.x - 6} cy={el.y - 15} rx="10" ry="8" fill="#4dc94d" opacity="0.8" />
          {isNew && <circle cx={el.x} cy={el.y} r="26" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.5" style={{ animation: 'glow-pulse 1.5s ease-in-out infinite' }} />}
        </g>
      );
    case 'butterfly':
      return (
        <g style={{ ...style, animation: isNew ? `${style.animation}` : 'butterfly-fly 4s ease-in-out infinite' }} onClick={onClick} cursor="pointer">
          <text x={el.x} y={el.y} textAnchor="middle" dominantBaseline="middle" fontSize="18" style={{ userSelect: 'none' }}>🦋</text>
        </g>
      );
    case 'waterfall':
      return renderEmoji('💧', 22);
    case 'cabin':
      return renderEmoji('🏠', 24);
    case 'bridge':
      return (
        <g style={style} onClick={onClick} cursor="pointer">
          {/* Bridge arch */}
          <path d={`M${el.x - 28},${el.y + 6} Q${el.x},${el.y - 14} ${el.x + 28},${el.y + 6}`}
            stroke="#8B6914" strokeWidth="5" fill="none" />
          {/* Planks */}
          {[-20, -10, 0, 10, 20].map(dx => (
            <rect key={dx} x={el.x + dx - 4} y={el.y + 2} width="8" height="6" rx="1" fill="#a07c1a" />
          ))}
        </g>
      );
    case 'crystal':
      return renderEmoji('💎', 22);
    case 'statue':
      return renderEmoji('🗿', 24);
    case 'arch':
      return renderEmoji('⛩️', 26);
    case 'sanctuary':
      return renderEmoji('🏛️', 28);
    default:
      return renderEmoji('✨', 18);
  }
}

export function IslandCanvas({
  stage,
  unlockedElements,
  newlyUnlockedIds = [],
  theme = 'spring',
  onElementClick,
}: IslandCanvasProps) {
  const cfg = THEME_CONFIGS[theme];
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '1.25rem' }}
      role="img"
      aria-label={`Isla en Etapa ${stage}`}
    >
      <defs>
        <linearGradient id={`sky-grad-${theme}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={cfg.sky[0]} />
          <stop offset="100%" stopColor={cfg.sky[1]} />
        </linearGradient>
        <radialGradient id="island-shadow" cx="50%" cy="70%" r="50%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.2)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      {/* Sky background */}
      <rect width="800" height="500" fill={`url(#sky-grad-${theme})`} />

      {/* Sun */}
      <Sun theme={theme} />

      {/* Clouds */}
      <CloudShape x={50}  y={40}  scale={1.1} delay="0s"   opacity={0.9} />
      <CloudShape x={250} y={25}  scale={0.8} delay="2s"   opacity={0.7} />
      <CloudShape x={500} y={50}  scale={1.0} delay="4s"   opacity={0.8} />
      <CloudShape x={600} y={30}  scale={0.7} delay="1.5s" opacity={0.65} />

      {/* Stars for midnight theme */}
      {theme === 'midnight' && (
        <g opacity="0.8">
          {[
            [100,60],[180,35],[300,45],[420,20],[520,55],[620,40],[720,25],
            [150,90],[350,80],[580,75],[700,95],[50,110],[680,70],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={1 + (i % 2)} fill="white"
              style={{ animation: `glow-pulse ${2 + (i % 3)}s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
        </g>
      )}

      {/* Water */}
      <WaterLayer />

      {/* Island base */}
      <IslandBase grass={cfg.grass} />

      {/* Stage vegetation */}
      <StageVegetation stage={stage} grass={cfg.grass} accent={cfg.accent} />

      {/* Unlocked elements */}
      {unlockedElements.map(el => (
        <g
          key={el.id}
          onMouseEnter={() => setHoveredId(el.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <CanvasElement
            el={el}
            isNew={newlyUnlockedIds.includes(el.id)}
            accent={cfg.accent}
            onClick={() => onElementClick?.(el)}
          />
          {/* Hover glow ring */}
          {hoveredId === el.id && (
            <circle cx={el.x} cy={el.y} r="18" fill="none"
              stroke={cfg.accent} strokeWidth="2" opacity="0.7" />
          )}
        </g>
      ))}

      {/* Stage label */}
      <g>
        <rect x="16" y="14" width="160" height="28" rx="14" fill="rgba(0,0,0,0.22)" />
        <text x="96" y="32" textAnchor="middle" dominantBaseline="middle"
          fontSize="12" fill="white" fontWeight="600" fontFamily="system-ui, sans-serif">
          Etapa {stage} • {['Semilla','Primeros Brotes','Jardín Floreciente','Isla en Expansión','Paraíso Floreciente'][stage - 1]}
        </text>
      </g>
    </svg>
  );
}
