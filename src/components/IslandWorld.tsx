import { useMemo } from 'react';
import {
  Lock,
  Map as MapIcon,
  Sparkles,
  Trees,
  Waves,
  Compass,
} from 'lucide-react';

import { useIslandExploration } from '@/hooks/useIslandExploration';
import type { IslandObject } from '@/types/island';

interface IslandWorldProps {
  onObjectClick?: (object: IslandObject) => void;
}

const OBJECT_EMOJIS: Record<string, string> = {
  flower: '🌸',
  tree: '🌳',
  butterfly: '🦋',
  leaf: '🍃',
  cabin: '🏡',
  bridge: '🌉',
  statue: '🗿',
  campfire: '🔥',
  waterfall: '💧',
  ruins: '🏛️',
  cave: '🕳️',
  temple: '⛩️',
  village: '🏘️',
  treasure: '💎',
  crystal: '🔮',
  palm: '🌴',
  mushroom: '🍄',
  npc: '🧙',
};

const ZONE_EMOJIS: Record<string, string> = {
  shore: '🏖️',
  'east-coast': '🌴',
  'western-forest': '🌲',
  'western-village': '🏘️',
  'island-interior': '🌳',
  mountains: '🏔️',
  'hidden-tribe': '🛖',
  'ancient-ruins': '🏛️',
  volcano: '🌋',
  sanctuary: '✨',
};

export function IslandWorld({ onObjectClick }: IslandWorldProps) {
  const {
    metrics,
    zones,
    zoneStatuses,
    activeZone,
    islandObjects,
    discovery,
    isLoading,
  } = useIslandExploration();

  const visibleZones = useMemo(
    () =>
      zones.filter(
        (zone) => zoneStatuses.get(zone.id) !== 'locked'
      ),
    [zones, zoneStatuses]
  );

  const objectsByZone = useMemo(() => {
    const map = new Map<string, IslandObject[]>();

    for (const object of islandObjects) {
      const zoneId = object.zoneId ?? 'shore';

      if (!map.has(zoneId)) {
        map.set(zoneId, []);
      }

      map.get(zoneId)!.push(object);
    }

    return map;
  }, [islandObjects]);

  if (isLoading) {
    return (
      <section className="relative min-h-[560px] overflow-hidden rounded-[32px] border border-white/10 bg-slate-900">
        <div className="flex min-h-[560px] items-center justify-center text-white">
          <div className="flex flex-col items-center gap-3">
            <Sparkles className="h-8 w-8 animate-pulse text-emerald-300" />
            <p className="text-sm opacity-80">
              Descubriendo la isla...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative min-h-[560px] overflow-hidden rounded-[32px] border border-white/10 shadow-2xl"
      aria-label="Mundo de la isla"
    >
      {/* FONDO DEL MUNDO */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-200" />

      {/* CIELO */}
      <div className="absolute inset-x-0 top-0 h-[45%] overflow-hidden">
        <div className="absolute left-[8%] top-[12%] text-5xl opacity-80">
          ☁️
        </div>

        <div className="absolute right-[12%] top-[18%] text-6xl opacity-70">
          ☁️
        </div>

        <div className="absolute left-[45%] top-[8%] text-5xl opacity-60">
          ☁️
        </div>

        <div className="absolute right-[25%] top-[8%] text-6xl">
          ☀️
        </div>
      </div>

      {/* MAR */}
      <div className="absolute bottom-0 left-0 right-0 h-[38%] bg-gradient-to-b from-cyan-400/80 to-blue-500/90">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute left-[5%] top-[20%] text-4xl">
            🌊
          </div>

          <div className="absolute left-[35%] top-[45%] text-4xl">
            🌊
          </div>

          <div className="absolute right-[15%] top-[25%] text-4xl">
            🌊
          </div>
        </div>
      </div>

      {/* ISLA PRINCIPAL */}
      <div className="absolute bottom-[17%] left-[4%] right-[4%] top-[20%]">
        <div className="absolute inset-0 rounded-[45%] bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-800 shadow-[0_30px_80px_rgba(0,0,0,0.35)]" />

        {/* VEGETACIÓN BASE */}
        <div className="absolute inset-0 overflow-hidden rounded-[45%]">
          <div className="absolute left-[10%] top-[15%] text-4xl opacity-60">
            🌿
          </div>

          <div className="absolute left-[22%] top-[65%] text-3xl opacity-60">
            🌿
          </div>

          <div className="absolute right-[15%] top-[30%] text-4xl opacity-60">
            🌿
          </div>

          <div className="absolute right-[25%] bottom-[15%] text-3xl opacity-60">
            🌿
          </div>
        </div>

        {/* ZONAS */}
        {visibleZones.map((zone) => {
          const status = zoneStatuses.get(zone.id);
          const isActive = zone.id === activeZone.id;

          const zoneObjects =
            objectsByZone.get(zone.id) ?? [];

          return (
            <div
              key={zone.id}
              className={[
                'absolute overflow-hidden rounded-[32px]',
                'transition-all duration-700',
                isActive
                  ? 'ring-4 ring-yellow-300/80 shadow-2xl'
                  : '',
              ].join(' ')}
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.width}%`,
                height: `${zone.height}%`,
              }}
            >
              {/* TERRENO DE LA ZONA */}
              <div
                className={[
                  'absolute inset-0',
                  'bg-gradient-to-br',
                  zone.id === 'shore'
                    ? 'from-yellow-200 via-amber-100 to-cyan-200'
                    : 'from-emerald-400/80 via-green-500/80 to-emerald-700/80',
                ].join(' ')}
              />

              {/* OBJETOS */}
              {zoneObjects.map((object) => (
                <button
                  key={object.id}
                  type="button"
                  onClick={() => onObjectClick?.(object)}
                  className="absolute z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center transition-transform duration-300 hover:scale-125"
                  style={{
                    left: `${object.x}%`,
                    top: `${object.y}%`,
                  }}
                  title={object.label ?? object.type}
                >
                  <span
                    className={[
                      'text-3xl drop-shadow-lg',
                      object.type === 'butterfly'
                        ? 'animate-bounce'
                        : '',
                    ].join(' ')}
                  >
                    {OBJECT_EMOJIS[object.type] ?? '✨'}
                  </span>

                  {object.label && (
                    <span className="mt-1 max-w-[120px] truncate rounded-full bg-black/50 px-2 py-0.5 text-[9px] text-white backdrop-blur-sm">
                      {object.label}
                    </span>
                  )}
                </button>
              ))}

              {/* NOMBRE DE ZONA */}
              <div className="absolute bottom-2 left-2 z-30">
                <div className="rounded-xl bg-black/40 px-2.5 py-1.5 text-white backdrop-blur-md">
                  <div className="flex items-center gap-1.5">
                    <span>
                      {ZONE_EMOJIS[zone.id] ?? '🗺️'}
                    </span>

                    <span className="text-[10px] font-bold">
                      {zone.name}
                    </span>
                  </div>

                  {isActive && (
                    <p className="mt-0.5 text-[8px] text-emerald-200">
                      Explorando
                    </p>
                  )}
                </div>
              </div>

              {/* ZONA ACTIVA */}
              {isActive && (
                <div className="pointer-events-none absolute inset-0 rounded-[32px] border-2 border-yellow-200/60" />
              )}
            </div>
          );
        })}
      </div>

      {/* NIEBLA SOBRE ZONAS BLOQUEADAS */}
      <div className="pointer-events-none absolute inset-0">
        {zones
          .filter(
            (zone) => zoneStatuses.get(zone.id) === 'locked'
          )
          .map((zone) => (
            <div
              key={`fog-${zone.id}`}
              className="absolute rounded-[32px] bg-slate-900/55 backdrop-blur-[2px]"
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.width}%`,
                height: `${zone.height}%`,
              }}
            >
              <div className="flex h-full items-center justify-center">
                <div className="rounded-2xl bg-black/50 px-4 py-3 text-center text-white backdrop-blur-md">
                  <Lock className="mx-auto mb-1 h-5 w-5" />

                  <p className="text-[10px] font-bold">
                    ZONA DESCONOCIDA
                  </p>

                  <p className="mt-1 text-[9px] opacity-70">
                    Nivel {zone.unlockLevel}
                  </p>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* HUD SUPERIOR */}
      <div className="absolute left-5 right-5 top-5 z-50 flex items-start justify-between gap-3">
        <div className="rounded-2xl border border-white/20 bg-black/35 px-4 py-3 text-white shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Map className="h-4 w-4 text-emerald-300" />

            <span className="text-xs font-semibold uppercase tracking-widest">
              Mundo de la isla
            </span>
          </div>

          <p className="mt-1 text-lg font-bold">
            {activeZone.name}
          </p>

          <p className="max-w-[280px] text-[10px] text-white/70">
            {activeZone.description}
          </p>
        </div>

        <div className="flex gap-2">
          <div className="rounded-2xl border border-white/20 bg-black/35 px-3 py-2 text-white backdrop-blur-md">
            <div className="flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-yellow-300" />

              <span className="text-xs font-bold">
                {metrics.level}
              </span>
            </div>

            <p className="text-[8px] uppercase opacity-60">
              Nivel
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-black/35 px-3 py-2 text-white backdrop-blur-md">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-purple-300" />

              <span className="text-xs font-bold">
                {metrics.xp}
              </span>
            </div>

            <p className="text-[8px] uppercase opacity-60">
              XP
            </p>
          </div>
        </div>
      </div>

      {/* BANNER DE DESCUBRIMIENTO */}
      {discovery?.isNew && (
        <div className="absolute bottom-5 left-1/2 z-50 -translate-x-1/2">
          <div className="animate-fade-in rounded-2xl border border-yellow-200/40 bg-black/65 px-5 py-3 text-center text-white shadow-2xl backdrop-blur-lg">
            <div className="mb-1 flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-300" />

              <span className="text-xs font-bold uppercase tracking-widest">
                ¡Nueva región descubierta!
              </span>

              <Sparkles className="h-4 w-4 text-yellow-300" />
            </div>

            <p className="text-lg font-bold">
              {discovery.zone.name}
            </p>

            <p className="mt-1 max-w-[320px] text-[10px] text-white/70">
              {discovery.zone.mystery}
            </p>
          </div>
        </div>
      )}

      {/* CONTADOR DE EXPLORACIÓN */}
      <div className="absolute bottom-5 right-5 z-50">
        <div className="rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-white backdrop-blur-md">
          <p className="text-[9px] uppercase tracking-widest opacity-60">
            Exploración
          </p>

          <p className="text-lg font-bold">
            {islandObjects.length}
          </p>

          <p className="text-[8px] opacity-60">
            descubrimientos
          </p>
        </div>
      </div>
    </section>
  );
}
