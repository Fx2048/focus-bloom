
import { Canvas, useThree } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { useLayoutEffect } from 'react';
import { OrthographicCamera as ThreeOrthographicCamera } from 'three';

import IslandTerrain3D from './IslandTerrain3D';
import IslandOcean3D from './IslandOcean3D';
import IslandEnvironment3D from './IslandEnvironment3D';
import IslandModels3D from './IslandModels3D';

import type { UnlockedElement } from '../useIslandProgression';
import type { ThemeConfig } from '../IslandCanvas';

interface IslandScene3DProps {
  stage: 1 | 2 | 3 | 4 | 5;
  elements: UnlockedElement[];
  newlyUnlockedIds?: string[];
  onElementClick?: (element: UnlockedElement) => void;
  theme: ThemeConfig;
}

function SceneLighting({ accent }: { accent: string }) {
  return (
    <>
      <hemisphereLight args={['#e7f5ff', '#71586c', 1.35]} />
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[-5, 10, 7]}
        intensity={1.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
      />
      <pointLight position={[0, 2.5, 2]} color={accent} intensity={0.45} distance={9} />
    </>
  );
}

interface SceneContentProps extends IslandScene3DProps {}

function FrameIsland() {
  const { camera, size } = useThree();

  useLayoutEffect(() => {
    if (!(camera instanceof ThreeOrthographicCamera)) return;
    camera.zoom = Math.min(size.width / 13.5, size.height / 11);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  return null;
}

function SceneContent({
  stage,
  elements,
  newlyUnlockedIds,
  onElementClick,
  theme,
}: SceneContentProps) {
  return (
    <>
      <FrameIsland />
      <SceneLighting accent={theme.accent} />
      <IslandEnvironment3D theme={theme} />
      <IslandOcean3D theme={theme} />

      <IslandTerrain3D stage={stage} theme={theme} />

      <IslandModels3D
        elements={elements}
        newlyUnlockedIds={newlyUnlockedIds}
        onElementClick={onElementClick}
        theme={theme}
      />
    </>
  );
}

export default function IslandScene3D({
  stage,
  elements,
  newlyUnlockedIds = [],
  onElementClick,
  theme,
}: IslandScene3DProps) {
  return (
    <div className="relative w-full aspect-[4/3] min-h-[500px]">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <OrthographicCamera
          makeDefault
          position={[8, 8, 8]}
          zoom={42}
          near={0.1}
          far={100}
          onUpdate={(camera) => camera.lookAt(0, 0, 0)}
        />

        <SceneContent
          stage={stage}
          elements={elements}
          newlyUnlockedIds={newlyUnlockedIds}
          onElementClick={onElementClick}
          theme={theme}
        />
      </Canvas>
    </div>
  );
}
