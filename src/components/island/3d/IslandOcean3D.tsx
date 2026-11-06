
import type { ThemeConfig } from '../IslandCanvas';

export default function IslandOcean3D({ theme }: { theme: ThemeConfig }) {
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
          color={theme.water}
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

