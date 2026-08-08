import { useMemo, useState } from 'react';
import {
  Lock,
  MapPin,
  Sparkles,
  TreePine,
  Flower2,
  Home,
  Castle,
  Butterfly,
  Mountain,
} from 'lucide-react';

import { useIslandExploration } from '@/hooks/useIslandExploration';
import type { IslandObjectType } from '@/types/island';

const OBJECT_ICONS: Record<IslandObjectType, React.ReactNode> = {
  flower: <Flower2 className="h-7 w-7" />,
  tree: <TreePine className="h-9 w-9" />,
  butterfly: <Butterfly className="h-6 w-6" />,
  statue: <Castle className="h-8 w-8" />,
  cabin: <Home className="h-10 w-10" />,
};

const OBJECT_ANIMATIONS: Record<IslandObjectType, string> = {
  flower: 'animate-pulse',
  tree: 'animate-[float_4s_ease-in-out_infinite]',
  butterfly: 'animate-[float_3s_ease-in-out_infinite]',
  statue: '',
  cabin: '',
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

  const [selectedObject, setSelectedObject] = useState<string | null>(null);

  const visibleObjects = useMemo(() => {
    return islandObjects.filter(() => true);
  }, [islandObjects]);

  if (isLoading) {
    return (
      <section className="card-calm min-h-[500px] p-6">
        <div className="flex h-full min-h-[450px] items-center justify-center">
          <div className="text-center">
            <Sparkles className="mx-auto mb-3 h-8 w-8 animate-pulse" />
            <p className="text-sm text-muted-foreground">
              Explorando la isla...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">

      {/* HEADER */}
      <div className="relative z-20 flex flex-col gap-3 border-b border-white/10 bg-black/30 p-5 backdrop-blur-md md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-300" />

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Mundo descubierto
            </p>
          </div>

          <h2 className="mt-1 text-2xl font-bold text-white">
            {activeZone.name}
          </h2>

          <p className="mt-1 text-sm text-white/60">
            Nivel {metrics.level} · {metrics.approvedCredits} créditos conquistados
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
          <p className="text-[10px] uppercase tracking-widest text-white/50">
            Exploración
          </p>

          <p className="text-xl font-bold text-emerald-300">
            {metrics.progress}%
          </p>
        </div>
      </div>

      {/* MAPA */}
      <div className="relative min-h-[600px] overflow-hidden">

        {/* CIELO */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-200" />

        {/* NUBES */}
        <div className="absolute left-[10%] top-[12%] text-6xl opacity-50">
          ☁️
        </div>

        <div className="absolute right-[15%] top-[18%] text-5xl opacity-40">
          ☁️
        </div>

        {/* MAR */}
        <div className="absolute bottom-0 left-0 right-0 h-[38%] bg-gradient-to-b from-cyan-400/70 to-blue-600/90">
          <div className="absolute inset-0 opacity-30">
            🌊 🌊 🌊 🌊 🌊 🌊 🌊
          </div>
        </div>

        {/* ISLA PRINCIPAL */}
        <div
          className="
            absolute
            left-[5%]
            right-[5%]
            top-[20%]
            h-[55%]
            rounded-[45%]
            bg-gradient-to-br
            from-lime-200
            via-emerald-300
            to-emerald-700
            shadow-[0_30px_80px_rgba(0,0,0,0.35)]
          "
        />

        {/* PLAYA */}
        <div
          className="
            absolute
            bottom-[25%]
            left-[10%]
            right-[10%]
            h-[17%]
            rounded-[50%]
            bg-gradient-to-b
            from-yellow-100
            to-amber-200
            opacity-90
          "
        />

        {/* ZONAS */}
        {zones.map((zone) => {
          const status = zoneStatuses.get(zone.id);

          const locked = status === 'locked';
          const active = status === 'active';

          return (
            <button
              key={zone.id}
              type="button"
              disabled={locked}
              className={`
                absolute
                z-10
                flex
                min-w-[120px]
                -translate-x-1/2
                -translate-y-1/2
                flex-col
                items-center
                gap-1
                rounded-2xl
                border
                px-4
                py-3
                text-center
                shadow-xl
                backdrop-blur-md
                transition-all
                ${
                  locked
                    ? 'cursor-not-allowed border-black/10 bg-black/30 text-white/40 grayscale'
                    : active
                      ? 'scale-110 border-white bg-white/90 text-emerald-900'
                      : 'border-white/40 bg-black/30 text-white hover:scale-105'
                }
              `}
              style={{
                left: `${zone.mapX}%`,
                top: `${zone.mapY}%`,
              }}
            >
              {locked ? (
                <Lock className="h-6 w-6" />
              ) : (
                <MapPin className="h-6 w-6" />
              )}

              <span className="text-xs font-bold">
                {zone.name}
              </span>

              {locked && (
                <span className="text-[9px]">
                  Nivel {zone.unlockLevel}
                </span>
              )}
            </button>
          );
        })}

        {/* OBJETOS DESBLOQUEADOS */}
        {visibleObjects.map((object) => {
          const selected = selectedObject === object.id;

          return (
            <button
              key={object.id}
              type="button"
              onClick={() =>
                setSelectedObject(
                  selected ? null : object.id
                )
              }
              className={`
                absolute
                z-20
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                p-1
                text-emerald-900
                drop-shadow-lg
                transition-all
                hover:scale-125
                ${OBJECT_ANIMATIONS[object.type]}
                ${selected ? 'scale-125 ring-2 ring-white' : ''}
              `}
              style={{
                left: `${object.x}%`,
                top: `${object.y}%`,
              }}
              title={object.label ?? object.type}
            >
              {OBJECT_ICONS[object.type]}
            </button>
          );
        })}

        {/* EFECTOS DE PARTÍCULAS */}
        <div className="pointer-events-none absolute left-[25%] top-[35%] z-10 text-xl opacity-70">
          ✨
        </div>

        <div className="pointer-events-none absolute left-[70%] top-[45%] z-10 text-lg opacity-70">
          ✨
        </div>

        <div className="pointer-events-none absolute left-[50%] top-[30%] z-10 text-sm opacity-60">
          🍃
        </div>

        {/* MENSAJE DE DESCUBRIMIENTO */}
        {discovery?.isNew && (
          <div className="absolute bottom-6 left-1/2 z-30 w-[90%] max-w-md -translate-x-1/2">
            <div className="rounded-3xl border border-white/30 bg-black/70 p-5 text-center text-white shadow-2xl backdrop-blur-xl">
              <Sparkles className="mx-auto mb-2 h-7 w-7 text-yellow-300" />

              <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">
                Nueva región descubierta
              </p>

              <h3 className="mt-1 text-2xl font-bold">
                {discovery.zone.name}
              </h3>

              <p className="mt-2 text-sm text-white/70">
                Has avanzado lo suficiente para explorar
                una nueva parte de la isla.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ZONAS INFERIORES */}
      <div className="border-t border-white/10 bg-black/30 p-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {zones.map((zone) => {
            const status = zoneStatuses.get(zone.id);

            return (
              <div
                key={zone.id}
                className={`
                  shrink-0
                  rounded-xl
                  border
                  px-3
                  py-2
                  ${
                    status === 'locked'
                      ? 'border-white/5 bg-white/5 opacity-40'
                      : status === 'active'
                        ? 'border-emerald-300/50 bg-emerald-400/10'
                        : 'border-white/10 bg-white/5'
                  }
                `}
              >
                <p className="text-xs font-semibold text-white">
                  {status === 'locked' ? '🔒 ' : '🗺️ '}
                  {zone.name}
                </p>

                <p className="text-[10px] text-white/50">
                  {status === 'locked'
                    ? `Nivel ${zone.unlockLevel}`
                    : 'Descubierta'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
