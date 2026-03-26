import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles, Gltf } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { WEAPONS, PLANETS } from '../../constants/gameData';

export const WeaponSystem = () => {
  const { 
    shipPosition, 
    shipQuaternion, 
    targetPlanetId, 
    currentWeaponId,
    isFiring,
    setIsFiring,
    isCharging,
    setIsCharging,
    chargeProgress,
    setChargeProgress,
    weaponEnergy,
    setWeaponEnergy,
    setPlanetDamage,
    simulationTime,
    weaponMode,
    weaponEffectIntensity
  } = useGameStore();

  const beamRef = useRef<THREE.Group>(null);
  const impactRef = useRef<THREE.Group>(null);
  const [targetPos, setTargetPos] = useState(new THREE.Vector3());
  const [beamOpacity, setBeamOpacity] = useState(0);

  const weapon = WEAPONS.find(w => w.id === currentWeaponId) || WEAPONS[0];

  useFrame((state, delta) => {
    if (!targetPlanetId || weaponMode !== 'armed') {
      if (isFiring) setIsFiring(false);
      if (isCharging) setIsCharging(false);
      setBeamOpacity(0);
      return;
    }

    const planet = PLANETS.find(p => p.id === targetPlanetId);
    if (!planet) return;

    // Calculate planet position
    const angle = simulationTime * planet.speed;
    const pPos = new THREE.Vector3(
      Math.cos(angle) * planet.distance,
      0,
      Math.sin(angle) * planet.distance
    );
    setTargetPos(pPos);

    // Check distance - must be within range
    const dist = shipPosition.distanceTo(pPos);
    const inRange = dist < 300; // Max weapon range

    if (isFiring && inRange) {
      if (!isCharging && weaponEnergy >= weapon.energyCost) {
        setIsCharging(true);
        setChargeProgress(0);
      }

      if (isCharging) {
        const nextProgress = chargeProgress + delta / weapon.chargeTime;
        if (nextProgress >= 1) {
          // FIRE!
          setIsCharging(false);
          setChargeProgress(0);
          setWeaponEnergy(Math.max(0, weaponEnergy - weapon.energyCost));
          
          // Apply damage
          const currentDamage = useGameStore.getState().planetStates[targetPlanetId]?.damage || 0;
          setPlanetDamage(targetPlanetId, currentDamage + (weapon.damage / 100));
          
          // Visual flash
          setBeamOpacity(1);
        } else {
          setChargeProgress(nextProgress);
          // Charging visuals
          setBeamOpacity(nextProgress * 0.3);
        }
      }
    } else {
      if (isCharging) {
        setIsCharging(false);
        setChargeProgress(0);
      }
      setBeamOpacity(Math.max(0, beamOpacity - delta * 2));
      
      // Regenerate energy
      if (weaponEnergy < 100 && !isFiring) {
        setWeaponEnergy(Math.min(100, weaponEnergy + delta * 15));
      }
    }

    // Update beam orientation
    if (beamRef.current) {
      beamRef.current.position.copy(shipPosition);
      beamRef.current.lookAt(pPos);
      
      // Scale beam length and width
      beamRef.current.scale.set(1, 1, dist);
    }

    if (impactRef.current) {
      impactRef.current.position.copy(pPos);
      impactRef.current.lookAt(shipPosition);
    }
  });

  if (weaponMode !== 'armed' || !targetPlanetId) return null;

  const beamWidth = weapon.id === 'laser' ? 0.2 : 0.8;

  return (
    <group>
      {/* Charging Sphere at Ship Nose */}
      {isCharging && (
        <group position={shipPosition}>
          <mesh>
            <sphereGeometry args={[chargeProgress * 2 * weaponEffectIntensity, 16, 16]} />
            <meshBasicMaterial 
              color={weapon.color} 
              transparent 
              opacity={0.5 * weaponEffectIntensity} 
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <Sparkles 
            count={Math.round(20 * chargeProgress * weaponEffectIntensity)} 
            scale={chargeProgress * 3} 
            size={2} 
            speed={4} 
            color={weapon.color} 
          />
        </group>
      )}

      {/* Beam Effect */}
      <group ref={beamRef}>
        {/* Outer Beam */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.5]}>
          <cylinderGeometry args={[beamWidth * weaponEffectIntensity, beamWidth * 1.5 * weaponEffectIntensity, 1, 8, 1, true]} />
          <meshBasicMaterial 
            color={weapon.color} 
            transparent 
            opacity={beamOpacity * weaponEffectIntensity} 
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Inner core */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.5]}>
          <cylinderGeometry args={[beamWidth * 0.3 * weaponEffectIntensity, beamWidth * 0.5 * weaponEffectIntensity, 1, 8, 1, true]} />
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={beamOpacity * 0.8 * weaponEffectIntensity} 
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Impact Effect */}
      <group ref={impactRef}>
        <Sparkles 
          count={Math.round(50 * beamOpacity * weaponEffectIntensity)} 
          scale={10 * beamOpacity * weaponEffectIntensity} 
          size={2 * weaponEffectIntensity} 
          speed={3} 
          color={weapon.color} 
          opacity={beamOpacity * weaponEffectIntensity} 
        />
        <mesh>
          <sphereGeometry args={[5 * beamOpacity * weaponEffectIntensity, 16, 16]} />
          <meshBasicMaterial 
            color={weapon.color} 
            transparent 
            opacity={beamOpacity * 0.5 * weaponEffectIntensity} 
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <pointLight 
          color={weapon.color} 
          intensity={beamOpacity * 20 * weaponEffectIntensity} 
          distance={100} 
        />
      </group>
    </group>
  );
};
