import { useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { calculateLevel } from '@/hooks/useLeaderboard';
import { Task } from '@/types/focusflow';
import beachBg from '@/assets/rpg-beach-bg.jpg';
import { Sparkles } from 'lucide-react';
import {
  MissionDetailModal,
  type Mission,
} from '@/components/MissionDetailModal';

interface Props {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

const DAY_LABELS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

const formatDay = (d: Date | string) => {
  const date = d instanceof Date ? d : new Date(d);

  if (isNaN(date.getTime())) return '—';

  return DAY_LABELS[date.getDay()];
};

export function RpgHeroPanel({ tasks, onTaskClick }: Props) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  const xp = profile?.totalPoints ?? 0;
  const level = calculateLevel(xp);
  const percent = Math.round(level.progress);

  const displayName = useMemo(() => {
    const meta = user?.user_metadata as
      | { full_name?: string; name?: string }
      | undefined;

    return (
      meta?.full_name ||
      meta?.name ||
      user?.email?.split('@')[0] ||
      'Aventurero'
    );
  }, [user]);

  const initial = displayName.charAt(0).toUpperCase();

  const taskToMission = (task: Task): Mission => {
    const estimatedHours = task.estimatedHours ?? 1;

    return {
      id: task.id,
      title: task.name,
      course: `Misión de ${formatDay(task.scheduledDay)}`,
      description: `Dedica una sesión de enfoque a "${task.name}".`,
      xpReward: Math.max(10, Math.round(estimatedHours * 25)),
      duration: Math.max(25, Math.round(estimatedHours * 60)),
      tasks: [
        {
          id: `${task.id}-focus`,
          title: `Completar sesión de enfoque para ${task.name}`,
          completed: false,
        },
      ],
    };
  };

  // SVG ring math
  const R = 62;
  const C = 2 * Math.PI * R;
  const dash = (percent / 100) * C;

  const upcoming = tasks
    .filter((task) => task.status !== 'completed')
    .slice(0, 8);

  return (
    <>
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />

        <div className="relative grid grid-cols-1 gap-6 p-5 md:grid-cols-[1fr_auto] sm:p-7">
          <div className="flex flex-col items-center gap-4 text-white drop-shadow-lg md:items-start">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-cyan-300 via-white/60 to-fuchsia-400 blur-md opacity-80" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-700 text-2xl font-bold ring-2 ring-white/70">
                  {initial}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] opacity-80">
                  Aventurero
                </p>
                <h2 className="text-xl font-bold leading-tight">
                  {displayName} <span className="opacity-90">Lv {level.level}</span>
                </h2>
              </div>
            </div>

            <div className="relative h-40 w-40">
              <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
                <defs>
                  <linearGradient id="xpRing" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#c8f55a" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>

                <circle
                  cx="80"
                  cy="80"
                  r={R}
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="10"
                  fill="none"
                />

                <circle
                  cx="80"
                  cy="80"
                  r={R}
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
                <span className="mt-1 text-[10px] uppercase tracking-widest opacity-80">
                  XP Meter
                </span>
                <span className="mt-0.5 text-[11px] opacity-90">
                  {level.currentXp}/{level.nextLevelXp}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-black/30 px-3 py-1.5 text-xs backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#c8f55a]" />
              <span>
                {xp} XP acumulados · próximo nivel en{' '}
                {level.nextLevelXp - level.currentXp} XP
              </span>
            </div>
          </div>

          <div className="relative w-full md:w-[280px]">
            <div className="mx-1 h-4 rounded-t-full bg-gradient-to-b from-amber-100 to-amber-300 shadow-inner" />

            <div className="relative rounded-md border-x-2 border-amber-300/60 bg-gradient-to-b from-[#fdf6e3] to-[#f0e2b6] p-3 text-stone-800 shadow-2xl">
              <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-amber-900/70">
                Misiones de hoy
              </p>

              {upcoming.length === 0 ? (
                <p className="py-6 text-center text-xs italic text-stone-500">
                  Todo despejado, aventurero ✨
                </p>
              ) : (
                <ul className="max-h-[220px] space-y-1.5 overflow-y-auto pr-1">
                  {upcoming.map((task) => (
                    <li key={task.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedMission(taskToMission(task))}
                        className="flex w-full items-center gap-2 rounded px-1.5 py-1 text-left text-[12px] leading-tight transition-colors hover:bg-amber-200/50"
                      >
                        <span className="w-9 shrink-0 font-mono text-[10px] text-amber-700">
                          {formatDay(task.scheduledDay)}
                        </span>
                        <span className="h-1 w-1 shrink-0 rounded-full bg-amber-700/70" />
                        <span className="flex-1 truncate">{task.name}</span>
                        <span className="shrink-0 text-[10px] text-amber-800/70">
                          {task.estimatedHours}h
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mx-1 h-4 rounded-b-full bg-gradient-to-t from-amber-100 to-amber-300 shadow-inner" />
          </div>
        </div>
      </section>

      <MissionDetailModal
        mission={selectedMission}
        onClose={() => setSelectedMission(null)}
        onStart={(mission) => {
          const originalTask = tasks.find((task) => task.id === mission.id);

          if (originalTask) {
            onTaskClick?.(originalTask);
          }

          setSelectedMission(null);
        }}
        onToggleTask={(_, taskId) => {
          setSelectedMission((currentMission) => {
            if (!currentMission) return null;

            return {
              ...currentMission,
              tasks: currentMission.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, completed: !task.completed }
                  : task
              ),
            };
          });
        }}
      />
    </>
  );
}
