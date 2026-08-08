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
  { top: "20%", left: "34%", delay: "0s", size: 5 },
  { top: "12%", left: "20%", delay: "0.6s", size: 4 },
  { top: "16%", left: "48%", delay: "1.1s", size: 5 },
  { top: "42%", left: "10%", delay: "0.3s", size: 4 },
  { top: "44%", left: "50%", delay: "0.9s", size: 4 },
  { top: "58%", left: "18%", delay: "1.4s", size: 5 },
  { top: "56%", left: "42%", delay: "0.5s", size: 4 },
];

const HUD_ITEMS = [
  { key: "inventory", icon: "🎒", label: "Inventory" },
  { key: "map", icon: "🗺️", label: "Map" },
  { key: "action", icon: "⚔️", label: "Action", primary: true },
  { key: "skills", icon: "🎓", label: "Skills" },
];

function xpForLevel(level: number) {
  // XP acumulado requerido para *alcanzar* este nivel (nivel 1 = 0 XP,
  // así el progreso se ve desde el primer punto en vez de arrancar en 0.0%)
  return Math.round(350 * (level - 1) * level * 0.5);
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

  const RADIUS = 84;
  const CIRC = 2 * Math.PI * RADIUS;
  const dashOffset = CIRC - (percentToNext / 100) * CIRC;

  const quests = useMemo(
    () => [
      { label: "Misiones", value: completedTasks, icon: "📖" },
      { label: "Enfoque", value: pomodoros, icon: "🤝" },
      { label: "Racha", value: `${streakDays}d`, icon: "🗓️" },
    ],
    [completedTasks, pomodoros, streakDays]
  );

  return (
    <div className="mx-auto w-full max-w-sm">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Inter:wght@500;600;700&display=swap');

        .bi-font-display { font-family: 'Baloo 2', ui-rounded, system-ui, sans-serif; }
        .bi-font-body { font-family: 'Inter', system-ui, sans-serif; }

        @keyframes bi-drift {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.5; }
          50% { transform: translate3d(0, -9px, 0) scale(1.3); opacity: 1; }
        }
        @keyframes bi-pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.35; }
          50% { transform: scale(1.07); opacity: 0.62; }
        }
        @keyframes bi-float-soft {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(-2deg); }
          50% { transform: translate3d(0, -7px, 0) rotate(-1deg); }
        }
        @keyframes bi-sway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes bi-walk {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -3px, 0); }
        }
        @keyframes bi-glow-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.85; }
        }

        .bi-particle { will-change: transform, opacity; animation: bi-drift 2.6s ease-in-out infinite; }
        .bi-ring-pulse { will-change: transform, opacity; animation: bi-pulse-ring 3.2s ease-in-out infinite; }
        .bi-scroll-float { will-change: transform; animation: bi-float-soft 4s ease-in-out infinite; }
        .bi-sway { will-change: transform; transform-origin: 50% 100%; animation: bi-sway 4.5s ease-in-out infinite; }
        .bi-walk { will-change: transform; animation: bi-walk 0.9s ease-in-out infinite; }
        .bi-avatar-glow { will-change: opacity; animation: bi-glow-pulse 3s ease-in-out infinite; }
        .bi-xp-fill { transition: stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1); }

        @media (prefers-reduced-motion: reduce) {
          .bi-particle, .bi-ring-pulse, .bi-scroll-float, .bi-sway, .bi-walk, .bi-avatar-glow {
            animation: none !important;
          }
          .bi-xp-fill { transition: none !important; }
        }
      `}</style>

      {/* ---- escena única: cielo -> mar -> arena, todo dentro de un solo lienzo ---- */}
      <div className="relative aspect-[9/17.5] w-full overflow-hidden rounded-[38px] border-[6px] border-[#111] bg-[#111] shadow-2xl">
        {/* notch */}
        <div className="absolute left-1/2 top-2 z-30 h-4 w-20 -translate-x-1/2 rounded-full bg-black/80" />

        {/* fondo: cielo atardecer */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F9C9DE] via-[#FDBE9C] to-[#FDCB8B]" />
        {/* halo solar suave */}
        <div className="absolute left-1/2 top-[6%] h-40 w-40 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,241,214,0.85),transparent_70%)]" />
        {/* mar */}
        <div className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-b from-[#5FD0C9] via-[#2FAFB0] to-[#1D7E88]" />
        {/* arena */}
        <div className="absolute inset-x-0 bottom-0 h-[18%] bg-gradient-to-b from-[#F3D9A8] to-[#E7C288]" />
        {/* espuma de ola */}
        <div className="absolute inset-x-0 bottom-[18%] h-3 bg-white/70 blur-[2px]" />

        {/* elementos del mundo sobre la arena */}
        <div className="bi-sway absolute bottom-[9%] left-[10%] text-2xl">🌴</div>
        <div className="bi-sway absolute bottom-[10%] right-[10%] text-xl" style={{ animationDelay: "0.7s" }}>🌴</div>
        <div className="absolute bottom-[6%] right-[16%] text-lg opacity-90">🪨</div>
        <div className="absolute bottom-[5%] left-[20%] text-base opacity-90">🌿</div>

        {/* ---- avatar + nombre (arriba a la izquierda) ---- */}
        <div className="absolute left-[6%] top-[6%] z-20 flex flex-col items-start bi-font-body">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#123047] to-[#0B2A43]">
            <div className="bi-avatar-glow absolute -inset-1 rounded-full bg-[#4FD3E8]/60 blur-md" />
            <span className="relative text-2xl">🧑‍🎓</span>
          </div>
          <p className="bi-font-display mt-1 text-sm font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
            Mateo 5:4
          </p>
        </div>

        {/* ---- medidor de XP: elemento firma, mitad izquierda ---- */}
        <div className="absolute left-[4%] top-[24%] z-10 flex aspect-square w-[54%] items-center justify-center">
          <div className="bi-ring-pulse absolute h-[85%] w-[85%] rounded-full bg-[radial-gradient(circle,rgba(255,194,75,0.55),transparent_70%)]" />

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

          <svg viewBox="0 0 200 200" className="relative z-10 h-[78%] w-[78%] -rotate-90">
            <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="rgba(11,42,67,0.18)" strokeWidth="14" />
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
            <span className="text-3xl font-extrabold text-[#0B2A43] drop-shadow-sm">
              {percentToNext.toFixed(1)}%
            </span>
            <span className="mt-1 bi-font-body text-[9px] font-bold uppercase tracking-[0.18em] text-[#0B2A43]/75">
              Semester XP
            </span>
          </div>
        </div>

        {/* ---- level, flotando sobre el borde superior-derecho del anillo ---- */}
        <span className="absolute left-[54%] top-[30%] z-20 rounded-full border border-white/50 bg-[#0B2A43]/90 px-3 py-1 bi-font-body text-[11px] font-bold uppercase tracking-wide text-[#FFC24B] shadow-lg">
          Level {level}
        </span>

        {/* ---- pergamino de misiones: listón vertical flotante a la derecha ---- */}
        <div className="bi-scroll-float absolute right-[4%] top-[16%] z-10 w-[34%] rounded-xl border border-[#0B2A43]/10 bg-[#F6E9CE] px-2.5 py-3 shadow-xl">
          <div className="absolute -top-1.5 left-1/2 h-3 w-[90%] -translate-x-1/2 rounded-full bg-[#D9C293]" />
          <div className="absolute -bottom-1.5 left-1/2 h-3 w-[90%] -translate-x-1/2 rounded-full bg-[#D9C293]" />
          <p className="bi-font-display mb-2 text-center text-[9px] font-bold uppercase leading-tight tracking-[0.1em] text-[#7A5C2E]">
            Pergamino de misiones
          </p>
          <ul className="space-y-1.5 bi-font-body text-[11px] text-[#4A3A1E]">
            {quests.map((q) => (
              <li key={q.label} className="flex items-center justify-between gap-1">
                <span className="flex items-center gap-1 truncate">
                  <span aria-hidden>{q.icon}</span>
                  {q.label}
                </span>
                <span className="font-bold text-[#7A5C2E]">{q.value}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ---- personaje caminando en la arena ---- */}
        <div className="bi-walk absolute bottom-[24%] left-[46%] z-10 text-2xl drop-shadow-md">
          🧍
        </div>

        {/* ---- barra HUD inferior ---- */}
        <div className="absolute inset-x-[4%] bottom-[3%] z-20 flex items-end justify-between rounded-full bg-[#0B2A43]/95 px-2.5 py-2 shadow-xl backdrop-blur-sm">
          {HUD_ITEMS.map((item) =>
            item.primary ? (
              <button
                key={item.key}
                type="button"
                className="relative -mt-6 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-gradient-to-b from-[#4FD3E8] to-[#2EC4B6] shadow-[0_0_0_4px_rgba(11,42,67,0.95),0_0_16px_rgba(79,211,232,0.6)]"
              >
                <span className="text-xl">{item.icon}</span>
              </button>
            ) : (
              <button
                key={item.key}
                type="button"
                className="flex flex-col items-center gap-0.5 px-1.5 py-1 text-[#F6E9CE]/85 transition-colors hover:text-white"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="bi-font-body text-[8px] font-semibold uppercase tracking-wide">
                  {item.label}
                </span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
