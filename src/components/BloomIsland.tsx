import { useMemo } from "react";

interface BloomIslandProps {
  totalPoints: number;
  completedTasks: number;
  pomodoros: number;
  streakDays: number;
  academicXp?: number;
}

// ---- config estático (fuera del componente: no se recalcula en cada render) ----
const PARTICLES = [
  { top: "8%", left: "50%", delay: "0s", size: 6 },
  { top: "18%", left: "20%", delay: "0.6s", size: 4 },
  { top: "16%", left: "80%", delay: "1.1s", size: 5 },
  { top: "50%", left: "6%", delay: "0.3s", size: 4 },
  { top: "52%", left: "94%", delay: "0.9s", size: 4 },
  { top: "84%", left: "28%", delay: "1.4s", size: 5 },
  { top: "86%", left: "72%", delay: "0.5s", size: 6 },
];

const HUD_ITEMS = [
  { key: "inventory", icon: "🎒", label: "Inventory" },
  { key: "map", icon: "🗺️", label: "Map" },
  { key: "action", icon: "⚔️", label: "Action", primary: true },
  { key: "skills", icon: "🎓", label: "Skills" },
];

function xpForLevel(level: number) {
  // curva simple de XP acumulada requerida por nivel
  return Math.round(350 * level * (level + 1) * 0.5);
}

export function BloomIsland({
  totalPoints,
  completedTasks,
  pomodoros,
  streakDays,
  academicXp = 0,
}: BloomIslandProps) {
  const islandXp = totalPoints + academicXp;

  const { level, percentToNext } = useMemo(() => {
    let lvl = 1;
    while (islandXp >= xpForLevel(lvl + 1)) lvl += 1;
    const base = xpForLevel(lvl);
    const next = xpForLevel(lvl + 1);
    const pct = Math.max(
      0,
      Math.min(100, ((islandXp - base) / (next - base)) * 100)
    );
    return { level: lvl, percentToNext: pct };
  }, [islandXp]);

  // radio/circunferencia del medidor (SVG, se anima solo strokeDashoffset -> compositor-friendly)
  const RADIUS = 84;
  const CIRC = 2 * Math.PI * RADIUS;
  const dashOffset = CIRC - (percentToNext / 100) * CIRC;

  const quests = useMemo(
    () => [
      { label: "Misiones completadas", value: completedTasks, icon: "📖" },
      { label: "Sesiones de enfoque", value: pomodoros, icon: "🤝" },
      { label: "Racha activa", value: `${streakDays}d`, icon: "🗓️" },
    ],
    [completedTasks, pomodoros, streakDays]
  );

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#0B2A43]/20 bg-gradient-to-b from-[#FFD9A0] via-[#FFB199] to-[#F7C9B6] p-4 shadow-2xl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Inter:wght@500;600;700&display=swap');

        .bi-font-display { font-family: 'Baloo 2', ui-rounded, system-ui, sans-serif; }
        .bi-font-body { font-family: 'Inter', system-ui, sans-serif; }

        @keyframes bi-drift {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.55; }
          50% { transform: translate3d(0, -10px, 0) scale(1.25); opacity: 1; }
        }
        @keyframes bi-pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.35; }
          50% { transform: scale(1.06); opacity: 0.6; }
        }
        @keyframes bi-float-soft {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -6px, 0); }
        }
        @keyframes bi-sway {
          0%, 100% { transform: rotate(-1.5deg); }
          50% { transform: rotate(1.5deg); }
        }
        @keyframes bi-walk {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -3px, 0); }
        }

        .bi-particle { will-change: transform, opacity; animation: bi-drift 2.6s ease-in-out infinite; }
        .bi-ring-pulse { will-change: transform, opacity; animation: bi-pulse-ring 3.2s ease-in-out infinite; }
        .bi-float { will-change: transform; animation: bi-float-soft 3.4s ease-in-out infinite; }
        .bi-sway { will-change: transform; transform-origin: 50% 100%; animation: bi-sway 4.5s ease-in-out infinite; }
        .bi-walk { will-change: transform; animation: bi-walk 0.9s ease-in-out infinite; }
        .bi-xp-fill { transition: stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1); }

        @media (prefers-reduced-motion: reduce) {
          .bi-particle, .bi-ring-pulse, .bi-float, .bi-sway, .bi-walk {
            animation: none !important;
          }
          .bi-xp-fill { transition: none !important; }
        }
      `}</style>

      {/* halo cielo de fondo */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,0.35),transparent_60%)]" />

      {/* ---- header: avatar con halo + nivel ---- */}
      <div className="relative z-10 mb-3 flex items-start justify-between bi-font-body">
        <div className="flex items-center gap-3">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#0B2A43] to-[#123047] shadow-[0_0_0_3px_rgba(46,196,182,0.55),0_0_18px_rgba(46,196,182,0.6)]">
            <span className="text-2xl">🧑‍🎓</span>
          </div>
          <div>
            <p className="bi-font-display text-sm font-bold leading-none text-[#123047]">
              Mateo 5:4
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#123047]/60">
              Isla Bloom
            </p>
          </div>
        </div>
        <span className="rounded-full border border-white/50 bg-[#0B2A43]/85 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#FFC24B] shadow-lg">
          Level {level}
        </span>
      </div>

      {/* ---- medidor de XP: elemento firma ---- */}
      <div className="relative z-10 mx-auto mb-4 flex h-56 w-56 items-center justify-center">
        {/* halo pulsante detrás del anillo */}
        <div className="bi-ring-pulse absolute h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(255,194,75,0.55),transparent_70%)]" />

        {/* partículas mágicas */}
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="bi-particle absolute rounded-full bg-[#FFE9B0] shadow-[0_0_6px_2px_rgba(255,233,176,0.9)]"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
            }}
          />
        ))}

        <svg
          viewBox="0 0 200 200"
          className="relative z-10 h-44 w-44 -rotate-90"
        >
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke="rgba(11,42,67,0.15)"
            strokeWidth="14"
          />
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke="url(#bi-xp-gradient)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
            className="bi-xp-fill"
          />
          <defs>
            <linearGradient id="bi-xp-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2EC4B6" />
              <stop offset="55%" stopColor="#4FD3E8" />
              <stop offset="100%" stopColor="#FF9F5A" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute z-10 flex flex-col items-center bi-font-display">
          <span className="text-4xl font-extrabold text-[#0B2A43] drop-shadow-sm">
            {percentToNext.toFixed(1)}%
          </span>
          <span className="mt-1 bi-font-body text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B2A43]/70">
            Semester XP Meter
          </span>
        </div>
      </div>

      {/* ---- pergamino de misiones ---- */}
      <div className="bi-float relative z-10 mx-auto mb-4 w-full max-w-xs rounded-2xl border border-[#0B2A43]/10 bg-[#F6E9CE] px-4 py-3 shadow-lg">
        <div className="absolute -top-2 left-1/2 h-2 w-16 -translate-x-1/2 rounded-full bg-[#D9C293]" />
        <p className="bi-font-display mb-2 text-center text-xs font-bold uppercase tracking-[0.16em] text-[#7A5C2E]">
          Pergamino de misiones
        </p>
        <ul className="space-y-1.5 bi-font-body text-sm text-[#4A3A1E]">
          {quests.map((q) => (
            <li key={q.label} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span aria-hidden>{q.icon}</span>
                {q.label}
              </span>
              <span className="font-bold text-[#7A5C2E]">{q.value}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ---- mundo/isla en miniatura ---- */}
      <div className="relative z-10 mb-4 h-20 overflow-hidden rounded-2xl bg-gradient-to-b from-[#8FE3D9] to-[#3FB6A8]">
        <div className="bi-sway absolute bottom-1 left-[15%] text-2xl">🌴</div>
        <div className="bi-sway absolute bottom-1 left-[45%] text-xl" style={{ animationDelay: "0.6s" }}>🌴</div>
        <div className="bi-sway absolute bottom-1 left-[75%] text-2xl" style={{ animationDelay: "1.1s" }}>🌴</div>
        <div className="bi-walk absolute bottom-1 left-[55%] text-2xl">🧍</div>
      </div>

      {/* ---- barra HUD inferior ---- */}
      <div className="relative z-10 flex items-end justify-between rounded-full bg-[#0B2A43] px-3 py-2 shadow-xl">
        {HUD_ITEMS.map((item) =>
          item.primary ? (
            <button
              key={item.key}
              type="button"
              className="relative -mt-6 flex h-16 w-16 flex-col items-center justify-center rounded-full bg-gradient-to-b from-[#4FD3E8] to-[#2EC4B6] shadow-[0_0_0_4px_rgba(11,42,67,0.9),0_0_18px_rgba(79,211,232,0.6)]"
            >
              <span className="text-2xl">{item.icon}</span>
            </button>
          ) : (
            <button
              key={item.key}
              type="button"
              className="flex flex-col items-center gap-1 px-2 py-1 text-[#F6E9CE]/85 transition-colors hover:text-white"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="bi-font-body text-[9px] font-semibold uppercase tracking-wide">
                {item.label}
              </span>
            </button>
          )
        )}
      </div>
    </section>
  );
}
