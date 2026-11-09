import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const MOVE_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.23);
const MAX_TRAVEL = 7.65;

export default function IslandCharacter3D() {
  const character = useRef<THREE.Group>(null);
  const touches = useRef(new Set<number>());
  const target = useRef(new THREE.Vector3(-0.15, 0.23, 0.95));
  const dragPoint = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (!character.current) return;
    character.current.position.lerp(target.current, 1 - Math.exp(-delta * 7));
    character.current.rotation.y = THREE.MathUtils.damp(
      character.current.rotation.y,
      Math.atan2(target.current.x - character.current.position.x, target.current.z - character.current.position.z),
      7,
      delta,
    );
  });

  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.235, 0]}
        onPointerDown={(event) => {
          if (event.pointerType !== 'touch') return;
          touches.current.add(event.pointerId);
          event.stopPropagation();
        }}
        onPointerMove={(event) => {
          if (event.pointerType !== 'touch' || touches.current.size < 2) return;
          const point = event.ray.intersectPlane(MOVE_PLANE, dragPoint.current);
          if (!point) return;
          const distance = Math.hypot(point.x, point.z);
          const factor = distance > MAX_TRAVEL ? MAX_TRAVEL / distance : 1;
          target.current.set(point.x * factor, 0.23, point.z * factor);
          event.stopPropagation();
        }}
        onPointerUp={(event) => {
          touches.current.delete(event.pointerId);
          event.stopPropagation();
        }}
        onPointerCancel={(event) => touches.current.delete(event.pointerId)}
      >
        <circleGeometry args={[7.7, 48]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <group ref={character} position={target.current.toArray()}>
        <mesh position={[0, 0.58, 0]} castShadow>
          <capsuleGeometry args={[0.19, 0.48, 5, 10]} />
          <meshStandardMaterial color="#7c4cbd" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.05, 0]} castShadow>
          <sphereGeometry args={[0.24, 16, 12]} />
          <meshStandardMaterial color="#d99a70" roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.12, -0.015]} scale={[1, 0.78, 0.8]}>
          <sphereGeometry args={[0.245, 14, 10]} />
          <meshStandardMaterial color="#3c2927" roughness={1} />
        </mesh>
        <mesh position={[0, 0.78, 0.2]} castShadow>
          <boxGeometry args={[0.36, 0.07, 0.12]} />
          <meshStandardMaterial color="#f4cf67" />
        </mesh>
        {[-0.1, 0.1].map((x) => (
          <mesh key={x} position={[x, 0.12, 0.03]} castShadow>
            <capsuleGeometry args={[0.065, 0.16, 3, 6]} />
            <meshStandardMaterial color="#44304d" />
          </mesh>
        ))}
      </group>
    </>
  );
}
