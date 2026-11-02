
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';

import IslandTerrain3D from './IslandTerrain3D';
import IslandOcean3D from './IslandOcean3D';
import IslandEnvironment3D from './IslandEnvironment3D';
import IslandModels3D from './IslandModels3D';

import type { UnlockedElement } from '../useIslandProgression';

interface IslandScene3DProps {
  stage: 1 | 2 | 3 | 4 | 5;
  elements: UnlockedElement[];
  newlyUnlockedIds?: string[];
  onElementClick?: (element: UnlockedElement) => void;
}

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight
        position={[8, 12, 6]}
        intensity={2}
        castShadow
      />
    </>
  );
}

interface SceneContentProps extends IslandScene3DProps {}

function SceneContent({
  stage,
  elements,
  newlyUnlockedIds,
  onElementClick,
}: SceneContentProps) {
  return (
    <>
      <SceneLighting />
      <IslandEnvironment3D />
      <IslandOcean3D />

      <IslandTerrain3D stage={stage} />

      <IslandModels3D
        elements={elements}
        newlyUnlockedIds={newlyUnlockedIds}
        onElementClick={onElementClick}
      />
    </>
  );
}

export default function IslandScene3D({
  stage,
  elements,
  newlyUnlockedIds = [],
  onElementClick,
}: IslandScene3DProps) {
  return (
    <div className="relative w-full aspect-[4/3] min-h-[500px]">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <OrthographicCamera
          makeDefault
          position={[8, 8, 8]}
          zoom={20}
          near={0.1}
          far={100}
          onUpdate={(camera) => camera.lookAt(0, 0, 0)}
        />

        <SceneContent
          stage={stage}
          elements={elements}
          newlyUnlockedIds={newlyUnlockedIds}
          onElementClick={onElementClick}
        />
      </Canvas>
    </div>
  );
}
