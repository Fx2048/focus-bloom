
import { Float } from '@react-three/drei';

type ElementType =
  | 'sprout'
  | 'flower'
  | 'rock'
  | 'bush'
  | 'mushroom'
  | 'tree'
  | 'butterfly'
  | 'crystal'
  | 'waterfall'
  | 'cabin'
  | 'bridge'
  | 'statue'
  | 'arch'
  | 'sanctuary';

interface IslandElement3DProps {
  type: ElementType;
  position: [number, number, number];
  scale?: number;
}

function Tree() {
  return (
    <group>
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.2, 1.3, 7]} />
        <meshStandardMaterial color="#795034" />
      </mesh>

      <mesh position={[0, 1.55, 0]} castShadow>
        <coneGeometry args={[0.85, 1.5, 7]} />
        <meshStandardMaterial color="#397c50" />
      </mesh>

      <mesh position={[0, 2.15, 0]} castShadow>
        <coneGeometry args={[0.58, 1.1, 7]} />
        <meshStandardMaterial color="#56a66b" />
      </mesh>
    </group>
  );
}

function Flower() {
  return (
    <group>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.035, 0.045, 0.5, 6]} />
        <meshStandardMaterial color="#438b50" />
      </mesh>

      <mesh position={[0, 0.52, 0]}>
        <sphereGeometry args={[0.13, 8, 8]} />
        <meshStandardMaterial color="#ffcf55" />
      </mesh>

      {Array.from({ length: 5 }).map((_, index) => {
        const angle = (index / 5) * Math.PI * 2;

        return (
          <mesh
            key={index}
            position={[
              Math.cos(angle) * 0.19,
              0.52,
              Math.sin(angle) * 0.19,
            ]}
          >
            <sphereGeometry args={[0.13, 8, 8]} />
            <meshStandardMaterial color="#ff91b5" />
          </mesh>
        );
      })}
    </group>
  );
}

function Bush() {
  return (
    <group>
      <mesh position={[-0.2, 0.25, 0]} castShadow>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color="#397d48" />
      </mesh>

      <mesh position={[0.2, 0.3, 0]}>
        <sphereGeometry args={[0.38, 8, 8]} />
        <meshStandardMaterial color="#55a45e" />
      </mesh>
    </group>
  );
}

function Rock() {
  return (
    <mesh position={[0, 0.2, 0]} rotation={[0.2, 0.4, 0.1]} castShadow>
      <dodecahedronGeometry args={[0.38, 0]} />
      <meshStandardMaterial color="#8b8291" roughness={0.9} />
    </mesh>
  );
}

function Mushroom() {
  return (
    <group>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.12, 0.16, 0.4, 8]} />
        <meshStandardMaterial color="#f5e5c8" />
      </mesh>

      <mesh position={[0, 0.43, 0]}>
        <sphereGeometry args={[0.35, 10, 8]} />
        <meshStandardMaterial color="#d95757" />
      </mesh>
    </group>
  );
}

function Sprout() {
  return (
    <group>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.025, 0.035, 0.6, 6]} />
        <meshStandardMaterial color="#39834c" />
      </mesh>

      <mesh position={[-0.13, 0.45, 0]} rotation={[0, 0, 0.6]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#72c77b" />
      </mesh>

      <mesh position={[0.13, 0.52, 0]} rotation={[0, 0, -0.6]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#72c77b" />
      </mesh>
    </group>
  );
}

function Crystal() {
  return (
    <mesh position={[0, 0.55, 0]} rotation={[0, 0, 0.08]} castShadow>
      <octahedronGeometry args={[0.55, 0]} />
      <meshStandardMaterial
        color="#a78bfa"
        emissive="#7040d0"
        emissiveIntensity={0.35}
        roughness={0.2}
        metalness={0.25}
      />
    </mesh>
  );
}

function Butterfly() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#513b70" />
      </mesh>

      <mesh position={[-0.16, 0.05, 0]} scale={[1, 0.65, 0.15]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#ff91c8" />
      </mesh>

      <mesh position={[0.16, 0.05, 0]} scale={[1, 0.65, 0.15]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#ff91c8" />
      </mesh>
    </group>
  );
}



function Cabin() {
  return (
    <group>
      {/* Paredes */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[1.1, 1.1, 0.9]} />
        <meshStandardMaterial color="#bd8758" />
      </mesh>

      {/* Techo */}
      <mesh position={[0, 1.25, 0]} castShadow>
        <coneGeometry args={[0.95, 0.8, 4]} />
        <meshStandardMaterial color="#75434a" />
      </mesh>

      {/* Puerta */}
      <mesh position={[0, 0.35, 0.46]}>
        <boxGeometry args={[0.28, 0.65, 0.05]} />
        <meshStandardMaterial color="#51352c" />
      </mesh>

      {/* Ventana */}
      <mesh position={[0.35, 0.72, 0.47]}>
        <boxGeometry args={[0.22, 0.22, 0.04]} />
        <meshStandardMaterial color="#a9e5f5" emissive="#6abbd5" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function Bridge() {
  return (
    <group>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[0, 0.12, (i - 2) * 0.3]}>
          <boxGeometry args={[1.1, 0.12, 0.25]} />
          <meshStandardMaterial color="#a87545" />
        </mesh>
      ))}

      {[-0.48, 0.48].map((x) => (
        <mesh key={x} position={[x, 0.38, 0]}>
          <boxGeometry args={[0.08, 0.55, 1.4]} />
          <meshStandardMaterial color="#754c35" />
        </mesh>
      ))}
    </group>
  );
}

function Waterfall() {
  return (
    <group>
      {/* Caída de agua */}
      <mesh position={[0, -0.35, 0]}>
        <boxGeometry args={[0.55, 1.5, 0.25]} />
        <meshStandardMaterial
          color="#65d9f5"
          transparent
          opacity={0.75}
          roughness={0.15}
          metalness={0.2}
        />
      </mesh>

      {/* Agua brillante en la parte superior */}
      <mesh position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.38, 12, 8]} />
        <meshStandardMaterial color="#9cecff" />
      </mesh>
    </group>
  );
}

function Statue() {
  return (
    <group>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.4, 0.48, 0.35, 8]} />
        <meshStandardMaterial color="#a69aa9" />
      </mesh>

      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.25, 1, 8]} />
        <meshStandardMaterial color="#b8a9c4" />
      </mesh>

      <mesh position={[0, 1.45, 0]} castShadow>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial color="#d1c3d8" />
      </mesh>
    </group>
  );
}

function Arch() {
  return (
    <group>
      {[-0.65, 0.65].map((x) => (
        <mesh key={x} position={[x, 0.8, 0]} castShadow>
          <boxGeometry args={[0.22, 1.6, 0.3]} />
          <meshStandardMaterial color="#a88bd0" />
        </mesh>
      ))}

      <mesh position={[0, 1.65, 0]}>
        <boxGeometry args={[1.5, 0.22, 0.3]} />
        <meshStandardMaterial
          color="#c5a2fa"
          emissive="#8754d4"
          emissiveIntensity={0.4}
        />
      </mesh>
    </group>
  );
}

function Sanctuary() {
  return (
    <group>
      {/* Base */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.9, 1.05, 0.4, 8]} />
        <meshStandardMaterial color="#a78bfa" />
      </mesh>

      {/* Estructura central */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.55, 0.7, 1, 8]} />
        <meshStandardMaterial color="#e1d2ff" />
      </mesh>

      {/* Cúpula */}
      <mesh position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.65, 12, 8]} />
        <meshStandardMaterial
          color="#c7a5ff"
          emissive="#8754d4"
          emissiveIntensity={0.6}
        />
      </mesh>
    </group>
  );
}


export default function IslandElement3D({
  type,
  position,
  scale = 1,
}: IslandElement3DProps) {
  const models: Record<ElementType, React.ReactNode> = {
    sprout: <Sprout />,
    flower: <Flower />,
    rock: <Rock />,
    bush: <Bush />,
    mushroom: <Mushroom />,
    tree: <Tree />,
    butterfly: <Butterfly />,
    crystal: <Crystal />,
    waterfall: <Waterfall />,
    cabin: <Cabin />,
    bridge: <Bridge />,
    statue: <Statue />,
    arch: <Arch />,
    sanctuary: <Sanctuary />,
  };

  const model = models[type];

  return (
    <group position={position} scale={scale}>
      {type === 'butterfly' || type === 'crystal' ? (
        <Float speed={1.2} floatIntensity={0.15}>
          {model}
        </Float>
      ) : (
        model
      )}
    </group>
  );
}
