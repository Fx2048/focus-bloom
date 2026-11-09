
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { ThemeConfig } from '../IslandCanvas';

interface IslandTerrain3DProps {
  stage: 1 | 2 | 3 | 4 | 5;
  theme: ThemeConfig;
}

function makeGrassTexture(grass: string, detail: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;

  const context = canvas.getContext('2d');
  if (!context) return null;

  context.fillStyle = grass;
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 900; i++) {
    const x = (i * 197.3) % canvas.width;
    const y = (i * 283.7) % canvas.height;
    const length = 2 + ((i * 17) % 7);

    context.globalAlpha = 0.08 + ((i * 13) % 10) / 100;
    context.strokeStyle = i % 4 === 0 ? '#f0f0cf' : detail;
    context.lineWidth = i % 5 === 0 ? 2 : 1;

    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + ((i % 3) - 1) * 2, y - length);
    context.stroke();
  }

  context.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  return texture;
}

function GrassPatch({
  position,
  scale = 1,
  color,
}: {
  position: [number, number, number];
  scale?: number;
  color: string;
}) {
  return (
    <mesh position={position} scale={[scale, 0.035, scale]}>
      <sphereGeometry args={[0.55, 12, 8]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function GrassClump({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) {
  return (
    <group position={position}>
      {[-0.12, 0, 0.12].map((offset, index) => (
        <mesh
          key={index}
          position={[offset, 0.13, 0]}
          rotation={[0, 0, (index - 1) * 0.25]}
        >
          <coneGeometry args={[0.07, 0.3, 5]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

export default function IslandTerrain3D({ theme }: IslandTerrain3DProps) {
  const grassTexture = useMemo(
    () => makeGrassTexture(theme.grass[0], theme.grass[1]),
    [theme.grass],
  );

  useEffect(() => () => grassTexture?.dispose(), [grassTexture]);

  const colors = {
    grass: theme.grass[0],
    detail: theme.grass[1],
    earth: theme.soil,
    lowerEarth: theme.stone,
  };

  return (
    <group>
      {/* Base de tierra */}
      <mesh position={[0, -0.05, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[4.8, 4.8, 0.35, 16]} />
        <meshStandardMaterial
          map={grassTexture ?? undefined}
          roughness={0.9}
        />
      </mesh>

      {/* Capa inferior de tierra */}
      <mesh position={[0, -0.9, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[4.8, 3.9, 1.25, 16]} />
        <meshStandardMaterial
          color={colors.earth}
          roughness={1}
        />
      </mesh>

      {/* Punta rocosa inferior */}
      <mesh position={[0, -2, 0]} castShadow>
        <coneGeometry args={[3.9, 2.55, 12]} />
        <meshStandardMaterial
          color={colors.lowerEarth}
          roughness={0.95}
        />
      </mesh>

      {/* Rocas facetadas */}
      {Array.from({ length: 8 }, (_, index) => {
        const angle = (index / 8) * Math.PI * 2;
        const radius = 2.7 + (index % 2) * 0.3;
        return (
          <mesh
            key={index}
            position={[
              Math.cos(angle) * radius,
              -1.18 - (index % 3) * 0.13,
              Math.sin(angle) * radius,
            ]}
            rotation={[
              0.18 * (index % 2),
              angle,
              0.12 * (index % 3),
            ]}
            scale={[
              0.65,
              1.05 + (index % 3) * 0.16,
              0.58,
            ]}
            castShadow
          >
            <dodecahedronGeometry args={[0.8, 0]} />
            <meshStandardMaterial
              color={colors.earth}
              roughness={0.95}
              flatShading
            />
          </mesh>
        );
      })}

      {/* Vegetación permanente: disponible desde el nivel 1 */}

      {/* Parches iniciales */}
      <GrassPatch
        position={[-1.8, 0.14, 0.5]}
        color={colors.detail}
      />
      <GrassPatch
        position={[1.8, 0.14, -0.4]}
        color={colors.detail}
      />

      {/* Brotes */}
      <GrassClump
        position={[-2.1, 0.14, -0.3]}
        color={colors.detail}
      />
      <GrassClump
        position={[2, 0.14, 0.4]}
        color={colors.detail}
      />

      {/* Vegetación abundante */}
      <GrassPatch
        position={[-1, 0.14, 1.3]}
        scale={1.3}
        color={colors.detail}
      />
      <GrassPatch
        position={[1.2, 0.14, -1.2]}
        scale={1.2}
        color={colors.detail}
      />
      <GrassClump
        position={[0.2, 0.14, 1.8]}
        color={colors.detail}
      />

      {/* Vegetación exuberante */}
      <GrassClump
        position={[-2.5, 0.14, 1]}
        color={colors.detail}
      />
      <GrassClump
        position={[2.4, 0.14, -1]}
        color={colors.detail}
      />
      <GrassPatch
        position={[0, 0.14, -2]}
        scale={1.4}
        color={colors.detail}
      />

      {/* Detalles decorativos */}
      <GrassClump
        position={[-0.8, 0.14, -2.2]}
        color={theme.accent}
      />
      <GrassClump
        position={[1.8, 0.14, 1.5]}
        color={theme.accent}
      />
      <GrassPatch
        position={[-1.7, 0.14, -1.5]}
        scale={1.3}
        color={colors.grass}
      />
    </group>
  );
}

