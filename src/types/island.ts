export type IslandObjectType =
  | 'flower'
  | 'tree'
  | 'butterfly'
  | 'leaf'
  | 'grass'
  | 'cabin'
  | 'bridge'
  | 'waterfall'
  | 'campfire'
  | 'ruins'
  | 'cave'
  | 'temple'
  | 'village'
  | 'npc'
  | 'treasure'
  | 'crystal'
  | 'palm'
  | 'statue';

export type IslandAnimation =
  | 'none'
  | 'sway'
  | 'float'
  | 'fly'
  | 'fall'
  | 'glow'
  | 'pulse'
  | 'bounce';

export type IslandObjectSource =
  | 'task'
  | 'course'
  | 'cycle'
  | 'achievement'
  | 'exploration'
  | 'manual';

export interface IslandZone {
  id: string;
  name: string;
  description: string;

  /**
   * Ciclo mínimo necesario para acceder.
   */
  requiredCycle: number;

  /**
   * Posición de la región en el mapa.
   * Se expresa como porcentaje.
   */
  x: number;
  y: number;

  icon: string;
}

export interface IslandObject {
  id: string;
  user_id?: string;

  type: IslandObjectType;
  zone_id: string;

  x: number;
  y: number;

  animation: IslandAnimation;

  source: IslandObjectSource;
  source_id?: string | null;

  created_at?: string;
}

export interface IslandDiscovery {
  id: string;
  user_id?: string;

  zone_id: string;

  title: string;
  description: string;

  discovered: boolean;

  created_at?: string;
}

export interface IslandReward {
  id: string;
  title: string;
  description: string;

  type:
    | 'xp'
    | 'exploration'
    | 'decoration'
    | 'opportunity';

  amount?: number;

  opportunityUrl?: string;
}

export interface IslandWorldEvent {
  id: string;

  type:
    | 'TASK_COMPLETED'
    | 'COURSE_APPROVED'
    | 'CYCLE_UNLOCKED'
    | 'ZONE_DISCOVERED'
    | 'ACHIEVEMENT_UNLOCKED';

  sourceId?: string;

  createdAt: string;
}
