import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

interface DebrisSystemProps {
  id: string;
  position: THREE.Vector3;
  radius: number;
  color: string;
  startTime: number;
}

const FRAGMENT_COUNT_LARGE = 5;
const FRAGMENT_COUNT_MEDIUM = 100;
const PARTICLE_COUNT = 500;

export const DebrisSystem = ({ id, position, radius, color, startTime }: DebrisSystemProps) => {
  const simulationTime = useGameStore((state) => state.simulationTime);
  const elapsed = simulationTime - startTime;

  // Large fragments (individual meshes for rigid-like behavior)
  const largeFragments = useMemo(() => {
    return Array.from({ length: FRAGMENT_COUNT_LARGE }).map((_, i) => ({
      id: i,
      velocity: new THREE.Vector3().randomDirection().multiplyScalar(5 + Math.random() * 10),
      rotationSpeed: new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(0.05),
      size: radius * (0.3 + Math.random() * 0.4),
      offset: new THREE.Vector3().randomDirection().multiplyScalar(radius * 0.2)
    }));
  }, [radius]);

  // Medium fragments (instanced)
  const mediumFragments = useMemo(() => {
    const data = [];
    for (let i = 0; i < FRAGMENT_COUNT_MEDIUM; i++) {
      data.push({
        velocity: new THREE.Vector3().randomDirection().multiplyScalar(2 + Math.random() * 15),
        rotationSpeed: new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(0.1),
        size: radius * (0.05 + Math.random() * 0.1),
        offset: new THREE.Vector3().randomDirection().multiplyScalar(radius * 0.1)
      });
    }
    return data;
  }, [radius]);

  const instancedRef = useRef<THREE.InstancedMesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const t = elapsed;
    if (t < 0) return;

    // Update Medium Fragments
    if (instancedRef.current) {
      const matrix = new THREE.Matrix4();
      const rotation = new THREE.Euler();
      const currentPos = new THREE.Vector3();
      
      mediumFragments.forEach((f, i) => {
        currentPos.copy(f.offset).add(f.velocity.clone().multiplyScalar(t));
        // Add some "drift" deceleration
        const driftFactor = Math.max(0.1, 1 - t * 0.05);
        currentPos.add(f.velocity.clone().multiplyScalar(t * driftFactor));
        
        rotation.set(
          f.rotationSpeed.x * t,
          f.rotationSpeed.y * t,
          f.rotationSpeed.z * t
        );
        
        matrix.makeRotationFromEuler(rotation);
        matrix.setPosition(currentPos);
        instancedRef.current!.setMatrixAt(i, matrix);
      });
      instancedRef.current.instanceMatrix.needsUpdate = true;
    }

    // Update Shockwave
    if (shockwaveRef.current) {
      const scale = 1 + t * 50;
      shockwaveRef.current.scale.setScalar(scale);
      const mat = shockwaveRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.8 - t * 0.5);
      shockwaveRef.current.visible = mat.opacity > 0;
    }

    // Update Particles (Fine Dust)
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const idx = i * 3;
        const dir = new THREE.Vector3(positions[idx], positions[idx+1], positions[idx+2]).normalize();
        const speed = 10 + (i % 10) * 5;
        const pPos = dir.multiplyScalar(radius + speed * t);
        positions[idx] = pPos.x;
        positions[idx+1] = pPos.y;
        positions[idx+2] = pPos.z;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      const mat = particlesRef.current.material as THREE.PointsMaterial;
      mat.opacity = Math.max(0, 0.6 - t * 0.2);
    }
  });

  return (
    <group position={position}>
      {/* Shockwave */}
      <mesh ref={shockwaveRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Large Fragments */}
      {largeFragments.map((f) => (
        <LargeFragment key={f.id} fragment={f} color={color} elapsed={elapsed} />
      ))}

      {/* Medium Fragments */}
      <instancedMesh ref={instancedRef} args={[undefined, undefined, FRAGMENT_COUNT_MEDIUM]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} roughness={0.9} metalness={0.1} />
      </instancedMesh>

      {/* Fine Dust */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={PARTICLE_COUNT}
            array={new Float32Array(PARTICLE_COUNT * 3).map(() => (Math.random() - 0.5) * 2)}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial color={color} size={1.5} transparent opacity={0.6} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>
    </group>
  );
};

const LargeFragment = ({ fragment, color, elapsed }: { fragment: any, color: string, elapsed: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      const t = elapsed;
      const driftFactor = Math.max(0.2, 1 - t * 0.02);
      const pos = fragment.offset.clone().add(fragment.velocity.clone().multiplyScalar(t * driftFactor));
      meshRef.current.position.copy(pos);
      meshRef.current.rotation.x = fragment.rotationSpeed.x * t;
      meshRef.current.rotation.y = fragment.rotationSpeed.y * t;
      meshRef.current.rotation.z = fragment.rotationSpeed.z * t;
      
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = Math.max(0.2, 1 - t * 0.05);
    }
  });

  return (
    <mesh ref={meshRef}>
      <polyhedronGeometry args={[
        [1,1,1, -1,1,1, -1,-1,1, 1,-1,1, 1,1,-1, -1,1,-1, -1,-1,-1, 1,-1,-1],
        [0,1,2, 0,2,3, 4,7,6, 4,6,5, 0,4,5, 0,5,1, 1,5,6, 1,6,2, 2,6,7, 2,7,3, 4,0,3, 4,3,7],
        fragment.size,
        1
      ]} />
      <meshStandardMaterial color={color} roughness={0.8} metalness={0.2} transparent />
    </mesh>
  );
};
