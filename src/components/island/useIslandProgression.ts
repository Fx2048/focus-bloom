import { useState, useEffect, useMemo } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAcademicWorld } from '@/hooks/useAcademicWorld';
import { calculateLevel } from '@/hooks/useLeaderboard';
import { useAuth } from '@/hooks/useAuth';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type IslandTheme = 'spring' | 'midnight' | 'autumn' | 'tropical';

export interface IslandThemeConfig {
  id: IslandTheme;
  name: string;
  emoji: string;
  unlockLevel: number;
  sky: [string, string];
  grass: [string, string];
  accent: string;
}

export const ISLAND_THEMES: IslandThemeConfig[] = [
  { id: 'spring',   name: 'Primavera',      emoji: '🌸', unlockLevel: 1, sky: ['#c8e6ff','#e8d5f0'], grass: ['#7bc67e','#5a9e5e'], accent: '#ff9eb5' },
  { id: 'midnight', name: 'Magia Nocturna', emoji: '🌙', unlockLevel: 5, sky: ['#1a1a3e','#2d1b4e'], grass: ['#2d5a3d','#1a3d2a'], accent: '#a78bfa' },
  { id: 'autumn',   name: 'Otoño Dorado',   emoji: '🍂', unlockLevel: 7, sky: ['#ffd9a0','#ffb347'], grass: ['#8b6914','#a07c1a'], accent: '#ff6b35' },
  { id: 'tropical', name: 'Tropical',        emoji: '🌺', unlockLevel: 9, sky: ['#00d2ff','#3a7bd5'], grass: ['#00b09b','#96c93d'], accent: '#ffce00' },
];

export interface UnlockedElement {
  id: string;
  type: 'flower' | 'tree' | 'butterfly' | 'mushroom' | 'crystal' | 'bridge' | 'cabin' | 'waterfall' | 'statue' | 'sprout' | 'rock' | 'bush' | 'arch' | 'sanctuary';
  label: string;
  unlockedBy: string;
  xpRequired: number;
  x: number;
  y: number;
}

/* ------------------------------------------------------------------ */
/* Master list of unlockable elements (SVG coordinates 800x500 space) */
/* ------------------------------------------------------------------ */

export const ISLAND_ELEMENTS: UnlockedElement[] = [
  { id: 'sprout-0',    type: 'sprout',    xpRequired: 0,     label: 'Pequeño Brote',       unlockedBy: 'Comenzar tu viaje académico',    x: 400, y: 290 },
  { id: 'flower-1',   type: 'flower',    xpRequired: 50,    label: 'Rosa Silvestre',       unlockedBy: 'Primeros 50 XP acumulados',      x: 340, y: 272 },
  { id: 'flower-2',   type: 'flower',    xpRequired: 100,   label: 'Margarita',            unlockedBy: '100 XP de dedicación',           x: 460, y: 268 },
  { id: 'rock-1',     type: 'rock',      xpRequired: 100,   label: 'Piedra Mágica',        unlockedBy: '100 XP acumulados',              x: 318, y: 302 },
  { id: 'bush-1',     type: 'bush',      xpRequired: 200,   label: 'Arbusto Silvestre',    unlockedBy: '200 XP de constancia',           x: 478, y: 282 },
  { id: 'mushroom-1', type: 'mushroom',  xpRequired: 350,   label: 'Champiñón Encantado',  unlockedBy: '350 XP de esfuerzo',             x: 365, y: 312 },
  { id: 'tree-1',     type: 'tree',      xpRequired: 500,   label: 'Árbol Joven',          unlockedBy: '500 XP — Nivel 4 desbloqueado', x: 278, y: 245 },
  { id: 'butterfly-1',type: 'butterfly', xpRequired: 750,   label: 'Mariposa Libre',       unlockedBy: '750 XP de excelencia',           x: 508, y: 242 },
  { id: 'tree-2',     type: 'tree',      xpRequired: 1000,  label: 'Segundo Árbol',        unlockedBy: '1000 XP — Nivel 5',              x: 535, y: 238 },
  { id: 'waterfall-1',type: 'waterfall', xpRequired: 1500,  label: 'Cascada Cristalina',   unlockedBy: '1500 XP de perseverancia',       x: 610, y: 262 },
  { id: 'cabin-1',    type: 'cabin',     xpRequired: 2000,  label: 'Cabaña del Sabio',     unlockedBy: '2000 XP — Nivel 6',              x: 260, y: 258 },
  { id: 'bridge-1',   type: 'bridge',    xpRequired: 3000,  label: 'Puente de Luz',        unlockedBy: '3000 XP — Nivel 7',              x: 442, y: 322 },
  { id: 'crystal-1',  type: 'crystal',   xpRequired: 4000,  label: 'Cristal Arcano',       unlockedBy: '4000 XP — Maestro del saber',   x: 355, y: 252 },
  { id: 'statue-1',   type: 'statue',    xpRequired: 5500,  label: 'Estatua Ancestral',    unlockedBy: '5500 XP — Nivel 8 Leyenda',     x: 562, y: 248 },
  { id: 'arch-1',     type: 'arch',      xpRequired: 8000,  label: 'Arco Mágico',          unlockedBy: '8000 XP — Nivel 9 Titán',       x: 392, y: 238 },
  { id: 'sanctuary-1',type: 'sanctuary', xpRequired: 12000, label: 'Santuario Eterno',     unlockedBy: '12000 XP — Nivel 10 Inmortal',  x: 400, y: 228 },
];

/* ------------------------------------------------------------------ */
/* Stage mapping                                                        */
/* ------------------------------------------------------------------ */

export type IslandStage = 1 | 2 | 3 | 4 | 5;

interface StageInfo { stage: IslandStage; name: string; emoji: string }

function levelToStageInfo(level: number): StageInfo {
  if (level <= 2) return { stage: 1, name: 'Semilla',            emoji: '🌱' };
  if (level <= 4) return { stage: 2, name: 'Primeros Brotes',    emoji: '🌿' };
  if (level <= 6) return { stage: 3, name: 'Jardín Floreciente', emoji: '🌸' };
  if (level <= 8) return { stage: 4, name: 'Isla en Expansión',  emoji: '🌳' };
  return              { stage: 5, name: 'Paraíso Floreciente', emoji: '🌺' };
}

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

export function useIslandProgression() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { world } = useAcademicWorld();

  const userId = user?.id ?? 'guest';
  const seenKey  = `fb-island-seen-${userId}`;
  const themeKey = `fb-island-theme-${userId}`;

  // Combine XP from both sources
  const profileXp = (profile as any)?.xp ?? profile?.totalPoints ?? 0;
  const worldXp   = world?.profile?.xp ?? 0;
  const xp = Math.max(profileXp, worldXp);

  const levelInfo = calculateLevel(xp);
  const { level } = levelInfo;
  const stageInfo = levelToStageInfo(level);

  // Unlocked elements derived from xp
  const unlockedElements = useMemo<UnlockedElement[]>(
    () => ISLAND_ELEMENTS.filter(e => xp >= e.xpRequired),
    [xp]
  );

  // Track newly unlocked elements (string[])
  const [seenIds, setSeenIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(seenKey);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch { return new Set(); }
  });

  const newlyUnlockedIds = useMemo(
    () => unlockedElements.filter(e => !seenIds.has(e.id)).map(e => e.id),
    [unlockedElements, seenIds]
  );

  // After 3s mark new items as seen
  useEffect(() => {
    if (newlyUnlockedIds.length === 0) return;
    const timer = setTimeout(() => {
      const updated = new Set([...seenIds, ...newlyUnlockedIds]);
      setSeenIds(updated);
      localStorage.setItem(seenKey, JSON.stringify([...updated]));
    }, 3500);
    return () => clearTimeout(timer);
  }, [newlyUnlockedIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  // XP to next unlock
  const nextUnlock = useMemo(
    () => ISLAND_ELEMENTS.find(e => e.xpRequired > xp) ?? null,
    [xp]
  );
  const xpToNextUnlock = nextUnlock ? nextUnlock.xpRequired - xp : 0;

  // Unlocked themes
  const unlockedThemes = useMemo(
    () => ISLAND_THEMES.filter(t => level >= t.unlockLevel),
    [level]
  );

  // Selected theme (persisted)
  const [selectedThemeId, setSelectedThemeId] = useState<IslandTheme>(() => {
    try {
      const raw = localStorage.getItem(themeKey) as IslandTheme | null;
      return raw && ISLAND_THEMES.some(t => t.id === raw) ? raw : 'spring';
    } catch { return 'spring'; }
  });

  const selectedTheme: IslandThemeConfig = useMemo(() => {
    const found = ISLAND_THEMES.find(t => t.id === selectedThemeId && level >= t.unlockLevel);
    return found ?? ISLAND_THEMES[0];
  }, [selectedThemeId, level]);

  const setTheme = (theme: IslandTheme) => {
    const info = ISLAND_THEMES.find(t => t.id === theme);
    if (!info || info.unlockLevel > level) return;
    setSelectedThemeId(theme);
    localStorage.setItem(themeKey, theme);
  };

  return {
    xp,
    level,
    levelProgress:  levelInfo.progress,
    currentXp:      levelInfo.currentXp,
    nextLevelXp:    levelInfo.nextLevelXp,
    stage:          stageInfo.stage,
    stageName:      stageInfo.name,
    stageEmoji:     stageInfo.emoji,
    unlockedElements,
    newlyUnlockedIds,          // string[]
    nextUnlock,
    xpToNextUnlock,
    selectedTheme,             // IslandThemeConfig object
    unlockedThemes,
    setTheme,
    // Legacy aliases
    levelInfo,
    stageName_legacy: stageInfo.name,
    allUnlocks: ISLAND_ELEMENTS,
  };
}
