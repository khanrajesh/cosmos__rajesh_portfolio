import { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Float, Trail, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { useKeyboard } from '../../hooks/useKeyboard';
import { SHIP_SPECS, PLANETS } from '../../constants/gameData';
import { ShipModel } from './ShipModel';

export const Ship = () => {
  const meshRef = useRef<THREE.Group>(null);
  const keys = useKeyboard();
  const { 
    setShipState, 
    status, 
    simulationTime, 
    targetPlanetId, 
    isAutoPilot, 
    setAutoPilot,
    cameraSensitivity,
    effectIntensity
  } = useGameStore();

  // Physics refs
  const velocity = useRef(new THREE.Vector3());
  const position = useRef(new THREE.Vector3(0, 0, 500));
  const rotation = useRef(new THREE.Euler(0, 0, 0));
  const quaternion = useRef(new THREE.Quaternion());
  
  // Visual state
  const [thrustIntensity, setThrustIntensity] = useState(0);
  const [boostIntensity, setBoostIntensity] = useState(0);
  const [rotationVelocity, setRotationVelocity] = useState(new THREE.Vector2());
  const [strafeVelocity, setStrafeVelocity] = useState(new THREE.Vector2());

  // Auto-pilot state
  const autoPilotPhase = useRef<'none' | 'approaching' | 'orbiting'>('none');

  useFrame((state, delta) => {
    if (!meshRef.current || status !== 'playing') return;

    const targetPlanet = PLANETS.find(p => p.id === targetPlanetId);
    let targetPos = new THREE.Vector3();
    
    if (targetPlanet) {
      const angle = simulationTime * targetPlanet.speed;
      targetPos.set(
        Math.cos(angle) * targetPlanet.distance,
        0,
        Math.sin(angle) * targetPlanet.distance
      );
    }

    // --- FLIGHT LOGIC ---
    let currentThrust = 0;
    let currentBoost = false;
    const moveDir = new THREE.Vector3();
    const rotateDir = new THREE.Vector2();
    let rollDir = 0;

    // --- GRAVITY SIMULATION ---
    let maxInfluence = 0;
    let dominantSourceId: string | null = null;
    const totalGravityForce = new THREE.Vector3();
    const { orbitAssist, setGravityInfluence, setGravitySourceId, setGravityVector } = useGameStore.getState();

    PLANETS.forEach((planet) => {
      const angle = simulationTime * planet.speed;
      const planetPos = new THREE.Vector3(
        Math.cos(angle) * planet.distance,
        0,
        Math.sin(angle) * planet.distance
      );

      const toPlanet = planetPos.clone().sub(position.current);
      const distance = toPlanet.length();

      if (distance < planet.gravityRadius) {
        // Calculate influence (0 at radius, 1 at surface)
        const influence = Math.pow(1 - (distance / planet.gravityRadius), 1.5);
        const planetState = useGameStore.getState().planetStates[planet.id];
        const massFactor = planetState?.isDestroyed ? 0.1 : 1.0;
        const strength = planet.gravityStrength * influence * massFactor;
        
        const force = toPlanet.normalize().multiplyScalar(strength);
        
        // User request: untill the sun gravity is 90% dont move the ship toward sun
        if (planet.id !== 'sun' || influence >= 0.9) {
          totalGravityForce.add(force);
        }

        if (influence > maxInfluence) {
          maxInfluence = influence;
          dominantSourceId = planet.id;
        }
      }
    });

    // Apply gravity to velocity
    if (totalGravityForce.length() > 0) {
      const finalForce = totalGravityForce.clone();
      if (orbitAssist) {
        // Orbit assist dampens the gravity pull to keep flight stable
        finalForce.multiplyScalar(0.2);
      }
      velocity.current.add(finalForce.multiplyScalar(delta));
    }

    // Sync gravity state to store (throttled or checked for changes)
    if (Math.abs(useGameStore.getState().gravityInfluence - maxInfluence) > 0.001) {
      setGravityInfluence(maxInfluence);
    }
    if (useGameStore.getState().gravitySourceId !== dominantSourceId) {
      setGravitySourceId(dominantSourceId);
    }
    setGravityVector(totalGravityForce);

    if (isAutoPilot && targetPlanet) {
      // --- AUTO-PILOT LOGIC ---
      const toTarget = targetPos.clone().sub(position.current);
      const distance = toTarget.length();
      const direction = toTarget.clone().normalize();

      // Slow down as we approach
      const speedLimit = distance < SHIP_SPECS.autoPilotSlowdownDist 
        ? Math.max(10, (distance / SHIP_SPECS.autoPilotSlowdownDist) * SHIP_SPECS.autoPilotSpeed)
        : SHIP_SPECS.autoPilotSpeed;

      if (distance > SHIP_SPECS.orbitDist) {
        autoPilotPhase.current = 'approaching';
        
        // Rotate towards target
        const targetQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
        quaternion.current.slerp(targetQuat, 2 * delta);
        rotation.current.setFromQuaternion(quaternion.current);

        // Move forward
        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion.current);
        velocity.current.add(forward.multiplyScalar(SHIP_SPECS.acceleration * delta));
        
        // Cap speed
        if (velocity.current.length() > speedLimit) {
          velocity.current.setLength(speedLimit);
        }
      } else {
        autoPilotPhase.current = 'orbiting';
        velocity.current.lerp(new THREE.Vector3(), 0.1);
        const targetQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
        quaternion.current.slerp(targetQuat, 2 * delta);
      }

      // Exit auto-pilot if keys are pressed
      if (keys.current['KeyW'] || keys.current['KeyS'] || keys.current['KeyA'] || keys.current['KeyD'] || keys.current['Space']) {
        setAutoPilot(false);
        autoPilotPhase.current = 'none';
      }
    } else {
      // --- MANUAL CONTROLS ---
      const sensitivity = 1 + cameraSensitivity;
      if (keys.current['KeyW']) rotateDir.y = 1;
      if (keys.current['KeyS']) rotateDir.y = -1;
      if (keys.current['KeyA']) rotateDir.x = 1;
      if (keys.current['KeyD']) rotateDir.x = -1;
      if (keys.current['KeyQ']) rollDir = 1;
      if (keys.current['KeyE']) rollDir = -1;

      rotation.current.x += rotateDir.y * SHIP_SPECS.rotationSpeed * sensitivity * delta;
      rotation.current.y += rotateDir.x * SHIP_SPECS.rotationSpeed * sensitivity * delta;
      rotation.current.z += rollDir * SHIP_SPECS.rotationSpeed * sensitivity * delta;
      quaternion.current.setFromEuler(rotation.current);

      // Thrust & Boost
      currentBoost = !!keys.current['ShiftLeft'];
      const { weaponMode, setIsFiring } = useGameStore.getState();
      
      if (weaponMode === 'armed') {
        if (keys.current['Space']) {
          setIsFiring(true);
          currentThrust = 0;
        } else {
          setIsFiring(false);
          if (keys.current['KeyW']) currentThrust = 0.5; // Allow some movement while armed
        }
      } else {
        if (keys.current['Space']) currentThrust = 1;
      }
      
      if (keys.current['KeyC']) currentThrust = -0.5;

      // Strafe
      if (keys.current['ArrowLeft']) moveDir.x = 1;
      if (keys.current['ArrowRight']) moveDir.x = -1;
      if (keys.current['ArrowUp']) moveDir.y = -1;
      if (keys.current['ArrowDown']) moveDir.y = 1;

      const accel = SHIP_SPECS.acceleration * (currentBoost ? SHIP_SPECS.boostMultiplier : 1);
      const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion.current);
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(quaternion.current);
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(quaternion.current);

      velocity.current.add(forward.multiplyScalar(currentThrust * accel * delta));
      velocity.current.add(right.multiplyScalar(moveDir.x * SHIP_SPECS.strafeSpeed * delta));
      velocity.current.add(up.multiplyScalar(moveDir.y * SHIP_SPECS.strafeSpeed * delta));

      // Friction
      velocity.current.multiplyScalar(SHIP_SPECS.friction);

      // Speed Cap
      const maxSpeed = SHIP_SPECS.maxSpeed * (currentBoost ? SHIP_SPECS.boostMultiplier : 1);
      if (velocity.current.length() > maxSpeed) {
        velocity.current.setLength(maxSpeed);
      }
    }

    // Update Position
    position.current.add(velocity.current.clone().multiplyScalar(delta));
    
    // Apply to mesh
    meshRef.current.position.copy(position.current);
    meshRef.current.quaternion.copy(quaternion.current);

    // --- SCANNING LOGIC ---
    const { isScanning, scanProgress, setScanProgress, setIsScanning, addScannedPlanet, scannedPlanetIds, objective, setObjective } = useGameStore.getState();
    
    if (isScanning && targetPlanet) {
      const dist = position.current.distanceTo(targetPos);
      const canScan = dist < targetPlanet.radius + SHIP_SPECS.discoveryRange;
      
      if (canScan) {
        const nextProgress = Math.min(100, scanProgress + delta * 25);
        setScanProgress(nextProgress);
        
        if (nextProgress >= 100 && !scannedPlanetIds.includes(targetPlanet.id)) {
          addScannedPlanet(targetPlanet.id);
          setIsScanning(false);
          setScanProgress(0);
          
          if (targetPlanet.id === 'earth' && objective === 'Scan Earth') {
            setObjective('Mission Complete: Earth Scanned. Explore the system.');
          }
        }
      }
    } else if (targetPlanet && objective === 'Travel to Earth' && targetPlanet.id === 'earth') {
      const dist = position.current.distanceTo(targetPos);
      if (dist < targetPlanet.radius + SHIP_SPECS.discoveryRange + 20) {
        setObjective('Scan Earth');
      }
    }

    // Visual feedback
    setThrustIntensity(THREE.MathUtils.lerp(thrustIntensity, currentThrust || (isAutoPilot ? 0.5 : 0), 0.15));
    setBoostIntensity(THREE.MathUtils.lerp(boostIntensity, currentBoost ? 1 : 0, 0.1));
    setRotationVelocity(new THREE.Vector2(rotateDir.y, rotateDir.x));
    setStrafeVelocity(new THREE.Vector2(moveDir.x, moveDir.y));

    // Sync to store
    setShipState(position.current, velocity.current, quaternion.current, currentBoost);
  });

  const engineColor = boostIntensity > 0.5 ? "#00ffff" : "#ff4400";

  return (
    <group ref={meshRef}>
      {/* Engine Trails */}
      {effectIntensity > 0.1 && (
        <>
          <group position={[-0.4, 0, -1.8]}>
            <Trail
              width={2 * thrustIntensity}
              length={15 * effectIntensity * (boostIntensity + 1)}
              color={new THREE.Color(engineColor)}
              attenuation={(t) => t * t}
            />
          </group>
          <group position={[0.4, 0, -1.8]}>
            <Trail
              width={2 * thrustIntensity}
              length={15 * effectIntensity * (boostIntensity + 1)}
              color={new THREE.Color(engineColor)}
              attenuation={(t) => t * t}
            />
          </group>
        </>
      )}

      {/* Engine Particles (Sparkles) */}
      {(thrustIntensity > 0.1 || boostIntensity > 0.1) && (
        <group position={[0, 0, -2]}>
          <Sparkles 
            count={Math.round(20 * (thrustIntensity + boostIntensity * 2))} 
            scale={1} 
            size={1.5} 
            speed={3} 
            color={engineColor} 
          />
        </group>
      )}

      <ShipModel 
        thrustIntensity={thrustIntensity} 
        boostIntensity={boostIntensity} 
        rotationVelocity={rotationVelocity}
        strafeVelocity={strafeVelocity}
      />
    </group>
  );
};
