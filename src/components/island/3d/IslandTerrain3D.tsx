
interface IslandTerrain3DProps {
  stage: 1 | 2 | 3 | 4 | 5;
}

const STAGE_COLORS = {
  1: {
    grass: '#91ad67',
    detail: '#789653',
    earth: '#93613e',
    lowerEarth: '#665568',
  },
  2: {
    grass: '#7bc67e',
    detail: '#5a9e5e',
    earth: '#93613e',
    lowerEarth: '#665568',
  },
  3: {
    grass: '#58b86b',
    detail: '#398c50',
    earth: '#93613e',
    lowerEarth: '#665568',
  },
  4: {
    grass: '#36a85c',
    detail: '#247b45',
    earth: '#93613e',
    lowerEarth: '#665568',
  },
  5: {
    grass: '#22a878',
    detail: '#16845d',
    earth: '#93613e',
    lowerEarth: '#59466b',
  },
};

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

export default function IslandTerrain3D({
  stage,
}: IslandTerrain3DProps) {
  const colors = STAGE_COLORS[stage];

  return (
    <group>
      {/* Base de tierra */}
      <mesh position={[0, -0.05, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[3.8, 3.8, 0.35, 8]} />
        <meshStandardMaterial
          color={colors.grass}
          roughness={0.9}
        />
      </mesh>

      {/* Capa inferior de tierra */}
      <mesh position={[0, -0.9, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3.8, 2.5, 1.5, 8]} />
        <meshStandardMaterial
          color={colors.earth}
          roughness={1}
        />
      </mesh>

      {/* Punta rocosa inferior */}
      <mesh position={[0, -2, 0]} castShadow>
        <coneGeometry args={[2.6, 2.4, 8]} />
        <meshStandardMaterial
          color={colors.lowerEarth}
          roughness={0.95}
        />
      </mesh>

      {/* Vegetación inicial */}
      <GrassPatch
        position={[-1.8, 0.14, 0.5]}
        color={colors.detail}
      />
      <GrassPatch
        position={[1.8, 0.14, -0.4]}
        color={colors.detail}
      />

      {/* Etapa 2: pequeños brotes */}
      {stage >= 2 && (
        <group>
          <GrassClump
            position={[-2.1, 0.14, -0.3]}
            color={colors.detail}
          />
          <GrassClump
            position={[2, 0.14, 0.4]}
            color={colors.detail}
          />
        </group>
      )}

      {/* Etapa 3: vegetación más abundante */}
      {stage >= 3 && (
        <group>
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
        </group>
      )}

      {/* Etapa 4: isla exuberante */}
      {stage >= 4 && (
        <group>
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
        </group>
      )}

      {/* Etapa 5: paraíso floreciente */}
      {stage >= 5 && (
        <group>
          <GrassClump
            position={[-0.8, 0.14, -2.2]}
            color="#b5e88a"
          />
          <GrassClump
            position={[1.8, 0.14, 1.5]}
            color="#b5e88a"
          />
          <GrassPatch
            position={[-1.7, 0.14, -1.5]}
            scale={1.3}
            color="#65c995"
          />
        </group>
      )}
    </group>
  );
}
