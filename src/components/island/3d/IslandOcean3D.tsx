
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { ThemeConfig } from '../IslandCanvas';

function makeWaterTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) return null;

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, 256, 256);
  context.strokeStyle = '#b5e0df';
  context.lineWidth = 1.5;
  context.globalAlpha = 0.18;
  for (let y = 18; y < 256; y += 42) {
    for (let x = 18; x < 256; x += 42) {
      context.beginPath();
      context.arc(x, y, 12, 0.15, Math.PI * 1.55);
      context.stroke();
      context.beginPath();
      context.arc(x + 17, y + 16, 8, Math.PI, Math.PI * 1.85);
      context.stroke();
    }
  }
  context.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.anisotropy = 4;
  return texture;
}

export default function IslandOcean3D({ theme }: { theme: ThemeConfig }) {
  const waterTexture = useMemo(() => makeWaterTexture(), []);
  useEffect(() => () => waterTexture?.dispose(), [waterTexture]);

  return (
    <group>
      {/* The round lagoon leaves a clear sky horizon around the floating island. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -3.5, 0]}
        receiveShadow
      >
        <circleGeometry args={[12, 64]} />
        <meshStandardMaterial
          color={theme.water}
          map={waterTexture ?? undefined}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* Anillo decorativo de agua */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -3.48, 0]}
      >
        <ringGeometry args={[8.5, 9.2, 64]} />
        <meshBasicMaterial
          color={theme.sky[0]}
          transparent
          opacity={0.45}
        />
      </mesh>
    </group>
  );
}

