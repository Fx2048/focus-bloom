
import type { UnlockedElement, IslandTheme } from './useIslandProgression';
import IslandScene3D from './3d/IslandScene3D';

export type ThemeConfig = {
  sky: [string, string];
  grass: [string, string];
  accent: string;
};

export const THEME_CONFIGS: Record<IslandTheme, ThemeConfig> = {
  spring: {
    sky: ['#c8e6ff', '#e8d5f0'],
    grass: ['#7bc67e', '#5a9e5e'],
    accent: '#ff9eb5',
  },
  midnight: {
    sky: ['#1a1a3e', '#2d1b4e'],
    grass: ['#2d5a3d', '#1a3d2a'],
    accent: '#a78bfa',
  },
  autumn: {
    sky: ['#ffd9a0', '#ffb347'],
    grass: ['#8b6914', '#a07c1a'],
    accent: '#ff6b35',
  },
  tropical: {
    sky: ['#00d2ff', '#3a7bd5'],
    grass: ['#00b09b', '#96c93d'],
    accent: '#ffce00',
  },
};

interface IslandCanvasProps {
  stage: 1 | 2 | 3 | 4 | 5;
  unlockedElements: UnlockedElement[];
  newlyUnlockedIds?: string[];
  theme?: IslandTheme;
  onElementClick?: (element: UnlockedElement) => void;
}

const STAGE_NAMES = [
  'Semilla',
  'Primeros Brotes',
  'Jardín Floreciente',
  'Isla en Expansión',
  'Paraíso Floreciente',
];

export function IslandCanvas({
  stage,
  unlockedElements,
  newlyUnlockedIds = [],
  theme = 'spring',
  onElementClick,
}: IslandCanvasProps) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      data-theme={theme}
      role="img"
      aria-label={`Isla en etapa ${stage}: ${STAGE_NAMES[stage - 1]}`}
      style={{ minHeight: '400px' }}
    >
      <IslandScene3D
        stage={stage}
        elements={unlockedElements}
        newlyUnlockedIds={newlyUnlockedIds}
        onElementClick={onElementClick}
      />

      <div className="absolute left-4 top-4 z-10 pointer-events-none">
        <div className="rounded-full bg-black/30 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-sm">
          Etapa {stage} • {STAGE_NAMES[stage - 1]}
        </div>
      </div>
    </div>
  );
}

export default IslandCanvas;
