import { useMemo, useState } from 'react';
import {
  Lock,
  MapPin,
  Sparkles,
  Flower2,
  TreePine,
  Home,
  Castle,
  Flame,
  Waves,
  Mountain,
  Gem,
  Mushroom,
  PalmTree,
  Users,
  Footprints,
} from 'lucide-react';

import { useIslandExploration } from '@/hooks/useIslandExploration';
import type { IslandObjectType, IslandZone } from '@/types/island';

const OBJECT_ICONS: Partial<Record<IslandObjectType, React.ReactNode>> = {
  flower: <Flower2 className="h-7 w-7" />,
  tree: <TreePine className="h-9 w-9" />,
  butterfly: <Sparkles className="h-6 w-6" />,
  leaf: <Sparkles className="h-5 w-5" />,
  cabin: <Home className="h-9 w-9" />,
  bridge: <Footprints className="h-8 w-8" />,
  statue: <Castle className="h-8 w-8" />,
  campfire: <Flame className="h-7 w-7" />,
  waterfall: <Waves className="h-8 w-8" />,
  ruins: <Castle className="h-8 w-8" />,
  cave: <Mountain className="h-8 w-8" />,
  temple: <Castle className="h-9 w-9" />,
  village: <Users className="h-9 w-9" />,
  treasure: <Sparkles className="h-8 w-8" />,
  crystal: <Gem className="h-7 w-7" />,
  palm: <PalmTree className="h-8 w-8" />,
  mushroom: <Mushroom className="h-6 w-6" />,
  npc: <Users className="h-7 w-7" />,
};

const OBJECT_COLORS: Partial<Record<IslandObjectType, string>> = {
  flower: 'text-pink-300',
  tree: 'text-green-900',
  butterfly: 'text-purple-300',
  leaf: 'text-green-700',
  cabin: 'text-amber-800',
  bridge: 'text-amber-700',
  statue: 'text-stone-700',
  campfire: 'text-orange-500',
  waterfall: 'text-cyan-500',
  ruins: 'text-stone-600',
  cave: 'text-slate-800',
  temple: 'text-yellow-700',
  village: 'text-orange-800',
  treasure: 'text-yellow-400',
  crystal: 'text-purple-500',
  palm: 'text-green-800',
  mushroom: 'text-red-500',
  npc: 'text-indigo-700',
};

function zoneStyle(zone: IslandZone) {
  return {
    left: `${zone.x}%`,
    top: `${zone.y}%`,
    width: `${zone.width}%`,
    height: `${zone.height}%`,
  };
}

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

  const [selectedZone, setSelectedZone] = useState<string | null>(
    activeZone?.id ?? null
  );

  const [selectedObject, setSelectedObject] = useState<string | null>(null);

  const currentZone = useMemo(
    () =>
      zones.find((zone) => zone.id === selectedZone) ??
      activeZone,
    [zones, selectedZone, activeZone]
  );

  if (isLoading) {
    return (
      <section className="card-calm overflow-hidden rounded-3xl p-6">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <Sparkles className="mx-auto mb-3 h-8 w-8 animate-pulse text-primary" />

            <p className="text-sm text-muted-foreground">
              Explorando la isla...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-3xl
        border
        border-white/10
        bg-slate-950
        shadow-2xl
      "
    >
      {/* =========================================================
          CABECERA
      ========================================================== */}

      <div
        className="
          relative
          z-30
          flex
          flex-col
          gap-4
          border-b
          border-white/10
          bg-black/30
          p-5
          backdrop-blur-md
          md:flex-row
          md:items-center
          md:justify-between
        "
      >
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-300" />

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Mundo descubierto
            </p>
          </div>

          <h2 className="mt-1 text-2xl font-bold text-white">
            {currentZone?.name ?? 'La Isla'}
          </h2>

          <p className="mt-1 max-w-xl text-sm text-white/60">
            {currentZone?.description ??
              'Explora la isla y descubre sus secretos.'}
          </p>
        </div>

        <div className="flex gap-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
            <p className="text-[9px] uppercase tracking-widest text-white/50">
              Nivel
            </p>

            <p className="text-xl font-bold text-white">
              {metrics.level}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-center">
            <p className="text-[9px] uppercase tracking-widest text-emerald-200/70">
              Exploración
            </p>

            <p className="text-xl font-bold text-emerald-300">
              {metrics.progress}%
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================
          MAPA
      ========================================================== */}

      <div className="relative min-h-[620px] overflow-hidden">

        {/* CIELO */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-sky-400
            via-sky-300
            to-emerald-200
          "
        />

        {/* SOL */}

        <div
          className="
            absolute
            right-[10%]
            top-[8%]
            z-[1]
            h-16
            w-16
            rounded-full
            bg-yellow-100
            opacity-80
            shadow-[0_0_60px_rgba(255,240,150,0.8)]
          "
        />

        {/* NUBES */}

        <div className="absolute left-[8%] top-[10%] z-[2] text-5xl opacity-50">
          ☁️
        </div>

        <div className="absolute right-[28%] top-[15%] z-[2] text-6xl opacity-40">
          ☁️
        </div>

        <div className="absolute left-[45%] top-[6%] z-[2] text-4xl opacity-30">
          ☁️
        </div>

        {/* =======================================================
            MAR
        ======================================================== */}

        <div
          className="
            absolute
            bottom-0
            left-0
            right-0
            h-[42%]
            bg-gradient-to-b
            from-cyan-400
            via-sky-500
            to-blue-700
          "
        >
          <div
            className="
              absolute
              inset-0
              opacity-30
              [background-image:repeating-linear-gradient(
                0deg,
                transparent,
                transparent_28px,
                rgba(255,255,255,0.35)_30px
              )]
            "
          />

          <div className="absolute left-[10%] top-[35%] text-3xl opacity-50">
            🌊
          </div>

          <div className="absolute left-[45%] top-[55%] text-2xl opacity-40">
            🌊
          </div>

          <div className="absolute right-[12%] top-[25%] text-3xl opacity-50">
            🌊
          </div>
        </div>

        {/* =======================================================
            ISLA
        ======================================================== */}

        <div
          className="
            absolute
            left-[3%]
            right-[3%]
            top-[22%]
            h-[53%]
            rounded-[48%]
            bg-gradient-to-br
            from-lime-200
            via-emerald-300
            to-emerald-700
            shadow-[0_35px_90px_rgba(0,0,0,0.35)]
          "
        />

        {/* VEGETACIÓN BASE */}

        <div className="pointer-events-none absolute left-[8%] top-[30%] z-[3] text-3xl opacity-70">
          🌴
        </div>

        <div className="pointer-events-none absolute left-[18%] top-[45%] z-[3] text-2xl opacity-60">
          🌳
        </div>

        <div className="pointer-events-none absolute left-[78%] top-[35%] z-[3] text-3xl opacity-60">
          🌴
        </div>

        <div className="pointer-events-none absolute right-[15%] top-[55%] z-[3] text-3xl opacity-60">
          🌳
        </div>

        {/* =======================================================
            ZONAS
        ======================================================== */}

        {zones.map((zone) => {
          const status = zoneStatuses.get(zone.id);

          const locked = status === 'locked';
          const active = status === 'active';
          const selected = selectedZone === zone.id;

          return (
            <button
              key={zone.id}
              type="button"
              disabled={locked}
              onClick={() => {
                if (!locked) {
                  setSelectedZone(zone.id);
                }
              }}
              className={`
                absolute
                z-10
                -translate-x-0
                overflow-hidden
                rounded-3xl
                border
                text-left
                shadow-xl
                transition-all
                duration-300
                ${
                  locked
                    ? `
                      cursor-not-allowed
                      border-black/20
                      bg-black/35
                      opacity-55
                      grayscale
                    `
                    : `
                      cursor-pointer
                      bg-black/15
                      hover:scale-[1.02]
                      hover:bg-black/20
                    `
                }
                ${
                  active
                    ? 'border-white/80 ring-2 ring-emerald-300/60'
                    : ''
                }
                ${
                  selected && !locked
                    ? 'ring-2 ring-yellow-200/70'
                    : ''
                }
              `}
              style={zoneStyle(zone)}
            >
              {/* NIEBLA DE ZONA BLOQUEADA */}

              {locked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/55 backdrop-blur-[2px]">
                  <Lock className="mb-2 h-7 w-7 text-white/70" />

                  <span className="text-center text-xs font-bold text-white/80">
                    Zona bloqueada
                  </span>

                  <span className="mt-1 text-[10px] text-white/50">
                    Nivel {zone.unlockLevel}
                  </span>
                </div>
              )}

              {/* NOMBRE */}

              {!locked && (
                <div className="absolute bottom-2 left-2 right-2 rounded-xl bg-black/45 px-3 py-2 backdrop-blur-sm">
                  <p className="text-xs font-bold text-white">
                    {zone.name}
                  </p>

                  {active && (
                    <p className="mt-0.5 text-[9px] uppercase tracking-wider text-emerald-300">
                      Zona actual
                    </p>
                  )}
                </div>
              )}
            </button>
          );
        })}

        {/* =======================================================
            OBJETOS DE LA ISLA
        ======================================================== */}

        {islandObjects.map((object) => {
          const icon = OBJECT_ICONS[object.type];

          if (!icon) return null;

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
                drop-shadow-[0_5px_5px_rgba(0,0,0,0.35)]
                transition-all
                duration-300
                hover:scale-125
                ${OBJECT_COLORS[object.type] ?? 'text-white'}
                ${
                  selected
                    ? 'scale-125 bg-white/30 ring-2 ring-white'
                    : ''
                }
              `}
              style={{
                left: `${object.x}%`,
                top: `${object.y}%`,
              }}
              title={object.label ?? object.type}
            >
              {icon}

              {selected && object.label && (
                <span
                  className="
                    absolute
                    left-1/2
                    top-full
                    mt-2
                    -translate-x-1/2
                    whitespace-nowrap
                    rounded-lg
                    bg-black/80
                    px-2
                    py-1
                    text-[10px]
                    text-white
                  "
                >
                  {object.label}
                </span>
              )}
            </button>
          );
        })}

        {/* =======================================================
            DECORACIÓN / PARTÍCULAS
        ======================================================== */}

        <div className="pointer-events-none absolute left-[32%] top-[35%] z-[15] animate-pulse text-lg">
          ✨
        </div>

        <div className="pointer-events-none absolute left-[61%] top-[42%] z-[15] animate-pulse text-sm">
          ✨
        </div>

        <div className="pointer-events-none absolute left-[50%] top-[27%] z-[15] animate-bounce text-sm opacity-60">
          🍃
        </div>

        <div className="pointer-events-none absolute left-[70%] top-[25%] z-[15] text-sm opacity-50">
          🍃
        </div>

        {/* =======================================================
            MISTERIO DE LA ZONA
        ======================================================== */}

        {currentZone?.mystery && (
          <div
            className="
              absolute
              bottom-5
              left-1/2
              z-30
              w-[90%]
              max-w-lg
              -translate-x-1/2
            "
          >
            <div
              className="
                rounded-2xl
                border
                border-white/20
                bg-black/65
                px-5
                py-4
                text-center
                shadow-2xl
                backdrop-blur-xl
              "
            >
              <div className="mb-1 flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-300" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-yellow-200">
                  Misterio de la región
                </span>
              </div>

              <p className="text-sm italic text-white/80">
                “{currentZone.mystery}”
              </p>
            </div>
          </div>
        )}

        {/* =======================================================
            DESCUBRIMIENTO
        ======================================================== */}

        {discovery?.isNew && (
          <div
            className="
              absolute
              left-1/2
              top-6
              z-40
              w-[90%]
              max-w-md
              -translate-x-1/2
            "
          >
            <div
              className="
                rounded-3xl
                border
                border-yellow-200/30
                bg-black/75
                p-5
                text-center
                text-white
                shadow-2xl
                backdrop-blur-xl
              "
            >
              <Sparkles className="mx-auto mb-2 h-7 w-7 text-yellow-300" />

              <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-300">
                Nueva región descubierta
              </p>

              <h3 className="mt-1 text-2xl font-bold">
                {discovery.zone.name}
              </h3>

              <p className="mt-2 text-xs text-white/60">
                Una nueva parte de la isla se ha revelado ante ti.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================
          BARRA DE REGIONES
      ========================================================== */}

      <div className="border-t border-white/10 bg-black/40 p-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/40">
          Regiones de la isla
        </p>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {zones.map((zone) => {
            const status = zoneStatuses.get(zone.id);
            const locked = status === 'locked';
            const active = status === 'active';

            return (
              <button
                key={zone.id}
                type="button"
                disabled={locked}
                onClick={() => !locked && setSelectedZone(zone.id)}
                className={`
                  shrink-0
                  rounded-xl
                  border
                  px-3
                  py-2
                  text-left
                  transition-colors
                  ${
                    locked
                      ? 'cursor-not-allowed border-white/5 bg-white/5 opacity-40'
                      : active
                        ? 'border-emerald-300/50 bg-emerald-400/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  {locked ? (
                    <Lock className="h-3 w-3 text-white/40" />
                  ) : (
                    <MapPin className="h-3 w-3 text-emerald-300" />
                  )}

                  <p className="text-xs font-semibold text-white">
                    {zone.name}
                  </p>
                </div>

                <p className="mt-1 text-[9px] text-white/40">
                  {locked
                    ? `Desbloquea en nivel ${zone.unlockLevel}`
                    : active
                      ? 'Zona actual'
                      : 'Descubierta'}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
