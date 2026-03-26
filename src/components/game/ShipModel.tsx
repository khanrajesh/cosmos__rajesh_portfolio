import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface ShipModelProps {
  thrustIntensity: number;
  boostIntensity: number;
  rotationVelocity: THREE.Vector2; // x: pitch, y: yaw
  strafeVelocity: THREE.Vector2; // x: horizontal, y: vertical
  shipHealth: number;
}

const DamageSparks = ({ shipHealth }: { shipHealth: number }) => {
  const sparksRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!sparksRef.current) return;
    const t = state.clock.getElapsedTime();
    sparksRef.current.children.forEach((child, i) => {
      child.position.set(
        Math.sin(t * (5 + i)) * 0.5, 
        Math.cos(t * (4 + i)) * 0.3, 
        Math.sin(t * (3 + i)) * 1.5
      );
      const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 10 + Math.sin(t * 30) * 5;
    });
  });

  return (
    <group ref={sparksRef}>
      {[...Array(3)].map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.05, 4, 4]} />
          <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" />
          <pointLight color="#ffaa00" intensity={shipHealth < 25 ? 2 : 0.5} distance={2} />
        </mesh>
      ))}
    </group>
  );
};

export const ShipModel = ({ 
  thrustIntensity, 
  boostIntensity, 
  rotationVelocity, 
  strafeVelocity,
  shipHealth
}: ShipModelProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const engineRef = useRef<THREE.Group>(null);
  const antennaRef = useRef<THREE.Group>(null);

  // Materials
  const materials = useMemo(() => ({
    hull: new THREE.MeshStandardMaterial({ 
      color: '#ffffff', // Pure white
      metalness: 0.7, 
      roughness: 0.15,
      envMapIntensity: 2.5
    }),
    panels: new THREE.MeshStandardMaterial({ 
      color: '#f0f0f0', // Off-white for panels
      metalness: 0.8, 
      roughness: 0.2 
    }),
    cockpit: new THREE.MeshStandardMaterial({ 
      color: '#44aaff', // Subtle blue tint
      transparent: true, 
      opacity: 0.4, 
      metalness: 1, 
      roughness: 0.05,
      envMapIntensity: 3
    }),
    emissive: new THREE.MeshStandardMaterial({ 
      color: '#00ffff', 
      emissive: '#00ffff', 
      emissiveIntensity: 2 
    }),
    navRed: new THREE.MeshBasicMaterial({ color: '#ff0000' }),
    navGreen: new THREE.MeshBasicMaterial({ color: '#00ff00' }),
  }), []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    
    if (groupRef.current) {
      // Dynamic tilt based on rotation and strafe
      // Yaw (rotationVelocity.y) and Strafe (strafeVelocity.x) should cause Roll (tiltZ)
      // Pitch (rotationVelocity.x) and Vertical Strafe (strafeVelocity.y) should cause Pitch (tiltX)
      const targetTiltZ = -rotationVelocity.y * 0.4 - strafeVelocity.x * 0.25;
      const targetTiltX = -rotationVelocity.x * 0.3 + strafeVelocity.y * 0.15;
      
      // Frame-rate independent lerp
      const tiltAlpha = 1 - Math.exp(-10 * delta);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetTiltZ, tiltAlpha);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetTiltX, tiltAlpha);
      
      // Subtle idle breathing with slight roll
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.04;
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.01;
    }

    if (antennaRef.current) {
      antennaRef.current.rotation.z = t * 0.8;
    }

    // Update emissive intensity
    const isCritical = shipHealth < 30;
    const engineColor = boostIntensity > 0.5 ? '#00ffff' : (isCritical && Math.sin(t * 20) > 0 ? '#ff0000' : '#ff4400');
    materials.emissive.color.set(engineColor);
    materials.emissive.emissive.set(engineColor);
    materials.emissive.emissiveIntensity = 2 + thrustIntensity * 12 + boostIntensity * 25 + Math.sin(t * 15) * 0.8;
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.15} floatIntensity={0.3}>
        {/* --- MAIN FUSELAGE --- */}
        <group>
          {/* Core Body */}
          <mesh material={materials.hull} castShadow>
            <capsuleGeometry args={[0.5, 3.0, 8, 32]} />
          </mesh>
          
          {/* Nose Cone - Sharper profile */}
          <mesh position={[0, 0, 2.0]} rotation={[Math.PI / 2, 0, 0]} material={materials.panels}>
            <cylinderGeometry args={[0.1, 0.5, 0.8, 16]} />
          </mesh>

          {/* Fuselage Side Intakes / Structural Elements */}
          {[-1, 1].map((side) => (
            <mesh key={`intake-${side}`} position={[side * 0.45, 0, 0.2]} rotation={[0, 0, side * 0.2]}>
              <boxGeometry args={[0.3, 0.6, 1.8]} />
              <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}
        </group>
        
        {/* Top Spine - More aggressive profile */}
        <mesh position={[0, 0.45, -0.4]} material={materials.panels}>
          <boxGeometry args={[0.2, 0.35, 3.6]} />
        </mesh>

        {/* --- COCKPIT --- */}
        <group position={[0, 0.35, 1.4]}>
          <mesh material={materials.cockpit}>
            <sphereGeometry args={[0.4, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.6]} />
          </mesh>
          {/* Interior Detail */}
          <mesh position={[0, -0.15, 0]} material={materials.panels}>
            <boxGeometry args={[0.4, 0.1, 0.7]} />
          </mesh>
        </group>

        {/* --- FORWARD CANARDS (Small front wings) --- */}
        {[-1, 1].map((side) => (
          <mesh key={`canard-${side}`} position={[side * 0.8, 0.1, 1.8]} rotation={[0, side * 0.2, 0]}>
            <boxGeometry args={[0.6, 0.02, 0.4]} />
            <meshStandardMaterial color="#ffffff" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}

        {/* --- ENGINE SECTION --- */}
        <group position={[0, 0, -2.4]}>
          {/* Main Engine Housing */}
          <mesh material={materials.panels} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.55, 0.8, 1.6, 16]} />
          </mesh>
          
          {/* Engine Winglets - Improved Silhouette */}
          {[-1, 1].map((side) => (
            <group key={`eng-wing-group-${side}`} position={[side * 0.8, 0, 0]}>
              {/* Horizontal Winglet */}
              <mesh rotation={[0, 0, side * 0.2]}>
                <boxGeometry args={[1.2, 0.05, 1.2]} />
                <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
              </mesh>
              {/* Vertical Tip */}
              <mesh position={[side * 0.6, 0.3, 0]} rotation={[0, 0, side * 0.5]}>
                <boxGeometry args={[0.05, 0.8, 1.0]} />
                <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
              </mesh>
            </group>
          ))}

          {/* Dual Exhausts */}
          {[-0.38, 0.38].map((x, i) => (
            <group key={i} position={[x, 0, -0.5]}>
              <mesh material={materials.hull} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.22, 0.32, 0.8, 16]} />
              </mesh>
              {/* Emissive Core */}
              <mesh position={[0, 0, -0.4]} material={materials.emissive}>
                <sphereGeometry args={[0.18, 16, 16]} />
              </mesh>
              {/* Engine Light */}
              <pointLight 
                color={boostIntensity > 0.5 ? '#00ffff' : '#ff4400'} 
                intensity={(thrustIntensity + boostIntensity * 2) * 8} 
                distance={12} 
              />
            </group>
          ))}
        </group>

        {/* --- SIDE THRUSTER PODS --- */}
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 1.2, -0.15, 0.4]}>
            {/* Pod Body */}
            <mesh material={materials.hull} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.22, 0.18, 1.5, 12]} />
            </mesh>
            {/* Structural Pylon */}
            <mesh position={[-side * 0.5, 0, 0]} material={materials.panels}>
              <boxGeometry args={[0.8, 0.08, 0.5]} />
            </mesh>
            
            {/* Front Maneuvering Thrusters */}
            <mesh position={[0, 0, 0.6]} material={materials.emissive} scale={[0.5, 0.5, 0.5]}>
              <sphereGeometry args={[0.12, 8, 8]} />
            </mesh>

            {/* Side Thruster Flash (Visual only) */}
            {(Math.abs(strafeVelocity.x) > 0.1 || Math.abs(rotationVelocity.y) > 0.1) && (
              <mesh position={[side * 0.2, 0, 0]} material={materials.emissive} scale={[0.4, 0.4, 0.4]}>
                <sphereGeometry args={[0.18, 8, 8]} />
              </mesh>
            )}
          </group>
        ))}

        {/* --- MAIN WINGS --- */}
        <group position={[0, 0, -0.8]}>
          {/* Horizontal Wings - Tapered look */}
          <mesh rotation={[0, 0, 0]}>
            <boxGeometry args={[5.8, 0.04, 1.6]} />
            <meshStandardMaterial color="#ffffff" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Wingtip Winglets - More prominent */}
          {[-1, 1].map((side) => (
            <group key={`wingtip-group-${side}`} position={[side * 2.9, 0, 0]}>
              <mesh position={[0, 0.4, 0]} rotation={[0, 0, side * 0.6]}>
                <boxGeometry args={[0.05, 1.2, 1.4]} />
                <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
              </mesh>
              {/* Secondary Winglet */}
              <mesh position={[side * -0.4, 0.2, -0.2]} rotation={[0, side * 0.4, side * 0.8]}>
                <boxGeometry args={[0.6, 0.04, 0.8]} />
                <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
              </mesh>
            </group>
          ))}
        </group>

        {/* Vertical Fin - More aggressive */}
        <mesh position={[0, 0.8, -1.8]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[0.05, 1.4, 2.2]} />
          <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* --- SENSOR MODULE / ANTENNA --- */}
        <group position={[0, 0.7, 0.4]} ref={antennaRef}>
          <mesh material={materials.panels}>
            <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
          </mesh>
          <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.25, 0.015, 8, 32]} />
            <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={1.5} />
          </mesh>
        </group>

        {/* --- NAVIGATION LIGHTS --- */}
        {/* Front Left (Red) */}
        <mesh position={[-2.6, 0.3, -0.6]} material={materials.navRed}>
          <sphereGeometry args={[0.07, 8, 8]} />
        </mesh>
        {/* Front Right (Green) */}
        <mesh position={[2.6, 0.3, -0.6]} material={materials.navGreen}>
          <sphereGeometry args={[0.07, 8, 8]} />
        </mesh>
        {/* Tail (Blinking Red) */}
        <mesh position={[0, 1.6, -2.2]} material={materials.navRed}>
          <sphereGeometry args={[0.09, 8, 8]} />
        </mesh>

        {/* --- DAMAGE SPARKS --- */}
        {shipHealth < 50 && <DamageSparks shipHealth={shipHealth} />}
      </Float>
    </group>
  );
};
