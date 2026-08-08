import type { IslandZone } from '@/types/island';

export const ISLAND_ZONES: IslandZone[] = [
  {
    id: 'shore',
    name: 'La Orilla',
    description:
      'El primer territorio de la isla. Aquí comienza tu aventura.',
    unlockLevel: 1,
    x: 5,
    y: 55,
    width: 30,
    height: 35,
    mystery: '¿Qué habrá más allá de la línea de árboles?',
  },

  {
    id: 'east-coast',
    name: 'Costa Oriental',
    description:
      'Una costa escondida entre palmeras y pequeñas lagunas.',
    unlockLevel: 2,
    x: 30,
    y: 42,
    width: 28,
    height: 38,
    mystery: 'Se dice que existe una antigua construcción cerca del agua.',
  },

  {
    id: 'western-forest',
    name: 'Bosque Occidental',
    description:
      'Un bosque antiguo donde aparecen criaturas y senderos desconocidos.',
    unlockLevel: 3,
    x: 5,
    y: 18,
    width: 30,
    height: 38,
    mystery: 'Alguien dejó huellas entre los árboles.',
  },

  {
    id: 'western-village',
    name: 'Aldea Occidental',
    description:
      'Una pequeña región habitada que parece haber estado abandonada durante años.',
    unlockLevel: 4,
    x: 35,
    y: 15,
    width: 28,
    height: 30,
    mystery: '¿Quién construyó estas casas?',
  },

  {
    id: 'island-interior',
    name: 'Interior de la Isla',
    description:
      'Una región mucho más profunda, llena de vegetación y caminos ocultos.',
    unlockLevel: 5,
    x: 58,
    y: 20,
    width: 30,
    height: 35,
    mystery: 'Hay símbolos extraños grabados en las piedras.',
  },

  {
    id: 'mountains',
    name: 'Montañas Perdidas',
    description:
      'Una cadena montañosa que domina el centro de la isla.',
    unlockLevel: 6,
    x: 62,
    y: 55,
    width: 30,
    height: 35,
    mystery: 'Una luz aparece algunas noches en la montaña.',
  },

  {
    id: 'hidden-tribe',
    name: 'Pueblo Oculto',
    description:
      'Una comunidad escondida en lo más profundo de la isla.',
    unlockLevel: 7,
    x: 38,
    y: 52,
    width: 25,
    height: 35,
    mystery:
      'Los habitantes conocen la historia que dio origen a la isla.',
  },

  {
    id: 'ancient-ruins',
    name: 'Ruinas Antiguas',
    description:
      'Restos de una civilización desconocida.',
    unlockLevel: 8,
    x: 65,
    y: 10,
    width: 28,
    height: 30,
    mystery:
      'Las ruinas parecen representar un mapa de toda la isla.',
  },

  {
    id: 'volcano',
    name: 'Volcán Dormido',
    description:
      'Una zona peligrosa rodeada de lava y antiguas estructuras.',
    unlockLevel: 9,
    x: 65,
    y: 40,
    width: 30,
    height: 40,
    mystery:
      'En el interior existe una cámara que nadie ha logrado abrir.',
  },

  {
    id: 'sanctuary',
    name: 'Santuario Celestial',
    description:
      'El lugar más misterioso descubierto hasta ahora.',
    unlockLevel: 10,
    x: 35,
    y: 5,
    width: 30,
    height: 25,
    mystery:
      'Tal vez aquí se encuentre el secreto de la isla.',
  },
];

export function zoneForLevel(level: number): IslandZone {
  const available = ISLAND_ZONES.filter(
    (zone) => zone.unlockLevel <= level
  );

  return available[available.length - 1] ?? ISLAND_ZONES[0];
}
