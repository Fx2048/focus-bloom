import { useState, useEffect } from 'react';
import { useProfile } from './useProfile';

const ISLAND_ZONES = [
  { id: 'beach', name: 'Playa Principal', required: 0, unlocked: true, reward: 'Puntos de Descanso +5' },
  { id: 'forest', name: 'Bosque Esmeralda', required: 5, unlocked: false, reward: 'Buff de Motivación' },
  { id: 'cave', name: 'Cueva de Conocimiento', required: 12, unlocked: false, reward: 'Ítem Legendario' },
  { id: 'peak', name: 'Mirador del Saber', required: 25, unlocked: false, reward: 'Logro Épico' },
];

export function useIslandExploration() {
  const { profile, addPoints } = useProfile();
  const [explorationPoints, setExplorationPoints] = useState(0);
  const [unlockedZones, setUnlockedZones] = useState(['beach']);
  const [currentZone, setCurrentZone] = useState('beach');

  // Al completar una tarea
  const completeTaskAndExplore = (taskId: string) => {
    const newPoints = explorationPoints + 1;
    setExplorationPoints(newPoints);

    // Desbloquear zonas nuevas
    const newlyUnlocked = ISLAND_ZONES.filter(
      zone => !unlockedZones.includes(zone.id) && newPoints >= zone.required
    );

    if (newlyUnlocked.length > 0) {
      const newUnlockedIds = newlyUnlocked.map(z => z.id);
      setUnlockedZones(prev => [...prev, ...newUnlockedIds]);
      
      // Dar recompensa visual
      alert(`¡Nueva zona desbloqueada! ${newlyUnlocked[0].name}`);
      // Aquí puedes disparar confeti o modal bonito
    }

    addPoints(10); // XP normal
  };

  return {
    explorationPoints,
    unlockedZones,
    currentZone,
    setCurrentZone,
    completeTaskAndExplore,
    zones: ISLAND_ZONES,
  };
}
