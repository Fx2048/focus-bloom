import { ISLAND_ELEMENTS } from './useIslandProgression';
import type { UnlockedElement } from './useIslandProgression';
import { Lock } from 'lucide-react';

interface IslandCollectionProps {
  xp: number;
  unlockedElements: UnlockedElement[];
}

const TYPE_CATEGORIES: Record<string, string> = {
  sprout: 'Plantas',
  flower: 'Flores',
  bush: 'Arbustos',
  mushroom: 'Hongos',
  tree: 'Árboles',
  butterfly: 'Criaturas',
  waterfall: 'Decoraciones',
  cabin: 'Construcciones',
  bridge: 'Construcciones',
  crystal: 'Objetos Mágicos',
  statue: 'Objetos Mágicos',
  arch: 'Objetos Mágicos',
  sanctuary: 'Objetos Mágicos',
};

const EMOJIS: Record<string, string> = {
  sprout: '🌱',
  flower: '🌸',
  bush: '🌿',
  mushroom: '🍄',
  tree: '🌳',
  butterfly: '🦋',
  waterfall: '💧',
  cabin: '🏠',
  bridge: '🌉',
  crystal: '💎',
  statue: '🗿',
  arch: '⛩️',
  sanctuary: '🏛️',
  rock: '🪨',
};

export function IslandCollection({ xp, unlockedElements }: IslandCollectionProps) {
  const unlockedIds = new Set(unlockedElements.map((e) => e.id));

  const categories = new Map<string, typeof ISLAND_ELEMENTS>();
  for (const el of ISLAND_ELEMENTS) {
    const cat = TYPE_CATEGORIES[el.type] ?? 'Otros';
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(el);
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Tu colección de descubrimientos. Cada elemento representa un logro académico real.
      </p>

      {Array.from(categories.entries()).map(([category, items]) => (
        <div key={category}>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {category}
          </h4>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {items.map((el) => {
              const unlocked = unlockedIds.has(el.id);
              return (
                <div
                  key={el.id}
                  className={[
                    'relative flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-all',
                    unlocked
                      ? 'border-primary/20 bg-primary/5 shadow-sm'
                      : 'border-border/40 bg-muted/30 opacity-60',
                  ].join(' ')}
                  title={unlocked ? el.label : `Necesitas ${el.xpRequired - xp} XP más`}
                >
                  <span className={['text-2xl', unlocked ? '' : 'grayscale opacity-40'].join(' ')}>
                    {EMOJIS[el.type] ?? '✨'}
                  </span>
                  <p className="text-[10px] font-semibold leading-tight text-foreground">
                    {el.label}
                  </p>
                  {!unlocked && (
                    <div className="flex items-center gap-0.5">
                      <Lock className="h-2.5 w-2.5 text-muted-foreground" />
                      <span className="text-[9px] text-muted-foreground">
                        {el.xpRequired} XP
                      </span>
                    </div>
                  )}
                  {unlocked && (
                    <span className="text-[9px] text-primary">Desbloqueado ✓</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center">
        <p className="text-sm font-bold text-primary">
          {unlockedElements.length} / {ISLAND_ELEMENTS.length} elementos desbloqueados
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {unlockedElements.length === ISLAND_ELEMENTS.length
            ? '🎉 ¡Colección completa! Eres una leyenda académica.'
            : `Necesitas ${ISLAND_ELEMENTS.filter(e => xp < e.xpRequired).reduce((min, e) => Math.min(min, e.xpRequired), Infinity) - xp} XP más para el próximo elemento`}
        </p>
      </div>
    </div>
  );
}

