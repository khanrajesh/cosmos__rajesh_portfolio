import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface ShipModelProps {
  thrustIntensity: number;
  boostIntensity: number;
  rotationVelocity: THREE.Vector2; // x: pitch, y: yaw
  strafeVelocity: THREE.Vector2; // x: horizontal, y: vertical
}

export const ShipModel = ({ 
  thrustIntensity, 
  boostIntensity, 
  rotationVelocity, 
  strafeVelocity 
}: ShipModelProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const engineRef = useRef<THREE.Group>(null);
  const antennaRef = useRef<THREE.Group>(null);

  // Materials
  const materials = useMemo(() => ({
    hull: new THREE.MeshStandardMaterial({ 
      color: '#2a2a2e', 
      metalness: 0.9, 
      roughness: 0.2,
      envMapIntensity: 1
    }),
    panels: new THREE.MeshStandardMaterial({ 
      color: '#151518', 
      metalness: 0.7, 
      roughness: 0.5 
    }),
    cockpit: new THREE.MeshStandardMaterial({ 
      color: '#00ffff', 
      transparent: true, 
      opacity: 0.4, 
      metalness: 1, 
      roughness: 0 
    }),
    emissive: new THREE.MeshStandardMaterial({ 
      color: '#00ffff', 
      emissive: '#00ffff', 
      emissiveIntensity: 2 
    }),
    navRed: new THREE.MeshBasicMaterial({ color: '#ff0000' }),
    navGreen: new THREE.MeshBasicMaterial({ color: '#00ff00' }),
  }), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (groupRef.current) {
      // Dynamic tilt based on rotation and strafe
      const targetTiltZ = -rotationVelocity.x * 0.3 - strafeVelocity.x * 0.2;
      const targetTiltX = -rotationVelocity.y * 0.2 + strafeVelocity.y * 0.1;
      
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetTiltZ, 0.1);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetTiltX, 0.1);
      
      // Subtle idle breathing
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.05;
    }

    if (antennaRef.current) {
      antennaRef.current.rotation.z = t * 0.5;
    }

    // Update emissive intensity
    const engineColor = boostIntensity > 0.5 ? '#00ffff' : '#ff4400';
    materials.emissive.color.set(engineColor);
    materials.emissive.emissive.set(engineColor);
    materials.emissive.emissiveIntensity = 2 + thrustIntensity * 10 + boostIntensity * 20 + Math.sin(t * 10) * 0.5;
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
        {/* --- MAIN FUSELAGE --- */}
        <mesh material={materials.hull} castShadow>
          <capsuleGeometry args={[0.6, 2.5, 4, 16]} />
        </mesh>
        
        {/* Top Spine */}
        <mesh position={[0, 0.4, -0.5]} material={materials.panels}>
          <boxGeometry args={[0.3, 0.2, 2.5]} />
        </mesh>

        {/* --- COCKPIT --- */}
        <group position={[0, 0.3, 1.2]}>
          <mesh material={materials.cockpit}>
            <sphereGeometry args={[0.45, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
          </mesh>
          {/* Interior Detail */}
          <mesh position={[0, -0.1, 0]} material={materials.panels}>
            <boxGeometry args={[0.5, 0.1, 0.6]} />
          </mesh>
        </group>

        {/* --- ENGINE SECTION --- */}
        <group position={[0, 0, -1.8]}>
          {/* Main Engine Housing */}
          <mesh material={materials.panels} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.7, 0.8, 1.2, 8]} />
          </mesh>
          
          {/* Dual Exhausts */}
          {[-0.35, 0.35].map((x, i) => (
            <group key={i} position={[x, 0, -0.4]}>
              <mesh material={materials.hull} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.25, 0.3, 0.6, 16]} />
              </mesh>
              {/* Emissive Core */}
              <mesh position={[0, 0, -0.3]} material={materials.emissive}>
                <sphereGeometry args={[0.2, 16, 16]} />
              </mesh>
              {/* Engine Light */}
              <pointLight 
                color={boostIntensity > 0.5 ? '#00ffff' : '#ff4400'} 
                intensity={(thrustIntensity + boostIntensity * 2) * 5} 
                distance={10} 
              />
            </group>
          ))}
        </group>

        {/* --- SIDE THRUSTER PODS --- */}
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 1.1, -0.1, 0.2]}>
            {/* Pod Body */}
            <mesh material={materials.hull} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.25, 0.2, 1.2, 12]} />
            </mesh>
            {/* Structural Pylon */}
            <mesh position={[-side * 0.4, 0, 0]} material={materials.panels}>
              <boxGeometry args={[0.6, 0.1, 0.4]} />
            </mesh>
            
            {/* Front Maneuvering Thrusters */}
            <mesh position={[0, 0, 0.5]} material={materials.emissive} scale={[0.5, 0.5, 0.5]}>
              <sphereGeometry args={[0.15, 8, 8]} />
            </mesh>

            {/* Side Thruster Flash (Visual only) */}
            {(Math.abs(strafeVelocity.x) > 0.1 || Math.abs(rotationVelocity.y) > 0.1) && (
              <mesh position={[side * 0.2, 0, 0]} material={materials.emissive} scale={[0.4, 0.4, 0.4]}>
                <sphereGeometry args={[0.2, 8, 8]} />
              </mesh>
            )}
          </group>
        ))}

        {/* --- STABILIZER FINS --- */}
        {/* Horizontal Wings */}
        <mesh position={[0, 0, -0.8]} rotation={[0, 0, 0]}>
          <boxGeometry args={[4.5, 0.05, 1.2]} />
          <meshStandardMaterial color="#2a2a2e" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Vertical Fin */}
        <mesh position={[0, 0.6, -1.2]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.05, 0.8, 1.5]} />
          <meshStandardMaterial color="#151518" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* --- SENSOR MODULE / ANTENNA --- */}
        <group position={[0, 0.6, 0.2]} ref={antennaRef}>
          <mesh material={materials.panels}>
            <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
          </mesh>
          <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.3, 0.02, 8, 32]} />
            <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={1} />
          </mesh>
        </group>

        {/* --- NAVIGATION LIGHTS --- */}
        {/* Front Left (Red) */}
        <mesh position={[-2.1, 0, -0.8]} material={materials.navRed}>
          <sphereGeometry args={[0.08, 8, 8]} />
        </mesh>
        {/* Front Right (Green) */}
        <mesh position={[2.1, 0, -0.8]} material={materials.navGreen}>
          <sphereGeometry args={[0.08, 8, 8]} />
        </mesh>
        {/* Tail (Blinking Red) */}
        <mesh position={[0, 1.3, -1.8]} material={materials.navRed}>
          <sphereGeometry args={[0.1, 8, 8]} />
        </mesh>
      </Float>
    </group>
  );
};
