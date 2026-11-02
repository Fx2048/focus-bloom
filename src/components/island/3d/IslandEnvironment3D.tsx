
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Nube con movimiento horizontal y vertical suave.
function Cloud({
  position,
  scale = 1,
  speed = 0.3,
  phase = 0,
}: {
  position: [number, number, number];
  scale?: number;
  speed?: number;
  phase?: number;
}) {
  const cloudRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!cloudRef.current) return;

    const time = clock.elapsedTime * speed + phase;

    cloudRef.current.position.x =
      position[0] + Math.sin(time) * 0.35;

    cloudRef.current.position.y =
      position[1] + Math.sin(time * 1.4) * 0.12;
  });

  return (
    <group
      ref={cloudRef}
      position={position}
      scale={scale}
    >
      <mesh>
        <sphereGeometry args={[0.55, 20, 20]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.92}
        />
      </mesh>

      <mesh position={[0.55, -0.1, 0]}>
        <sphereGeometry args={[0.4, 20, 20]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.9}
        />
      </mesh>

      <mesh position={[-0.5, -0.1, 0]}>
        <sphereGeometry args={[0.38, 20, 20]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.9}
        />
      </mesh>

      <mesh position={[0.12, 0.2, 0.05]}>
        <sphereGeometry args={[0.38, 20, 20]} />
        <meshBasicMaterial
          color="#f4fbff"
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}

// Partículas mágicas estables y animadas.
function MagicParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  const positions = useMemo(() => {
    const count = 110;
    const values = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      values[i * 3] = (Math.random() - 0.5) * 14;
      values[i * 3 + 1] = Math.random() * 7;
      values[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }

    return values;
  }, []);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;

    if (particlesRef.current) {
      particlesRef.current.rotation.y = time * 0.035;
      particlesRef.current.rotation.x =
        Math.sin(time * 0.15) * 0.025;
    }

    if (materialRef.current) {
      materialRef.current.opacity =
        0.55 + Math.sin(time * 1.5) * 0.15;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>

      <pointsMaterial
        ref={materialRef}
        color="#ffe9a8"
        size={0.075}
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// Ambiente fantástico de la isla.
export default function IslandEnvironment3D() {
  return (
    <>
      {/* Cielo */}
      <color attach="background" args={['#b8dff5']} />

      {/* Nubes animadas */}
      <Cloud
        position={[-6, 4, -4]}
        scale={1.4}
        speed={0.25}
        phase={0}
      />

      <Cloud
        position={[5, 5, -3]}
        scale={1.8}
        speed={0.2}
        phase={2}
      />

      <Cloud
        position={[6, 3, 5]}
        scale={1.1}
        speed={0.32}
        phase={4}
      />

      {/* Polvo mágico */}
      <MagicParticles />
    </>
  );
}
