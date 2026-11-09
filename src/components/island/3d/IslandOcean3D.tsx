
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Group } from 'three';
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

const KOI_FISH = Array.from({ length: 14 }, (_, index) => {
  const angle = (index / 14) * Math.PI * 2;
  const radius = 5.2 + (index % 4) * 0.78;
  return {
    id: index,
    x: Math.cos(angle) * radius,
    z: Math.sin(angle) * radius,
    color: ['#f47b31', '#f28b35', '#f7a746', '#f1f0e8'][index % 4],
    accent: index % 3 === 0 ? '#fff5df' : '#dc552d',
  };
});

function KoiFish({ fish }: { fish: (typeof KOI_FISH)[number] }) {
  const fishRef = useRef<Group>(null);
  const [growth, setGrowth] = useState(1);
  const [feedId, setFeedId] = useState(0);
  const growthRef = useRef(1);
  const phase = useRef(fish.id * 1.7);

  useFrame(({ clock }, delta) => {
    const group = fishRef.current;
    if (!group) return;
    const time = clock.elapsedTime * 0.24 + phase.current;
    const x = fish.x + Math.cos(time) * 0.35;
    const z = fish.z + Math.sin(time) * 0.35;
    group.position.set(x, -3.4 + Math.sin(clock.elapsedTime * 2 + fish.id) * 0.025, z);
    group.rotation.y = Math.atan2(Math.cos(time), -Math.sin(time));
    group.scale.setScalar(THREE.MathUtils.damp(group.scale.x, growth, 4, delta));
  });

  return (
    <group
      ref={fishRef}
      position={[fish.x, -3.4, fish.z]}
      onPointerDown={(event) => {
        event.stopPropagation();
        growthRef.current = Math.min(1.8, growthRef.current + 0.12);
        setGrowth(growthRef.current);
        setFeedId((current) => current + 1);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      <mesh scale={[0.22, 0.12, 0.42]} castShadow>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color={fish.color} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0, -0.43]} rotation={[Math.PI / 2, 0, 0]} scale={[0.18, 0.22, 0.08]}>
        <coneGeometry args={[1, 1, 4]} />
        <meshStandardMaterial color={fish.color} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.13, -0.02]} scale={[0.09, 0.045, 0.19]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color={fish.accent} roughness={0.55} />
      </mesh>
      <mesh position={[0.13, 0.035, 0.23]} scale={0.025}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#282b32" />
      </mesh>
      {feedId > 0 && <FishFeed key={feedId} onComplete={() => setFeedId(0)} />}
    </group>
  );
}

function FishFeed({ onComplete }: { onComplete: () => void }) {
  const food = useRef<Group>(null);
  const elapsed = useRef(0);
  const completed = useRef(false);

  useFrame((_, delta) => {
    if (!food.current || completed.current) return;
    elapsed.current += delta;
    const progress = Math.min(elapsed.current / 0.4, 1);
    food.current.position.set(0, 0.15 + Math.sin(progress * Math.PI) * 0.12, 0.22 * progress);
    food.current.scale.setScalar(1 - progress * 0.75);
    if (progress === 1) {
      completed.current = true;
      onComplete();
    }
  });

  return (
    <group ref={food} position={[0, 0.15, -0.1]}>
      <mesh scale={[0.045, 0.025, 0.07]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#fff8df" roughness={0.8} />
      </mesh>
    </group>
  );
}

export default function IslandOcean3D({ theme }: { theme: ThemeConfig }) {
  const waterTexture = useMemo(() => makeWaterTexture(), []);
  useEffect(() => () => waterTexture?.dispose(), [waterTexture]);

  return (
    <group>
      {KOI_FISH.map((fish) => <KoiFish key={fish.id} fish={fish} />)}
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
