import { useState, useEffect, useMemo } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAcademicWorld } from '@/hooks/useAcademicWorld';
import { calculateLevel } from '@/hooks/useLeaderboard';
import { useAuth } from '@/hooks/useAuth';

export type IslandTheme = 'spring' | 'midnight' | 'autumn' | 'tropical';

export interface UnlockedElement {
  id: string;
  type: 'flower' | 'tree' | 'butterfly' | 'mushroom' | 'crystal' | 'bridge' | 'cabin' | 'waterfall' | 'statue' | 'sprout' | 'rock' | 'bush' | 'arch' | 'sanctuary';
  label: string;
  unlockedBy: string;
  xpRequired: number;
  x: number;
  y: number;
}

const XP_UNLOCKS: Array<{
  id: string;
  type: UnlockedElement['type'];
  xpRequired: number;
  label: string;
  unlockedBy: string;
  x: number;
  y: number;
}> = [
  { id: 'sprout-0',    type: 'sprout',    xpRequired: 0,     label: 'Pequeño Brote',      unlockedBy: 'Comenzar tu viaje', x: 400, y: 290 },
  { id: 'flower-1',   type: 'flower',    xpRequired: 50,    label: 'Primera Flor',        unlockedBy: '50 XP acumulados',   x: 340, y: 270 },
  { id: 'flower-2',   type: 'flower',    xpRequired: 100,   label: 'Segunda Flor',        unlockedBy: '100 XP acumulados',  x: 460, y: 265 },
  { id: 'rock-1',     type: 'rock',      xpRequired: 100,   label: 'Piedra Mágica',       unlockedBy: '100 XP acumulados',  x: 310, y: 300 },
  { id: 'bush-1',     type: 'bush',      xpRequired: 200,   label: 'Arbusto Silvestre',   unlockedBy: '200 XP acumulados',  x: 480, y: 280 },
  { id: 'mushroom-1', type: 'mushroom',  xpRequired: 350,   label: 'Champiñón Encantado', unlockedBy: '350 XP acumulados',  x: 360, y: 310 },
  { id: 'tree-1',     type: 'tree',      xpRequired: 500,   label: 'Árbol Joven',         unlockedBy: '500 XP acumulados',  x: 280, y: 240 },
  { id: 'butterfly-1',type: 'butterfly', xpRequired: 750,   label: 'Mariposa Libre',      unlockedBy: '750 XP acumulados',  x: 500, y: 240 },
  { id: 'tree-2',     type: 'tree',      xpRequired: 1000,  label: 'Segundo Árbol',       unlockedBy: '1000 XP acumulados', x: 530, y: 235 },
  { id: 'waterfall-1',type: 'waterfall', xpRequired: 1500,  label: 'Cascada Cristalina',  unlockedBy: '1500 XP acumulados', x: 600, y: 260 },
  { id: 'cabin-1',    type: 'cabin',     xpRequired: 2000,  label: 'Cabaña del Sabio',    unlockedBy: '2000 XP acumulados', x: 260, y: 255 },
  { id: 'bridge-1',   type: 'bridge',    xpRequired: 3000,  label: 'Puente de Luz',       unlockedBy: '3000 XP acumulados', x: 440, y: 320 },
  { id: 'crystal-1',  type: 'crystal',   xpRequired: 4000,  label: 'Cristal Arcano',      unlockedBy: '4000 XP acumulados', x: 350, y: 250 },
  { id: 'statue-1',   type: 'statue',    xpRequired: 5500,  label: 'Estatua Ancestral',   unlockedBy: '5500 XP acumulados', x: 560, y: 245 },
  { id: 'arch-1',     type: 'arch',      xpRequired: 8000,  label: 'Arco Mágico',         unlockedBy: '8000 XP acumulados', x: 390, y: 235 },
  { id: 'sanctuary-1',type: 'sanctuary', xpRequired: 12000, label: 'Santuario Eterno',    unlockedBy: '12000 XP acumulados',x: 400, y: 225 },
];

const STAGE_NAMES = ['Semilla', 'Primeros Brotes', 'Jardín Floreciente', 'Isla en Expansión', 'Paraíso Floreciente'];

function levelToStage(level: number): number {
  if (level <= 2) return 1;
  if (level <= 4) return 2;
  if (level <= 6) return 3;
  if (level <= 8) return 4;
  return 5;
}

const THEMES: Record<IslandTheme, { unlockLevel: number; name: string; emoji: string }> = {
  spring:   { unlockLevel: 1, name: 'Primavera',      emoji: '🌸' },
  midnight: { unlockLevel: 5, name: 'Magia Nocturna', emoji: '🌙' },
  autumn:   { unlockLevel: 7, name: 'Otoño',          emoji: '🍂' },
  tropical: { unlockLevel: 9, name: 'Tropical',       emoji: '🌺' },
};

export function useIslandProgression() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { world } = useAcademicWorld();

  const userId = user?.id ?? 'guest';
  const seenKey = `fb-island-seen-${userId}`;
  const themeKey = `fb-island-theme-${userId}`;

  // Combine XP from both sources
  const profileXp = profile?.totalPoints ?? 0;
  const worldXp = world?.profile?.xp ?? 0;
  const xp = Math.max(profileXp, worldXp);

  const levelInfo = calculateLevel(xp);
  const level = levelInfo.level;
  const stage = levelToStage(level);
  const stageName = STAGE_NAMES[stage - 1];

  // Unlocked elements
  const unlockedElements = useMemo<UnlockedElement[]>(
    () => XP_UNLOCKS.filter(e => xp >= e.xpRequired),
    [xp]
  );

  // Track newly unlocked elements
  const [seenIds, setSeenIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(seenKey);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });

  const newlyUnlockedIds = useMemo(
    () => unlockedElements.filter(e => !seenIds.has(e.id)).map(e => e.id),
    [unlockedElements, seenIds]
  );

  // Mark all current unlocks as seen after mount
  useEffect(() => {
    if (newlyUnlockedIds.length === 0) return;
    const timer = setTimeout(() => {
      const updated = new Set([...seenIds, ...newlyUnlockedIds]);
      setSeenIds(updated);
      localStorage.setItem(seenKey, JSON.stringify([...updated]));
    }, 3000);
    return () => clearTimeout(timer);
  }, [newlyUnlockedIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  // Next unlock threshold
  const xpToNextUnlock = useMemo(() => {
    const next = XP_UNLOCKS.find(e => e.xpRequired > xp);
    return next ? next.xpRequired - xp : 0;
  }, [xp]);

  // Theme
  const [selectedTheme, setSelectedThemeState] = useState<IslandTheme>(() => {
    try {
      const raw = localStorage.getItem(themeKey) as IslandTheme | null;
      return raw && THEMES[raw] ? raw : 'spring';
    } catch {
      return 'spring';
    }
  });

  const setTheme = (theme: IslandTheme) => {
    const info = THEMES[theme];
    if (!info || info.unlockLevel > level) return;
    setSelectedThemeState(theme);
    localStorage.setItem(themeKey, theme);
  };

  return {
    xp,
    level,
    stage,
    stageName,
    levelInfo,
    unlockedElements,
    newlyUnlockedIds,
    xpToNextUnlock,
    selectedTheme,
    setTheme,
    allUnlocks: XP_UNLOCKS,
    themes: THEMES,
  };
}
