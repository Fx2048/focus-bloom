import { useState, useEffect } from 'react';
import { ISLAND_THEMES } from './useIslandProgression';
import type { IslandTheme } from './useIslandProgression';
import { Lock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IslandThemeSelectorProps {
  level: number;
  selectedTheme: IslandTheme;
  onSelect: (theme: IslandTheme) => void;
}

export function IslandThemeSelector({ level, selectedTheme, onSelect }: IslandThemeSelectorProps) {
  const [active, setActive] = useState<IslandTheme>(selectedTheme);

  // Listen for external theme changes (from localStorage dispatch)
  useEffect(() => {
    setActive(selectedTheme);
  }, [selectedTheme]);

  const handleSelect = (id: IslandTheme, unlockLevel: number) => {
    if (level < unlockLevel) return;
    setActive(id);
    onSelect(id);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Personaliza el aspecto visual de tu isla. Desbloquea nuevos temas al alcanzar niveles más altos.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {ISLAND_THEMES.map((theme) => {
          const isUnlocked = level >= theme.unlockLevel;
          const isActive = active === theme.id;

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => handleSelect(theme.id, theme.unlockLevel)}
              disabled={!isUnlocked}
              className={cn(
                'relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all',
                isActive && isUnlocked
                  ? 'border-primary bg-primary/10 shadow-md'
                  : isUnlocked
                  ? 'border-border bg-card hover:border-primary/40 hover:bg-primary/5'
                  : 'cursor-not-allowed border-border/30 bg-muted/30 opacity-50'
              )}
            >
              {/* Preview sky strip */}
              <div
                className="h-12 w-full rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${theme.sky[0]}, ${theme.sky[1]})`,
                }}
              >
                <div
                  className="flex h-full items-end justify-center pb-1"
                  style={{
                    background: `linear-gradient(to bottom, transparent 40%, ${theme.grass[0]}CC)`,
                    borderRadius: '0.75rem',
                  }}
                >
                  <span className="text-xs font-bold text-white drop-shadow">{theme.emoji}</span>
                </div>
              </div>

              <p className="text-sm font-bold text-foreground">{theme.name}</p>

              {isUnlocked ? (
                isActive ? (
                  <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                    <Check className="h-3 w-3" />
                    Activo
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Disponible</p>
                )
              ) : (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  Nivel {theme.unlockLevel}
                </div>
              )}

              {isActive && isUnlocked && (
                <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {level < 5 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-center dark:border-amber-800 dark:bg-amber-950/30">
          <p className="text-xs text-amber-700 dark:text-amber-300">
            🌟 Alcanza el Nivel 5 para desbloquear nuevos temas visuales
          </p>
        </div>
      )}
    </div>
  );
}

