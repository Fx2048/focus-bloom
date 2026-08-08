import type { IslandZone } from '@/types/island';

// El orden en este array ES el orden de exploración: cada zona se desbloquea
// cuando el nivel del jugador alcanza `unlockLevel`. El nivel actual (1-11)
// se calcula en useIslandExploration a partir del progreso de créditos real.
export const ISLAND_ZONES: IslandZone[] = [
  {
    id: 'orilla',
    name: 'La Orilla',
    unlockLevel: 1,
    description: 'Donde empieza todo. Arena, mar y las primeras materias.',
    icon: '🏖️',
    gradient: ['#F9C9DE', '#5FD0C9'],
  },
  {
    id: 'costa-este',
    name: 'Costa Oriental',
    unlockLevel: 2,
    description: 'Palmeras y los primeros cursos aprobados empiezan a notarse.',
    icon: '🌴',
    gradient: ['#FDCB8B', '#2FAFB0'],
  },
  {
    id: 'bosques-oeste',
    name: 'Bosques del Oeste',
    unlockLevel: 4,
    description: 'La vegetación se espesa a medida que avanza el ciclo.',
    icon: '🌲',
    gradient: ['#BFE3C9', '#3E8E63'],
  },
  {
    id: 'aldea',
    name: 'Aldea Occidental',
    unlockLevel: 5,
    description: 'Las primeras construcciones aparecen en el mapa.',
    icon: '🏡',
    gradient: ['#F6DDB0', '#C98A4B'],
  },
  {
    id: 'interior',
    name: 'Interior de la Isla',
    unlockLevel: 6,
    description: 'Terreno desconocido, más allá de la costa.',
    icon: '🗺️',
    gradient: ['#CDEAF0', '#5B8FA8'],
  },
  {
    id: 'montanas',
    name: 'Montañas y Ruinas',
    unlockLevel: 7,
    description: 'Restos de algo más antiguo que la propia isla.',
    icon: '🏔️',
    gradient: ['#E4D8F2', '#7C6A9E'],
  },
  {
    id: 'region-profunda',
    name: 'Región Profunda',
    unlockLevel: 9,
    description: 'Aquí se empiezan a encontrar señales de que no estás solo.',
    icon: '🛖',
    gradient: ['#D7E8C5', '#5B7A4C'],
  },
  {
    id: 'zona-prohibida',
    name: 'Zona Prohibida',
    unlockLevel: 11,
    description: 'El último territorio conocido de la isla.',
    icon: '🌋',
    gradient: ['#3A2540', '#8C3B2A'],
  },
];

export function zoneForLevel(level: number): IslandZone {
  // la última zona cuyo unlockLevel <= level es la zona "activa"
  let current = ISLAND_ZONES[0];
  for (const zone of ISLAND_ZONES) {
    if (zone.unlockLevel <= level) current = zone;
  }
  return current;
}
