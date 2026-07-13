import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { calculateLevel } from '@/hooks/useLeaderboard';
import { Task } from '@/types/focusflow';
import beachBg from '@/assets/rpg-beach-bg.jpg';
import { Sparkles } from 'lucide-react';

interface Props {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

const DAY_LABELS: Record<string, string> = {
  monday: 'LUN', tuesday: 'MAR', wednesday: 'MIÉ',
  thursday: 'JUE', friday: 'VIE', saturday: 'SÁB', sunday: 'DOM',
};

export function RpgHeroPanel({ tasks, onTaskClick }: Props) {
  const { user } = useAuth();
  const { profile } = useProfile();

  const xp = profile?.totalPoints ?? 0;
  const level = calculateLevel(xp);
  const displayName = useMemo(() => {
    const meta = (user?.user_metadata as { full_name?: string; name?: string } | undefined);
    return meta?.full_name || meta?.name || user?.email?.split('@')[0] || 'Aventurero';
  }, [user]);

  const initial = displayName.charAt(0).toUpperCase();
  const percent = Math.round(level.progress);

  // SVG ring math
  const R = 62;
  const C = 2 * Math.PI * R;
  const dash = (percent / 100) * C;

  const upcoming = tasks
    .filter((t) => t.status !== 'completed')
    .slice(0, 8);

  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-white/10 shadow-elevated animate-fade-in"
      style={{
        backgroundImage: `url(${beachBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: 360,
      }}
      aria-label="Panel de aventura"
    >
      {/* Soft overlay for legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />

      <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 p-5 sm:p-7">
        {/* LEFT: Avatar + Ring */}
        <div className="flex flex-col items-center md:items-start gap-4 text-white drop-shadow-lg">
          <div className="flex items-center gap-3">
            {/* Circular glowing avatar */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-cyan-300 via-white/60 to-fuchsia-400 blur-md opacity-80" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-indigo-700 flex items-center justify-center text-2xl font-bold ring-2 ring-white/70">
                {initial}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] opacity-80">Aventurero</p>
              <h2 className="text-xl font-bold leading-tight">
                {displayName} <span className="opacity-90">Lv {level.level}</span>
              </h2>
            </div>
          </div>

          {/* XP ring */}
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
              <defs>
                <linearGradient id="xpRing" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#c8f55a" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <circle cx="80" cy="80" r={R} stroke="rgba(255,255,255,0.25)" strokeWidth="10" fill="none" />
              <circle
                cx="80" cy="80" r={R}
                stroke="url(#xpRing)"
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${dash} ${C}`}
                style={{ transition: 'stroke-dasharray 700ms ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold tabular-nums">{percent}%</span>
              <span className="text-[10px] uppercase tracking-widest opacity-80 mt-1">XP Meter</span>
              <span className="text-[11px] opacity-90 mt-0.5">{level.currentXp}/{level.nextLevelXp}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#c8f55a]" />
            <span>{xp} XP acumulados · próximo nivel en {level.nextLevelXp - level.currentXp} XP</span>
          </div>
        </div>

        {/* RIGHT: Parchment scroll */}
        <div className="relative w-full md:w-[280px]">
          {/* Top scroll roll */}
          <div className="h-4 rounded-t-full bg-gradient-to-b from-amber-100 to-amber-300 shadow-inner mx-1" />
          <div className="relative bg-gradient-to-b from-[#fdf6e3] to-[#f0e2b6] text-stone-800 rounded-md p-3 shadow-2xl border-x-2 border-amber-300/60">
            <p className="text-[10px] uppercase tracking-widest text-amber-900/70 text-center mb-2 font-semibold">
              Misiones de hoy
            </p>
            {upcoming.length === 0 ? (
              <p className="text-center text-xs italic text-stone-500 py-6">
                Todo despejado, aventurero ✨
              </p>
            ) : (
              <ul className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {upcoming.map((t) => (
                  <li
                    key={t.id}
                    onClick={() => onTaskClick?.(t)}
                    className="flex items-center gap-2 text-[12px] leading-tight cursor-pointer hover:bg-amber-200/50 rounded px-1.5 py-1 transition-colors"
                  >
                    <span className="text-amber-700 font-mono text-[10px] w-9 shrink-0">
                      {DAY_LABELS[t.scheduledDay] ?? '—'}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-amber-700/70 shrink-0" />
                    <span className="truncate flex-1">{t.name}</span>
                    <span className="text-[10px] text-amber-800/70 shrink-0">{t.estimatedHours}h</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Bottom scroll roll */}
          <div className="h-4 rounded-b-full bg-gradient-to-t from-amber-100 to-amber-300 shadow-inner mx-1" />
        </div>
      </div>
    </section>
  );
}