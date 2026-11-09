
import type { UnlockedElement, IslandTheme } from './useIslandProgression';
import IslandScene3D from './3d/IslandScene3D';

export type ThemeConfig = {
  sky: [string, string];
  grass: [string, string];
  accent: string;
  water: string;
  soil: string;
  stone: string;
};

export const THEME_CONFIGS: Record<IslandTheme, ThemeConfig> = {
  spring: {
    sky: ['#c5e8f4', '#f3d9e7'],
    grass: ['#83c779', '#4f965f'],
    accent: '#f28eae',
    water: '#48afc4',
    soil: '#8e6046',
    stone: '#66546d',
  },
  midnight: {
    sky: ['#26365e', '#60436d'],
    grass: ['#4c8061', '#2e594b'],
    accent: '#d2a8ff',
    water: '#438bab',
    soil: '#5c4a58',
    stone: '#3b3d57',
  },
  autumn: {
    sky: ['#ffe2b1', '#f0aa82'],
    grass: ['#a69d4a', '#777d3e'],
    accent: '#f47742',
    water: '#4d9ca2',
    soil: '#85543a',
    stone: '#704e55',
  },
  tropical: {
    sky: ['#8bdfdd', '#c9e9bd'],
    grass: ['#35ad83', '#197a68'],
    accent: '#ffd34d',
    water: '#2ea6b7',
    soil: '#765b3e',
    stone: '#477278',
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
      style={{
        minHeight: '400px',
        background: `linear-gradient(155deg, ${THEME_CONFIGS[theme].sky[0]} 0%, ${THEME_CONFIGS[theme].sky[1]} 100%)`,
      }}
    >
      <IslandScene3D
        stage={stage}
        elements={unlockedElements}
        newlyUnlockedIds={newlyUnlockedIds}
        onElementClick={onElementClick}
        theme={THEME_CONFIGS[theme]}
      />

      <div className="absolute left-4 top-4 z-10 pointer-events-none">
        <div className="rounded-full bg-black/30 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-sm">
          Etapa {stage} • {STAGE_NAMES[stage - 1]}
        </div>
      </div>
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
        <div className="rounded-full bg-black/35 px-3 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-sm">
          🌎 Andes · Amazonas · Machu Picchu · 2 dedos para mover
        </div>
      </div>
    </div>
  );
}

export default IslandCanvas;
