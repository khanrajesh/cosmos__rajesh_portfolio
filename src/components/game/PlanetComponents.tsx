import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, MoonData, PlanetVisualConfig } from '../../store/useGameStore';

export const Moon = React.memo(({ data, parentPlanetId }: { data: MoonData; parentPlanetId: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const lineRef = useRef<any>(null);
  const { simulationTime, planetStates, isInspectionMode } = useGameStore();
  const parentState = planetStates[parentPlanetId];
  const isParentDestroyed = parentState?.isDestroyed;
  
  const driftRef = useRef<{
    isDrifting: boolean;
    velocity: THREE.Vector3;
    startPos: THREE.Vector3;
    startTime: number;
  }>({
    isDrifting: false,
    velocity: new THREE.Vector3(),
    startPos: new THREE.Vector3(),
    startTime: 0
  });

  const trajectoryPoints = useMemo(() => {
    const points = [];
    for (let i = 0; i < 50; i++) {
      points.push(new THREE.Vector3());
    }
    return points;
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;

    if (isParentDestroyed && !driftRef.current.isDrifting) {
      const angle = (parentState.destructionTime || simulationTime) * data.speed;
      const currentPos = new THREE.Vector3(
        Math.cos(angle) * data.distance,
        0,
        Math.sin(angle) * data.distance
      );
      
      const tangent = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle));
      const speed = data.distance * data.speed;
      
      driftRef.current = {
        isDrifting: true,
        velocity: tangent.multiplyScalar(speed),
        startPos: currentPos,
        startTime: parentState.destructionTime || simulationTime
      };
    }

    if (driftRef.current.isDrifting) {
      const t = simulationTime - driftRef.current.startTime;
      const currentPos = driftRef.current.startPos.clone().add(driftRef.current.velocity.clone().multiplyScalar(t));
      meshRef.current.position.copy(currentPos);
      meshRef.current.rotation.y += 0.02;
      
      if (isInspectionMode && lineRef.current) {
        const points = [];
        for (let i = 0; i < 50; i++) {
          const futureT = t + i * 2;
          points.push(driftRef.current.startPos.clone().add(driftRef.current.velocity.clone().multiplyScalar(futureT)));
        }
        lineRef.current.setPoints(points);
      }

      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.transparent = true;
        mat.opacity = Math.max(0, 1 - t * 0.01);
      }
    } else {
      const angle = simulationTime * data.speed;
      meshRef.current.position.x = Math.cos(angle) * data.distance;
      meshRef.current.position.z = Math.sin(angle) * data.distance;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group>
      {isInspectionMode && driftRef.current.isDrifting && (
        <Line
          ref={lineRef}
          points={trajectoryPoints}
          color="#ff4400"
          lineWidth={1}
          transparent
          opacity={0.4}
          dashed
          dashScale={0.5}
        />
      )}
      <mesh ref={meshRef}>
        <sphereGeometry args={[data.radius, 16, 16]} />
        <meshStandardMaterial color={data.color} roughness={0.8} />
      </mesh>
    </group>
  );
});

export const Atmosphere = React.memo(({ config, radius }: { config: NonNullable<PlanetVisualConfig['atmosphere']>; radius: number }) => {
  return (
    <mesh scale={[config.intensity, config.intensity, config.intensity]}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial 
        color={config.color} 
        transparent 
        opacity={config.opacity} 
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
});

export const Clouds = React.memo(({ config, radius }: { config: NonNullable<PlanetVisualConfig['clouds']>; radius: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const simulationTime = useGameStore((state) => state.simulationTime);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = simulationTime * config.speed * 0.1;
      meshRef.current.rotation.x = simulationTime * config.speed * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} scale={[1.02, 1.02, 1.02]}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial 
        color={config.color} 
        transparent 
        opacity={config.opacity} 
        alphaTest={0.1}
        depthWrite={false}
      />
    </mesh>
  );
});

export const Rings = React.memo(({ config, radius }: { config: NonNullable<PlanetVisualConfig['rings']>; radius: number }) => {
  return (
    <mesh rotation={[Math.PI / 2.5, 0, 0]}>
      <ringGeometry args={[radius * config.innerRadius, radius * config.outerRadius, 128]} />
      <meshStandardMaterial 
        color={config.color} 
        transparent 
        opacity={config.opacity} 
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
});

export const TargetHighlight = React.memo(({ radius, isScanning, scanProgress }: { radius: number; isScanning: boolean; scanProgress: number }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  const bracketsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.5;
      ringRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.02);
    }
    if (bracketsRef.current) {
      bracketsRef.current.scale.setScalar(1 + Math.sin(t * 4) * 0.01);
    }
  });

  return (
    <group>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius + 2, radius + 2.2, 64]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius + 2.5, radius + 2.6, 64]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>

      <group ref={bracketsRef}>
        {[-1, 1].map((x) => (
          [-1, 1].map((y) => (
            <group key={`${x}-${y}`} position={[x * (radius + 3), y * (radius + 3), 0]}>
              <mesh>
                <boxGeometry args={[2, 0.2, 0.2]} />
                <meshBasicMaterial color="#00ffff" />
              </mesh>
              <mesh rotation={[0, 0, Math.PI / 2]} position={[-x * 1, y * 1, 0]}>
                <boxGeometry args={[2, 0.2, 0.2]} />
                <meshBasicMaterial color="#00ffff" />
              </mesh>
            </group>
          ))
        ))}
      </group>

      {isScanning && (
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh scale={1 + (scanProgress / 100) * 0.5}>
            <ringGeometry args={[radius + 1.5, radius + 1.8, 64]} />
            <meshBasicMaterial color="#ff8800" transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  );
});

export const GravityWell = React.memo(({ planet, isTarget, isDestroyed }: { planet: any; isTarget: boolean; isDestroyed?: boolean }) => {
  const showGravityOverlay = useGameStore((state) => state.showGravityOverlay);
  
  if (!showGravityOverlay) return null;

  const currentRadius = isDestroyed ? planet.gravityRadius * 0.2 : planet.gravityRadius;
  const currentOpacity = isDestroyed ? 0.02 : (isTarget ? 0.1 : 0.05);

  return (
    <group>
      {/* Influence Sphere */}
      <mesh>
        <sphereGeometry args={[currentRadius, 32, 16]} />
        <meshBasicMaterial 
          color={isDestroyed ? "#ff0000" : planet.color} 
          wireframe 
          transparent 
          opacity={currentOpacity} 
          depthWrite={false}
        />
      </mesh>

      {/* Core Well */}
      {!isDestroyed && (
        <mesh>
          <sphereGeometry args={[planet.radius * 1.5, 32, 16]} />
          <meshBasicMaterial 
            color={planet.color} 
            transparent 
            opacity={isTarget ? 0.2 : 0.1} 
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Info Label */}
      <group position={[0, currentRadius + 5, 0]}>
        <Text
          fontSize={currentRadius * 0.05 + 2}
          color={isDestroyed ? "#ff4444" : planet.color}
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
        >
          {isDestroyed 
            ? `${planet.name.toUpperCase()} [COLLAPSED WELL]\nMASS: MINIMAL`
            : `${planet.name.toUpperCase()} WELL\nMASS: ${planet.mass} | G: ${planet.gravityStrength}`
          }
        </Text>
      </group>
    </group>
  );
});
