export type IslandObjectType =
  | 'flower'
  | 'tree'
  | 'butterfly'
  | 'leaf'
  | 'cabin'
  | 'bridge'
  | 'statue'
  | 'campfire'
  | 'waterfall'
  | 'ruins'
  | 'cave'
  | 'temple'
  | 'village'
  | 'treasure'
  | 'crystal'
  | 'palm'
  | 'mushroom'
  | 'npc';

export interface IslandObject {
  id: string;
  type: IslandObjectType;

  zoneId?: string;

  x: number;
  y: number;

  label?: string | null;

  animation?: string | null;

  unlocked?: boolean;

  source?: 'academic' | 'mission' | 'manual' | 'discovery' | 'achievement';

  sourceId?: string | null;

  reward?: {
    type: string;
    value?: string | number;
  } | null;
}

export interface IslandZone {
  id: string;
  name: string;
  description: string;

  unlockLevel: number;

  x: number;
  y: number;

  width: number;
  height: number;

  background?: string;

  mystery?: string;
}

export interface IslandDiscovery {
  id: string;
  zoneId: string;
  title: string;
  description: string;

  requiredLevel: number;

  discovered: boolean;

  rewardType?: string;
  rewardValue?: string | number;
}
