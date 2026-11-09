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
] as const;

const GROUND_Y = 0.17;
const ISLAND_RADIUS = 3.05;
const DRAG_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), -GROUND_Y);

function nextWanderTarget(index: number, step: number) {
  const angle = index * 2.4 + step * 2.15;
  const radius = 0.65 + ((index + step) % 4) * 0.52;
  return new THREE.Vector3(
    Math.cos(angle) * radius,
    GROUND_Y,
    Math.sin(angle) * radius,
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
  onFeedComplete,
}: {
  kind: string;
  color: string;
  accent: string;
  bodyRef: React.RefObject<Group>;
  feedId: number;
  onFeedComplete: () => void;
}) {
  const isRabbit = kind === 'rabbit';
  const isFox = kind === 'fox';
  const isCat = kind === 'cat';
  const isBird = kind === 'bird' || kind === 'chick';
  const isFrog = kind === 'frog';
  const isTurtle = kind === 'turtle';
  const isSheep = kind === 'sheep';
  const earGeometry = isRabbit ? 'ellipsoid' : isFox || isCat || isFrog ? 'cone' : null;

  return (
    <group ref={bodyRef}>
      <mesh position={[0, 0.22, 0]} scale={isTurtle ? [0.29, 0.16, 0.35] : [0.3, 0.22, 0.38]} castShadow>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color={isTurtle ? accent : color} roughness={0.82} />
      </mesh>
      {!isTurtle && (
        <mesh position={[0, 0.39, 0.2]} scale={isBird ? [0.2, 0.2, 0.22] : [0.22, 0.23, 0.22]} castShadow>
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
          <coneGeometry args={[0.08, 0.17, 7]} />
          <meshStandardMaterial color={accent} />
        </mesh>
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
  const target = useRef(nextWanderTarget(index, 1));
  const dragPoint = useRef(new THREE.Vector3());
  const growth = useRef(1);
  const feedPause = useRef(0);
  const [feedId, setFeedId] = useState(0);
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
        target.current = nextWanderTarget(index, step.current + 1);
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
        const distance = Math.hypot(point.x, point.z);
        const factor = distance > ISLAND_RADIUS ? ISLAND_RADIUS / distance : 1;
        groupRef.current.position.x = point.x * factor;
        groupRef.current.position.z = point.z * factor;
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
