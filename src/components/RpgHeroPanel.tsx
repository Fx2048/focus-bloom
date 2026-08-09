import { useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { calculateLevel } from '@/hooks/useLeaderboard';
import { Task } from '@/types/focusflow';
import { IslandWorld } from '@/components/IslandWorld';
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

  const [selectedMission, setSelectedMission] =
    useState<Mission | null>(null);

  /*
   * ==============================
   * PROGRESO DEL JUGADOR
   * ==============================
   */

  const xp = profile?.totalPoints ?? 0;

  const level = calculateLevel(xp);

  const percent = Math.round(level.progress);

  /*
   * ==============================
   * NOMBRE DEL JUGADOR
   * ==============================
   */

  const displayName = useMemo(() => {
    const meta = user?.user_metadata as
      | {
          full_name?: string;
          name?: string;
        }
      | undefined;

    return (
      meta?.full_name ||
      meta?.name ||
      user?.email?.split('@')[0] ||
      'Aventurero'
    );
  }, [user]);

  const initial = displayName.charAt(0).toUpperCase();

  /*
   * ==============================
   * CONVERSIÓN DE TASK → MISIÓN RPG
   * ==============================
   */

  const taskToMission = (task: Task): Mission => {
    const estimatedHours = task.estimatedHours ?? 1;

    return {
      id: task.id,

      title: task.name,

      course: `Misión de ${formatDay(task.scheduledDay)}`,

      description:
        `Dedica una sesión de enfoque a "${task.name}".`,

      xpReward: Math.max(
        10,
        Math.round(estimatedHours * 25)
      ),

      duration: Math.max(
        25,
        Math.round(estimatedHours * 60)
      ),

      tasks: [
        {
          id: `${task.id}-focus`,
          title:
            `Completar sesión de enfoque para ${task.name}`,
          completed: false,
        },
      ],
    };
  };

  /*
   * ==============================
   * CÍRCULO DE XP
   * ==============================
   */

  const R = 62;

  const C = 2 * Math.PI * R;

  const dash = (percent / 100) * C;

  /*
   * ==============================
   * PRÓXIMAS MISIONES
   * ==============================
   */

  const upcoming = tasks
    .filter((task) => task.status !== 'completed')
    .slice(0, 8);

  /*
   * ==============================
   * RENDER
   * ==============================
   */

  return (
    <>
      <section
        className="
          relative
          overflow-hidden
          rounded-3xl
          border
          border-white/10
          shadow-elevated
          animate-fade-in
        "
        aria-label="Mundo de aventura"
      >

        {/* ==========================================
            🌴 MUNDO DE LA ISLA
           ========================================== */}

        <div className="relative min-h-[650px]">

          <IslandWorld
            onObjectClick={(object) => {
              console.log(
                'Objeto descubierto:',
                object
              );
            }}
          />

          {/* ==========================================
              👤 INFORMACIÓN DEL JUGADOR
             ========================================== */}

          <div
            className="
              absolute
              left-5
              top-5
              z-20
              rounded-2xl
              bg-black/40
              p-4
              text-white
              shadow-xl
              backdrop-blur-md
            "
          >

            <div className="flex items-center gap-3">

              {/* Avatar */}

              <div className="relative">

                <div
                  className="
                    absolute
                    -inset-1
                    rounded-full
                    bg-gradient-to-br
                    from-cyan-300
                    via-white/60
                    to-fuchsia-400
                    blur-md
                    opacity-80
                  "
                />

                <div
                  className="
                    relative
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    bg-gradient-to-br
                    from-sky-500
                    to-indigo-700
                    text-xl
                    font-bold
                    ring-2
                    ring-white/70
                  "
                >
                  {initial}
                </div>

              </div>

              {/* Nombre */}

              <div>

                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.2em]
                    opacity-80
                  "
                >
                  Aventurero
                </p>

                <h2 className="text-lg font-bold">
                  {displayName}
                </h2>

                <p className="text-xs opacity-80">
                  Nivel {level.level}
                </p>

              </div>

            </div>

            {/* XP */}

            <div className="mt-3">

              <div className="mb-1 flex justify-between text-[10px]">

                <span>
                  XP
                </span>

                <span>
                  {level.currentXp} / {level.nextLevelXp}
                </span>

              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/20">

                <div
                  className="
                    h-full
                    rounded-full
                    bg-gradient-to-r
                    from-lime-300
                    to-purple-400
                    transition-all
                    duration-700
                  "
                  style={{
                    width: `${percent}%`,
                  }}
                />

              </div>

              <div
                className="
                  mt-2
                  flex
                  items-center
                  gap-1
                  text-[10px]
                  opacity-80
                "
              >

                <Sparkles className="h-3 w-3" />

                {xp} XP acumulados

              </div>

            </div>

          </div>

          {/* ==========================================
              📜 MISIONES
             ========================================== */}

          <div
            className="
              absolute
              right-5
              top-5
              z-20
              w-[280px]
              max-w-[calc(100%-40px)]
            "
          >

            <div
              className="
                rounded-xl
                border
                border-amber-300/60
                bg-gradient-to-b
                from-[#fdf6e3]
                to-[#f0e2b6]
                p-4
                text-stone-800
                shadow-2xl
              "
            >

              <p
                className="
                  mb-3
                  text-center
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-widest
                  text-amber-900/70
                "
              >
                Misiones de hoy
              </p>

              {upcoming.length === 0 ? (

                <p
                  className="
                    py-6
                    text-center
                    text-xs
                    italic
                    text-stone-500
                  "
                >
                  Todo despejado, aventurero ✨
                </p>

              ) : (

                <ul className="max-h-[250px] space-y-1.5 overflow-y-auto">

                  {upcoming.map((task) => (

                    <li key={task.id}>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedMission(
                            taskToMission(task)
                          )
                        }
                        className="
                          flex
                          w-full
                          items-center
                          gap-2
                          rounded
                          px-2
                          py-2
                          text-left
                          text-xs
                          transition-colors
                          hover:bg-amber-200/50
                        "
                      >

                        <span
                          className="
                            w-9
                            shrink-0
                            font-mono
                            text-[10px]
                            text-amber-700
                          "
                        >
                          {formatDay(
                            task.scheduledDay
                          )}
                        </span>

                        <span
                          className="
                            h-1
                            w-1
                            shrink-0
                            rounded-full
                            bg-amber-700/70
                          "
                        />

                        <span className="flex-1 truncate">
                          {task.name}
                        </span>

                        <span
                          className="
                            shrink-0
                            text-[10px]
                            text-amber-800/70
                          "
                        >
                          {task.estimatedHours}h
                        </span>

                      </button>

                    </li>

                  ))}

                </ul>

              )}

            </div>

          </div>

        </div>

      </section>

      {/* ==========================================
          📜 MODAL DE MISIÓN
         ========================================== */}

      <MissionDetailModal
        mission={selectedMission}

        onClose={() =>
          setSelectedMission(null)
        }

        onStart={(mission) => {

          const originalTask =
            tasks.find(
              (task) => task.id === mission.id
            );

          if (originalTask) {
            onTaskClick?.(originalTask);
          }

          setSelectedMission(null);
        }}

        onToggleTask={(_, taskId) => {

          setSelectedMission(
            (currentMission) => {

              if (!currentMission) {
                return null;
              }

              return {
                ...currentMission,

                tasks: currentMission.tasks.map(
                  (task) =>
                    task.id === taskId
                      ? {
                          ...task,
                          completed:
                            !task.completed,
                        }
                      : task
                ),
              };

            }
          );

        }}
      />

    </>
  );
}
