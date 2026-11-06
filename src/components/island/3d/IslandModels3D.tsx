
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, MeshBasicMaterial } from 'three';

import type { UnlockedElement } from '../useIslandProgression';
import type { ThemeConfig } from '../IslandCanvas';
import IslandElement3D from './IslandElements3D';

interface IslandModels3DProps {
  elements: UnlockedElement[];
  newlyUnlockedIds?: string[];
  onElementClick?: (element: UnlockedElement) => void;
  theme: ThemeConfig;
}

interface PlacedElementProps {
  element: UnlockedElement;
  isNew: boolean;
  onElementClick?: (element: UnlockedElement) => void;
  accent: string;
}

function convertCoordinates(
  x: number,
  y: number
): [number, number, number] {
  return [
    (x - 400) * 0.015,
    0.16,
    (y - 290) * 0.015,
  ];
}

function PlacedElement({
  element,
  isNew,
  onElementClick,
  accent,
}: PlacedElementProps) {
  const groupRef = useRef<Group>(null);
  const haloRef = useRef<Group>(null);
  const haloMaterialRef = useRef<MeshBasicMaterial>(null);

  const elapsed = useRef(0);
  const finalScale = isNew ? 1.1 : 0.85;

  useFrame((_, delta) => {
    if (!isNew || !groupRef.current) return;

    elapsed.current += delta;

    const duration = 0.9;
    const progress = Math.min(elapsed.current / duration, 1);

    // Crecimiento progresivo con un pequeño rebote.
    const eased = 1 - Math.pow(1 - progress, 3);
    const bounce =
      progress < 1
        ? 1 + Math.sin(progress * Math.PI) * 0.16
        : 1;

    const scale = finalScale * (0.2 + 0.8 * eased) * bounce;

    groupRef.current.scale.setScalar(scale);

    // El halo se expande y desaparece.
    if (haloRef.current) {
      const haloScale = 0.6 + progress * 1.4;
      haloRef.current.scale.setScalar(haloScale);
    }

    if (haloMaterialRef.current) {
      haloMaterialRef.current.opacity = (1 - progress) * 0.55;
    }
  });

  return (
    <group
      ref={groupRef}
      scale={isNew ? 0.2 : finalScale}
      onClick={(event) => {
        event.stopPropagation();
        onElementClick?.(element);
      }}
    >
      <IslandElement3D
        type={element.type}
        position={[0, 0, 0]}
        scale={1}
        accent={accent}
      />

      {isNew && (
        <group
          ref={haloRef}
          position={[0, -0.12, 0]}
        >
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[0.42, 0.52, 40]} />
            <meshBasicMaterial
              ref={haloMaterialRef}
              color={accent}
              transparent
              opacity={0.55}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

export default function IslandModels3D({
  elements,
  newlyUnlockedIds = [],
  onElementClick,
  theme,
}: IslandModels3DProps) {
  return (
    <group>
      {elements.map((element) => {
        const position = convertCoordinates(element.x, element.y);
        const isNew = newlyUnlockedIds.includes(element.id);

        return (
          <group
            key={element.id}
            position={position}
          >
            <PlacedElement
              element={element}
              isNew={isNew}
              onElementClick={onElementClick}
              accent={theme.accent}
            />
          </group>
        );
      })}
    </group>
  );
}
