
export default function IslandOcean3D() {
  return (
    <group>
      {/* Superficie del océano */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -3.5, 0]}
        receiveShadow
      >
        <circleGeometry args={[12, 64]} />
        <meshStandardMaterial
          color="#287fa8"
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
          color="#70d8e8"
          transparent
          opacity={0.45}
        />
      </mesh>
    </group>
  );
}

