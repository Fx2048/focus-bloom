const ISLETS = [
  { id: 'andes', position: [-6.1, -0.18, 0] as [number, number, number], color: '#78945a' },
  { id: 'amazon', position: [6.1, -0.18, 0] as [number, number, number], color: '#31896a' },
  { id: 'machu-picchu', position: [0, -0.18, -6.1] as [number, number, number], color: '#8a9b61' },
];

function Islet({ id, position, color }: (typeof ISLETS)[number]) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.72, 1.43, 0.72, 12]} />
        <meshStandardMaterial color={color} roughness={0.92} />
      </mesh>
      <mesh position={[0, -0.48, 0]} castShadow>
        <coneGeometry args={[1.25, 1.05, 10]} />
        <meshStandardMaterial color="#80634b" roughness={1} />
      </mesh>
      {id === 'amazon' && (
        <>
          {[-0.8, 0.75].map((x) => (
            <group key={x} position={[x, 0.15, -0.15]}>
              <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.08, 0.12, 1, 7]} />
                <meshStandardMaterial color="#74533a" />
              </mesh>
              <mesh position={[0, 1.18, 0]}>
                <sphereGeometry args={[0.55, 10, 8]} />
                <meshStandardMaterial color="#16714f" />
              </mesh>
            </group>
          ))}
        </>
      )}
      {id === 'andes' && (
        <>
          <mesh position={[-0.55, 0.55, -0.2]} rotation={[0.1, 0.3, 0]}>
            <coneGeometry args={[0.75, 1.65, 5]} />
            <meshStandardMaterial color="#777a72" flatShading />
          </mesh>
          <mesh position={[-0.55, 1.3, -0.2]}>
            <coneGeometry args={[0.28, 0.48, 5]} />
            <meshStandardMaterial color="#f0eadc" />
          </mesh>
        </>
      )}
      {id === 'machu-picchu' && (
        <>
          {[-0.7, -0.25, 0.2, 0.65].map((x, index) => (
            <mesh key={x} position={[x, 0.2 + (index % 2) * 0.12, -0.55]} castShadow>
              <boxGeometry args={[0.32, 0.42 + (index % 2) * 0.22, 0.28]} />
              <meshStandardMaterial color="#8c8068" roughness={0.95} />
            </mesh>
          ))}
          <mesh position={[0, 0.53, -0.55]}>
            <boxGeometry args={[1.8, 0.12, 0.38]} />
            <meshStandardMaterial color="#a09273" />
          </mesh>
        </>
      )}
    </group>
  );
}

function IslandBridge({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {Array.from({ length: 7 }, (_, index) => (
        <mesh key={index} position={[0, 0.05, (index - 3) * 0.28]} castShadow>
          <boxGeometry args={[0.95, 0.1, 0.23]} />
          <meshStandardMaterial color="#98734e" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

export default function IslandArchipelago3D() {
  return (
    <group>
      {ISLETS.map((islet) => <Islet key={islet.id} {...islet} />)}
      <IslandBridge position={[-4.72, 0.13, 0]} rotation={Math.PI / 2} />
      <IslandBridge position={[4.72, 0.13, 0]} rotation={Math.PI / 2} />
      <IslandBridge position={[0, 0.13, -4.72]} />
    </group>
  );
}
