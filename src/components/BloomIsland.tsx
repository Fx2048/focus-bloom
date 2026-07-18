interface BloomIslandProps {
  totalPoints: number;
  completedTasks: number;
  pomodoros: number;
  streakDays: number;
  academicXp?: number;
}

const FLOWER_POSITIONS = [
  ['18%', '66%'],
  ['28%', '75%'],
  ['37%', '58%'],
  ['48%', '72%'],
  ['60%', '63%'],
  ['69%', '76%'],
  ['78%', '60%'],
  ['86%', '70%'],
  ['23%', '50%'],
  ['55%', '50%'],
  ['72%', '48%'],
  ['34%', '84%'],
  ['50%', '84%'],
  ['66%', '86%'],
  ['82%', '84%'],
  ['13%', '82%'],
  ['43%', '44%'],
  ['63%', '40%'],
  ['78%', '38%'],
  ['91%', '52%'],
];

const TREE_POSITIONS = [
  ['15%', '48%'],
  ['31%', '40%'],
  ['52%', '36%'],
  ['71%', '37%'],
  ['85%', '45%'],
  ['27%', '68%'],
  ['58%', '70%'],
  ['80%', '72%'],
];

export function BloomIsland({
  totalPoints,
  completedTasks,
  pomodoros,
  streakDays,
  academicXp = 0,
}: BloomIslandProps) {
  const islandXp = totalPoints + academicXp;

  const flowers = Math.min(20, Math.floor(islandXp / 80));
  const trees = Math.min(8, Math.floor(islandXp / 350));
  const butterflies = streakDays >= 3 ? Math.min(6, streakDays - 2) : 0;

  const islandProgress = Math.min(
    100,
    Math.round((islandXp / 5000) * 100)
  );

  const characterPosition = 10 + islandProgress * 0.76;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-white p-5 shadow-elevated">
      <style>{`
        @keyframes bloom-float {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }

        @keyframes bloom-wave {
          0% { transform: translateX(-8%); }
          100% { transform: translateX(8%); }
        }

        @keyframes bloom-butterfly {
          0%, 100% { transform: translate(0, 0) rotate(-8deg); }
          50% { transform: translate(18px, -12px) rotate(10deg); }
        }

        .bloom-float { animation: bloom-float 3s ease-in-out infinite; }
        .bloom-wave { animation: bloom-wave 5s ease-in-out infinite alternate; }
        .bloom-butterfly { animation: bloom-butterfly 3s ease-in-out infinite; }
      `}</style>

      <div className="relative z-10 mb-4 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Isla Bloom
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-800">
            Tu mundo crece contigo
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Completa misiones para transformar la isla.
          </p>
        </div>

        <div className="rounded-2xl bg-amber-100 px-3 py-2 text-right">
          <p className="text-[10px] font-bold uppercase text-amber-700">
            XP de isla
          </p>
          <p className="text-lg font-bold text-amber-800">{islandXp}</p>
        </div>
      </div>

      <div className="relative h-72 overflow-hidden rounded-2xl bg-gradient-to-b from-sky-100 via-sky-50 to-cyan-100">
        <div className="absolute left-8 top-6 text-4xl">☀️</div>

        <div className="bloom-float absolute left-[18%] top-10 text-3xl opacity-70">
          ☁️
        </div>
        <div className="bloom-float absolute right-[18%] top-16 text-2xl opacity-60">
          ☁️
        </div>

        {Array.from({ length: butterflies }).map((_, index) => (
          <span
            key={index}
            className="bloom-butterfly absolute text-lg"
            style={{
              left: `${20 + index * 12}%`,
              top: `${18 + (index % 3) * 10}%`,
              animationDelay: `${index * 0.4}s`,
            }}
          >
            🦋
          </span>
        ))}

        <div className="absolute bottom-0 left-0 h-16 w-full overflow-hidden bg-cyan-300">
          <div className="bloom-wave absolute -left-10 top-2 text-4xl tracking-[0.3em] text-cyan-100">
            〰〰〰〰〰〰〰〰〰
          </div>
        </div>

        <div className="absolute bottom-7 left-[6%] h-44 w-[88%] rounded-[50%] bg-gradient-to-b from-emerald-300 to-emerald-500 shadow-[inset_0_-14px_0_rgba(21,128,61,0.18)]" />

        {TREE_POSITIONS.slice(0, trees).map(([left, bottom], index) => (
          <span
            key={index}
            className="bloom-float absolute z-20 text-3xl"
            style={{
              left,
              bottom,
              animationDelay: `${index * 0.25}s`,
            }}
          >
            🌳
          </span>
        ))}

        {FLOWER_POSITIONS.slice(0, flowers).map(([left, bottom], index) => (
          <span
            key={index}
            className="absolute z-20 text-lg"
            style={{ left, bottom }}
          >
            {index % 2 === 0 ? '🌸' : '🌼'}
          </span>
        ))}

        <div className="absolute bottom-[38%] left-[12%] h-3 w-[76%] rotate-[3deg] rounded-full border-y-4 border-dashed border-amber-200/90" />

        <div
          className="absolute bottom-[35%] z-30 text-3xl transition-all duration-1000 ease-out"
          style={{ left: `${characterPosition}%` }}
          title="Tu personaje"
        >
          🧑‍🎓
        </div>

        <div className="absolute bottom-9 right-[10%] z-20 text-4xl">
          {islandProgress >= 80 ? '🏛️' : '⛺'}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-emerald-50 p-2">
          <p className="text-lg font-bold text-emerald-700">{flowers}</p>
          <p className="text-[10px] font-semibold text-emerald-800">FLORES</p>
        </div>

        <div className="rounded-xl bg-sky-50 p-2">
          <p className="text-lg font-bold text-sky-700">{completedTasks}</p>
          <p className="text-[10px] font-semibold text-sky-800">MISIONES</p>
        </div>

        <div className="rounded-xl bg-violet-50 p-2">
          <p className="text-lg font-bold text-violet-700">{pomodoros}</p>
          <p className="text-[10px] font-semibold text-violet-800">ENFOQUES</p>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>Exploración de la isla</span>
          <span className="font-bold text-slate-700">{islandProgress}%</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-400 transition-all duration-1000"
            style={{ width: `${islandProgress}%` }}
          />
        </div>
      </div>
    </section>
  );
}
