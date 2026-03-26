import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { ShipModel } from './ShipModel';

interface PortfolioBackgroundShipProps {
  mouse: React.MutableRefObject<THREE.Vector2>;
  scroll: React.MutableRefObject<number>;
}

export const PortfolioBackgroundShip: React.FC<PortfolioBackgroundShipProps> = ({ mouse, scroll }) => {
  const groupRef = useRef<THREE.Group>(null);
  const shipRef = useRef<THREE.Group>(null);

  // Smooth movement refs
  const targetPos = useRef(new THREE.Vector3(0, 0, 0));
  const targetRot = useRef(new THREE.Euler(0, 0, 0));
  const currentPos = useRef(new THREE.Vector3(0, 0, 0));
  const currentRot = useRef(new THREE.Euler(0, 0, 0));

  useFrame((state, delta) => {
    if (!groupRef.current || !shipRef.current) return;

    // 1. Idle Hover Motion (handled by Float component mostly, but we add some drift)
    const time = state.clock.getElapsedTime();
    
    // 2. Mouse Parallax
    // Map mouse -1 to 1 to some reasonable range
    targetPos.current.x = mouse.current.x * 2;
    targetPos.current.y = mouse.current.y * 1.5;
    
    // 3. Scroll Depth Response
    // Map scroll 0 to 1 to depth
    targetPos.current.z = -scroll.current * 10;
    
    // 4. Pointer Tilt
    targetRot.current.x = -mouse.current.y * 0.2;
    targetRot.current.y = mouse.current.x * 0.3;
    targetRot.current.z = -mouse.current.x * 0.1;

    // Damping / Easing
    const ease = 1 - Math.exp(-3 * delta);
    currentPos.current.lerp(targetPos.current, ease);
    
    // Manual Euler lerp for rotation
    currentRot.current.x = THREE.MathUtils.lerp(currentRot.current.x, targetRot.current.x, ease);
    currentRot.current.y = THREE.MathUtils.lerp(currentRot.current.y, targetRot.current.y, ease);
    currentRot.current.z = THREE.MathUtils.lerp(currentRot.current.z, targetRot.current.z, ease);

    groupRef.current.position.copy(currentPos.current);
    shipRef.current.rotation.copy(currentRot.current);
    
    // Add a slight constant drift
    groupRef.current.position.x += Math.sin(time * 0.5) * 0.2;
    groupRef.current.position.y += Math.cos(time * 0.3) * 0.2;
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <group ref={shipRef} scale={1.2}>
          <ShipModel 
            thrustIntensity={0.4} 
            boostIntensity={0} 
            rotationVelocity={new THREE.Vector2(0, 0)}
            strafeVelocity={new THREE.Vector2(0, 0)}
            shipHealth={100}
          />
        </group>
      </Float>
      
      {/* Subtle engine glow */}
      <pointLight position={[0, 0, -2]} intensity={1} color="#00ffff" distance={8} />
    </group>
  );
};
