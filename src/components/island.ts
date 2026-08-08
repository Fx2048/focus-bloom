export type IslandObjectType =
  | 'flower'
  | 'tree'
  | 'butterfly'
  | 'cabin'
  | 'statue'
  | 'bridge';

export interface IslandObject {
  id: string;
  type: IslandObjectType;
  // posición dentro de la zona activa, en porcentaje (0-100)
  x: number;
  y: number;
  label?: string;
}

export interface IslandZone {
  id: string;
  name: string;
  /** Nivel del jugador (1-11) requerido para descubrir esta zona. */
  unlockLevel: number;
  description: string;
  /** Emoji usado como marcador en el mapa general y como fondo temático. */
  icon: string;
  /** Colores [cielo, suelo] para el degradado de fondo cuando está revelada. */
  gradient: [string, string];
}

export type ZoneStatus = 'locked' | 'active' | 'discovered';

export interface DiscoveryEvent {
  zoneId: string;
  title: string;
  description: string;
}
