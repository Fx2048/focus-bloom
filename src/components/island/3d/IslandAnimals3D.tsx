import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Group } from 'three';

const ANIMALS = [
  { kind: 'rabbit', color: '#f3e5d7', accent: '#e9a6b0', x: -2.35, z: -1.35 },
  { kind: 'fox', color: '#e88343', accent: '#fff0d4', x: -1.55, z: -2.2 },
  { kind: 'chick', color: '#ffd45c', accent: '#ef8b48', x: 0, z: -2.35 },
  { kind: 'cat', color: '#b7a0d5', accent: '#f4e9ff', x: 1.55, z: -2.1 },
  { kind: 'turtle', color: '#64aa78', accent: '#397456', x: 2.35, z: -1.05 },
  { kind: 'bear', color: '#b97b58', accent: '#f2d5b6', x: 2.35, z: 0.55 },
  { kind: 'rabbit', color: '#d8e6f4', accent: '#eda8b8', x: 1.55, z: 1.9 },
  { kind: 'bird', color: '#6dbbd1', accent: '#f4d45e', x: 0, z: 2.3 },
  { kind: 'fox', color: '#d87950', accent: '#ffe6bd', x: -1.55, z: 2 },
  { kind: 'frog', color: '#79bf70', accent: '#f0d95c', x: -2.35, z: 0.65 },
  { kind: 'sheep', color: '#f4f0e5', accent: '#a77b70', x: -1.25, z: -0.55 },
  { kind: 'cat', color: '#e5a56d', accent: '#fff0dc', x: 1.1, z: 0.1 },
  { kind: 'capybara', color: '#a87850', accent: '#e5c39c', x: -3.2, z: 0.35 },
  { kind: 'jaguar', color: '#dda34c', accent: '#533a2f', x: 3.2, z: 0.7 },
  { kind: 'toucan', color: '#252936', accent: '#f4a332', x: -0.25, z: 3.3 },
  { kind: 'macaw', color: '#e84c48', accent: '#f3cb4d', x: 0.8, z: -3.25 },
  { kind: 'sloth', color: '#8f7950', accent: '#d5c596', x: -3.35, z: -1.25 },
  { kind: 'monkey', color: '#925d42', accent: '#e3b18d', x: 3.35, z: -1.2 },
  { kind: 'condor', color: '#34353d', accent: '#e9e3d4', x: 2.65, z: 2.55 },
  { kind: 'llama', color: '#d9c6a4', accent: '#795844', x: -5.25, z: -0.5, island: 'andes' },
  { kind: 'alpaca', color: '#f1eadb', accent: '#ad8d7b', x: -5.8, z: 0.7, island: 'andes' },
  { kind: 'llama', color: '#ba8b64', accent: '#f0d2ac', x: -6.75, z: -0.6, island: 'andes' },
  { kind: 'jaguar', color: '#dca449', accent: '#49352a', x: 5.85, z: -0.65, island: 'amazon' },
  { kind: 'capybara', color: '#a97a53', accent: '#e4c49e', x: 6.65, z: 0.6, island: 'amazon' },
  { kind: 'sloth', color: '#85744f', accent: '#d4c393', x: 5.8, z: 0.8, island: 'amazon' },
  { kind: 'monkey', color: '#986242', accent: '#edbd98', x: 0.2, z: -5.4, island: 'machu-picchu' },
  { kind: 'toucan', color: '#292b34', accent: '#f2a32e', x: 0.7, z: -6.8, island: 'machu-picchu' },
  { kind: 'elephant', color: '#8a8c94', accent: '#d5d5d1', x: -0.65, z: -6.3, island: 'machu-picchu' },
] as const;

const GROUND_Y = 0.17;
const ISLAND_RADIUS = 4.45;
const DRAG_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), -GROUND_Y);

const ISLAND_CENTERS = {
  main: [0, 0],
  andes: [-6.1, 0],
  amazon: [6.1, 0],
  'machu-picchu': [0, -6.1],
} as const;

function nextWanderTarget(index: number, step: number, island: keyof typeof ISLAND_CENTERS) {
  const angle = index * 2.4 + step * 2.15;
  const radius = island === 'main'
    ? 0.65 + ((index + step) % 4) * 0.52
    : 0.2 + ((index + step) % 3) * 0.27;
  const [centerX, centerZ] = ISLAND_CENTERS[island];
  return new THREE.Vector3(
    centerX + Math.cos(angle) * radius,
    GROUND_Y,
    centerZ + Math.sin(angle) * radius,
  );
}

function RiceFeed({ onComplete }: { onComplete: () => void }) {
  const riceRef = useRef<Group>(null);
  const elapsed = useRef(0);
  const completed = useRef(false);
  const start = useRef(new THREE.Vector3(0.38, 0.92, 0.95));
  const mouth = useRef(new THREE.Vector3(0, 0.35, 0.43));

  useFrame((_, delta) => {
    if (!riceRef.current || completed.current) return;
    elapsed.current += delta;
    const progress = Math.min(elapsed.current / 0.55, 1);
    riceRef.current.position.lerpVectors(start.current, mouth.current, progress);
    riceRef.current.position.y += Math.sin(progress * Math.PI) * 0.18;
    riceRef.current.rotation.y = progress * Math.PI * 2;
    riceRef.current.scale.setScalar(1 - progress * 0.45);

    if (progress === 1) {
      completed.current = true;
      onComplete();
    }
  });

  return (
    <group ref={riceRef}>
      <mesh rotation={[0.2, 0, 0.5]} scale={[0.045, 0.025, 0.09]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color="#fff8df" roughness={0.75} />
      </mesh>
      <mesh position={[0.035, 0.025, -0.035]} rotation={[0, 0, -0.4]} scale={[0.035, 0.02, 0.065]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color="#fffdf3" roughness={0.75} />
      </mesh>
    </group>
  );
}

function AnimalModel({
  kind,
  color,
  accent,
  bodyRef,
  feedId,
  growth,
  onFeedComplete,
}: {
  kind: string;
  color: string;
  accent: string;
  bodyRef: React.RefObject<Group>;
  feedId: number;
  growth: number;
  onFeedComplete: () => void;
}) {
  const isRabbit = kind === 'rabbit';
  const isFox = kind === 'fox';
  const isCat = kind === 'cat';
  const isFrog = kind === 'frog';
  const isTurtle = kind === 'turtle';
  const isSheep = kind === 'sheep';
  const isElephant = kind === 'elephant';
  const isCapybara = kind === 'capybara';
  const isCamelid = kind === 'llama' || kind === 'alpaca';
  const isRooster = kind === 'chick' && growth >= 1.3;
  const isBird = ['bird', 'chick', 'toucan', 'macaw', 'condor'].includes(kind);
  const earGeometry = isRabbit ? 'ellipsoid' : isFox || isCat || isFrog ? 'cone' : null;

  return (
    <group ref={bodyRef}>
      <mesh position={[0, 0.22, 0]} scale={isTurtle ? [0.29, 0.16, 0.35] : isCapybara ? [0.38, 0.25, 0.42] : isElephant ? [0.38, 0.3, 0.43] : [0.3, 0.22, isCamelid ? 0.31 : 0.38]} castShadow>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color={isTurtle ? accent : color} roughness={0.82} />
      </mesh>
      {!isTurtle && (
        <mesh position={[0, isCamelid ? 0.72 : 0.39, isCamelid ? 0.16 : 0.2]} scale={isBird ? [0.2, 0.2, 0.22] : isElephant ? [0.28, 0.26, 0.26] : [0.22, 0.23, 0.22]} castShadow>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color={color} roughness={0.78} />
        </mesh>
      )}
      {isTurtle && (
        <mesh position={[0, 0.25, 0.35]} scale={[0.15, 0.13, 0.18]}>
          <sphereGeometry args={[1, 14, 10]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      )}

      {isSheep && (
        <>
          {[-0.18, 0, 0.18].map((x) => (
            <mesh key={x} position={[x, 0.34, -0.05]} scale={0.15}>
              <sphereGeometry args={[1, 10, 8]} />
              <meshStandardMaterial color="#fffdf6" roughness={1} />
            </mesh>
          ))}
        </>
      )}

      {earGeometry === 'ellipsoid' && [-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.1, 0.69, 0.18]} rotation={[0, 0, side * -0.16]} scale={[0.075, 0.24, 0.065]}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color={accent} roughness={0.8} />
        </mesh>
      ))}
      {earGeometry === 'cone' && [-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.13, 0.59, 0.18]} rotation={[0, 0, side * -0.18]}>
          <coneGeometry args={[0.1, 0.22, 8]} />
          <meshStandardMaterial color={isFrog ? accent : color} roughness={0.8} />
        </mesh>
      ))}

      {isFrog && [-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.13, 0.59, 0.24]} scale={0.075}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color="#fffdf2" />
        </mesh>
      ))}

      {isBird && (
        <mesh position={[0, 0.38, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[kind === 'toucan' ? 0.13 : 0.08, kind === 'toucan' ? 0.3 : 0.17, 7]} />
          <meshStandardMaterial color={accent} />
        </mesh>
      )}
      {isElephant && (
        <>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.27, 0.42, 0.12]} scale={[0.22, 0.25, 0.06]}>
              <sphereGeometry args={[1, 12, 10]} />
              <meshStandardMaterial color={accent} />
            </mesh>
          ))}
          <mesh position={[0, 0.2, 0.54]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.07, 0.09, 0.42, 10]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </>
      )}
      {isCamelid && [-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.13, 1.01, 0.15]} rotation={[0, 0, side * -0.12]}>
          <capsuleGeometry args={[0.045, 0.24, 4, 8]} />
          <meshStandardMaterial color={accent} />
        </mesh>
      ))}
      {isRooster && (
        <>
          <mesh position={[0, 0.61, 0.21]}>
            <sphereGeometry args={[0.1, 10, 8]} />
            <meshStandardMaterial color="#d94139" />
          </mesh>
          <mesh position={[0, 0.73, 0.2]}>
            <coneGeometry args={[0.085, 0.2, 6]} />
            <meshStandardMaterial color="#c93634" />
          </mesh>
          <mesh position={[0, 0.38, -0.3]} rotation={[0.4, 0, 0]}>
            <coneGeometry args={[0.17, 0.5, 6]} />
            <meshStandardMaterial color="#287b50" />
          </mesh>
        </>
      )}

      {!isBird && !isTurtle && (
        <>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.085, 0.43, 0.385]} scale={0.035}>
              <sphereGeometry args={[1, 10, 8]} />
              <meshStandardMaterial color="#302a32" />
            </mesh>
          ))}
          <mesh position={[0, 0.34, 0.414]} scale={[0.045, 0.03, 0.025]}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial color={isFox ? '#4b3027' : accent} />
          </mesh>
        </>
      )}

      {isBird && (
        <>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.08, 0.45, 0.365]} scale={0.025}>
              <sphereGeometry args={[1, 8, 8]} />
              <meshBasicMaterial color="#302a32" />
            </mesh>
          ))}
        </>
      )}

      {!isBird && [-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.18, 0.055, 0.12]} scale={[0.09, 0.1, 0.11]}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color={isTurtle ? color : accent} roughness={0.9} />
        </mesh>
      ))}

      {(isFox || isCat || isRabbit) && (
        <mesh position={[0, 0.27, -0.39]} rotation={[0.4, 0, isFox ? -0.25 : 0]} scale={[0.1, 0.1, isFox ? 0.2 : 0.14]}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color={accent} roughness={0.9} />
        </mesh>
      )}
      {feedId > 0 && <RiceFeed key={feedId} onComplete={onFeedComplete} />}
    </group>
  );
}

function WanderingAnimal({ animal, index }: { animal: (typeof ANIMALS)[number]; index: number }) {
  const groupRef = useRef<Group>(null);
  const bodyRef = useRef<Group>(null);
  const dragging = useRef(false);
  const dragged = useRef(false);
  const pointerStart = useRef({ x: 0, y: 0 });
  const step = useRef(0);
  const dragPoint = useRef(new THREE.Vector3());
  const growth = useRef(1);
  const feedPause = useRef(0);
  const [feedId, setFeedId] = useState(0);
  const island = animal.island ?? 'main';
  const [centerX, centerZ] = ISLAND_CENTERS[island];
  const target = useRef(nextWanderTarget(index, 1, island));
  const scale = 0.78 + (index % 4) * 0.07;

  useFrame(({ clock }, delta) => {
    const group = groupRef.current;
    if (!group || !bodyRef.current) return;

    group.scale.setScalar(THREE.MathUtils.damp(group.scale.x, scale * growth.current, 4, delta));
    feedPause.current = Math.max(0, feedPause.current - delta);

    if (!dragging.current && feedPause.current === 0) {
      const dx = target.current.x - group.position.x;
      const dz = target.current.z - group.position.z;
      const distance = Math.hypot(dx, dz);

      if (distance < 0.12) {
        step.current += 1;
        target.current = nextWanderTarget(index, step.current + 1, island);
      } else {
        const travel = Math.min(distance, delta * (0.32 + (index % 3) * 0.07));
        group.position.x += (dx / distance) * travel;
        group.position.z += (dz / distance) * travel;
        bodyRef.current.rotation.y = Math.atan2(dx, dz);
      }

      bodyRef.current.position.y = Math.sin(clock.elapsedTime * 8 + index) * 0.025;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[animal.x, GROUND_Y, animal.z]}
      scale={scale}
      onPointerDown={(event) => {
        event.stopPropagation();
        dragging.current = true;
        dragged.current = false;
        pointerStart.current = { x: event.clientX, y: event.clientY };
        (event.target as Element).setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!dragging.current || !groupRef.current) return;
        if (Math.hypot(event.clientX - pointerStart.current.x, event.clientY - pointerStart.current.y) > 6) {
          dragged.current = true;
        }
        if (!dragged.current) return;
        event.stopPropagation();
        const point = event.ray.intersectPlane(DRAG_PLANE, dragPoint.current);
        if (!point) return;
        const dx = point.x - centerX;
        const dz = point.z - centerZ;
        const distance = Math.hypot(dx, dz);
        const maxRadius = island === 'main' ? ISLAND_RADIUS : 1.35;
        const factor = distance > maxRadius ? maxRadius / distance : 1;
        groupRef.current.position.x = centerX + dx * factor;
        groupRef.current.position.z = centerZ + dz * factor;
        target.current.set(groupRef.current.position.x, GROUND_Y, groupRef.current.position.z);
      }}
      onPointerUp={(event) => {
        event.stopPropagation();
        dragging.current = false;
        (event.target as Element).releasePointerCapture(event.pointerId);
        if (!dragged.current) {
          growth.current = Math.min(1.65, growth.current + 0.1);
          feedPause.current = 0.55;
          setFeedId((current) => current + 1);
        }
      }}
      onPointerCancel={() => {
        dragging.current = false;
        dragged.current = false;
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = 'grab';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
      <AnimalModel
        kind={animal.kind}
        color={animal.color}
        accent={animal.accent}
        bodyRef={bodyRef}
        feedId={feedId}
        growth={growth.current}
        onFeedComplete={() => setFeedId((current) => (current === feedId ? 0 : current))}
      />
    </group>
  );
}

export default function IslandAnimals3D() {
  return (
    <group>
      {ANIMALS.map((animal, index) => (
        <WanderingAnimal key={`${animal.kind}-${index}`} animal={animal} index={index} />
      ))}
    </group>
  );
}
