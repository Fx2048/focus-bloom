import { useIslandExploration } from '@/hooks/useIslandExploration';
import type { IslandObjectType } from '@/types/island';

const OBJECT_ICON: Record<IslandObjectType, string> = {
  flower: '🌸',
  tree: '🌳',
  butterfly: '🦋',
  cabin: '🏡',
  statue: '🗿',
  bridge: '🌉',
};

export function IslandWorld() {
  const {
    isLoading,
    metrics,
    zones,
    zoneStatuses,
    activeZone,
    islandObjects,
    discovery,
  } = useIslandExploration();

  if (isLoading) {
    return (
      <div className="card-calm p-5 text-sm text-muted-foreground">
        Cargando tu isla...
      </div>
    );
  }

  const RADIUS = 70;
  const CIRC = 2 * Math.PI * RADIUS;
  // dentro del "nivel" actual, cuánto se ha avanzado hacia el siguiente (0-100)
  const withinLevel = ((metrics.progress % 10) / 10) * 100;
  const dashOffset = CIRC - (withinLevel / 100) * CIRC;

  return (
    <section className="card-calm overflow-hidden p-0">
      <style>{`
        @keyframes iw-drift { 0%,100% { transform: translate3d(0,0,0); opacity:.7 } 50% { transform: translate3d(0,-6px,0); opacity:1 } }
        @keyframes iw-sway { 0%,100% { transform: rotate(-2deg) } 50% { transform: rotate(2deg) } }
        @keyframes iw-glow { 0%,100% { opacity:.35 } 50% { opacity:.6 } }
        .iw-drift { animation: iw-drift 2.4s ease-in-out infinite; will-change: transform, opacity; }
        .iw-sway { animation: iw-sway 4s ease-in-out infinite; transform-origin: 50% 100%; will-change: transform; }
        .iw-glow { animation: iw-glow 3s ease-in-out infinite; will-change: opacity; }
        .iw-xp-fill { transition: stroke-dashoffset 1s cubic-bezier(.22,1,.36,1); }
        @media (prefers-reduced-motion: reduce) {
          .iw-drift, .iw-sway, .iw-glow { animation: none !important; }
          .iw-xp-fill { transition: none !important; }
        }
      `}</style>

      {/* banner de zona recién descubierta */}
      {discovery?.isNew && (
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <span>✨</span>
          Nueva región descubierta: {discovery.zone.name}
        </div>
      )}

      {/* mapa general: cadena de zonas, con niebla sobre las bloqueadas */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border bg-muted/40 px-3 py-2">
        {zones.map((zone, i) => {
          const status = zoneStatuses.get(zone.id);
          return (
            <div key={zone.id} className="flex shrink-0 items-center">
              <div
                title={status === 'locked' ? '???' : zone.name}
                className={
                  'flex h-9 w-9 items-center justify-center rounded-full text-base transition-all ' +
                  (status === 'locked'
                    ? 'bg-muted grayscale opacity-40'
                    : status === 'active'
                    ? 'bg-primary/15 ring-2 ring-primary'
                    : 'bg-muted/80')
                }
              >
                {status === 'locked' ? '🌫️' : zone.icon}
              </div>
              {i < zones.length - 1 && <div className="h-px w-4 bg-border" />}
            </div>
          );
        })}
      </div>

      {/* escena activa */}
      <div
        className="relative aspect-[16/10] w-full overflow-hidden"
        style={{
          background: `linear-gradient(to bottom, ${activeZone.gradient[0]}, ${activeZone.gradient[1]})`,
        }}
      >
        {/* objetos del mundo, derivados de cursos aprobados reales */}
        {islandObjects.map((obj) => (
          <span
            key={obj.id}
            title={obj.label}
            className={
              'absolute text-xl drop-shadow-sm ' +
              (obj.type === 'butterfly' ? 'iw-drift' : obj.type === 'tree' ? 'iw-sway' : '')
            }
            style={{ left: `${obj.x}%`, top: `${obj.y}%` }}
          >
            {OBJECT_ICON[obj.type]}
          </span>
        ))}

        {/* medidor de nivel, flotando sobre la escena */}
        <div className="absolute left-3 top-3 flex h-24 w-24 items-center justify-center">
          <div className="iw-glow absolute h-full w-full rounded-full bg-[radial-gradient(circle,rgba(255,194,75,0.55),transparent_70%)]" />
          <svg viewBox="0 0 160 160" className="relative h-20 w-20 -rotate-90">
            <circle cx="80" cy="80" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="10" />
            <circle
              cx="80"
              cy="80"
              r={RADIUS}
              fill="none"
              stroke="#FFC24B"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={dashOffset}
              className="iw-xp-fill"
            />
          </svg>
          <div className="absolute flex flex-col items-center text-white drop-shadow">
            <span className="text-lg font-bold leading-none">{metrics.level}</span>
            <span className="text-[9px] uppercase tracking-wide opacity-90">nivel</span>
          </div>
        </div>

        <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-black/30 px-3 py-2 text-white backdrop-blur-sm">
          <p className="text-sm font-semibold">{activeZone.name}</p>
          <p className="text-xs opacity-90">{activeZone.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 p-3">
        <div className="rounded-xl bg-muted p-3 text-center">
          <p className="text-lg font-bold">{metrics.approvedCredits}</p>
          <p className="text-[10px] text-muted-foreground">CRÉDITOS</p>
        </div>
        <div className="rounded-xl bg-muted p-3 text-center">
          <p className="text-lg font-bold">{metrics.weightedGrade}</p>
          <p className="text-[10px] text-muted-foreground">PROMEDIO</p>
        </div>
        <div className="rounded-xl bg-muted p-3 text-center">
          <p className="text-lg font-bold">{metrics.xp}</p>
          <p className="text-[10px] text-muted-foreground">XP ACADÉMICO</p>
        </div>
      </div>
    </section>
  );
}
