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
    effectIntensity,
    shipHealth,
    shipStatus,
    damageShip,
    resetShip,
    screenShake,
    setScreenShake,
    planetPositions,
    destructionEvents,
    flightMode,
    controlSmoothing
  } = useGameStore();

  // Physics refs
  const velocity = useRef(new THREE.Vector3());
  const position = useRef(new THREE.Vector3(0, 0, 500));
  const quaternion = useRef(new THREE.Quaternion());
  
  // Visual state
  const [thrustIntensity, setThrustIntensity] = useState(0);
  const [boostIntensity, setBoostIntensity] = useState(0);
  const [rotationVelocity, setRotationVelocity] = useState(new THREE.Vector2());
  const [strafeVelocity, setStrafeVelocity] = useState(new THREE.Vector2());
  const [currentRoll, setCurrentRoll] = useState(0);

  // Smooth input refs
  const smoothedInput = useRef({
    thrust: 0,
    rotate: new THREE.Vector2(),
    strafe: new THREE.Vector2(),
    roll: 0
  });

  // Auto-pilot state
  const autoPilotPhase = useRef<'none' | 'approaching' | 'orbiting'>('none');
  
  // Collision state
  const lastCollisionTime = useRef(0);
  const collisionCooldown = 0.5; // seconds
  const isStunned = useRef(false);
  const stunDuration = 0.3;
  const respawnTimer = useRef<number | null>(null);

  useFrame((state, delta) => {
    if (!meshRef.current || status !== 'playing') return;

    // --- SCREEN SHAKE ---
    if (screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * screenShake * 2;
      const shakeY = (Math.random() - 0.5) * screenShake * 2;
      state.camera.position.x += shakeX;
      state.camera.position.y += shakeY;
      setScreenShake(Math.max(0, screenShake - delta * 2));
    }

    // --- DEATH HANDLING ---
    if (shipStatus === 'destroyed') {
      if (respawnTimer.current === null) {
        respawnTimer.current = simulationTime + 3; // 3 seconds to respawn
      }
      
      if (simulationTime >= respawnTimer.current) {
        resetShip();
        position.current.copy(useGameStore.getState().shipPosition);
        velocity.current.set(0, 0, 0);
        respawnTimer.current = null;
      }
      
      // Still update position but no controls
      position.current.add(velocity.current.clone().multiplyScalar(delta));
      meshRef.current.position.copy(position.current);
      return;
    }

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
    const { 
      orbitAssist, 
      setGravityInfluence, 
      setGravitySourceId, 
      setGravityVector,
      setCollisionWarning,
      setGravityWarning
    } = useGameStore.getState();

    let nearCollision = false;
    let nearGravity = false;

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
        if (influence > 0.7) nearGravity = true;
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
      
      // Gravity Compensation: Ship automatically fights gravity to stay controllable
      const compensation = finalForce.clone().negate().multiplyScalar(SHIP_SPECS.gravityCompensation);
      finalForce.add(compensation);

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
    setGravityWarning(nearGravity);

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
      
      // Determine current mode specs
      currentBoost = !!keys.current['ShiftLeft'];
      const modeKey = currentBoost ? 'boost' : flightMode;
      const modeSpecs = SHIP_SPECS.modes[modeKey];
      
      // Apply damage penalty
      let controlPenalty = 1;
      if (shipStatus === 'damaged') controlPenalty = 0.8;
      if (shipStatus === 'critical') controlPenalty = 0.5;
      
      // Stun penalty after collision
      if (simulationTime - lastCollisionTime.current < stunDuration) {
        controlPenalty *= 0.2;
      }

      // Smooth inputs
      const targetRotate = new THREE.Vector2();
      if (keys.current['KeyW']) targetRotate.y = 1;
      if (keys.current['KeyS']) targetRotate.y = -1;
      if (keys.current['KeyA']) targetRotate.x = 1;
      if (keys.current['KeyD']) targetRotate.x = -1;

      const targetStrafe = new THREE.Vector2();
      if (keys.current['ArrowLeft']) targetStrafe.x = 1;
      if (keys.current['ArrowRight']) targetStrafe.x = -1;
      if (keys.current['ArrowUp']) targetStrafe.y = -1;
      if (keys.current['ArrowDown']) targetStrafe.y = 1;

      let targetRoll = 0;
      if (keys.current['KeyQ']) targetRoll = 1;
      if (keys.current['KeyE']) targetRoll = -1;

      // Auto-roll based on yaw (visual only, applied to model tilt later)
      const autoRoll = -targetRotate.x * 0.5;
      targetRoll += autoRoll;

      // Apply smoothing (frame-rate independent)
      const lerpSpeed = 5 + (1 - controlSmoothing) * 45; // 5 to 50 range
      const alpha = 1 - Math.exp(-lerpSpeed * delta);
      smoothedInput.current.rotate.lerp(targetRotate, alpha);
      smoothedInput.current.strafe.lerp(targetStrafe, alpha);
      smoothedInput.current.roll = THREE.MathUtils.lerp(smoothedInput.current.roll, targetRoll, alpha);

      // --- 360 DEGREE FREE ROTATION (QUATERNION BASED) ---
      const rotationAmount = modeSpecs.rotationSpeed * sensitivity * controlPenalty * delta;
      
      // Create local rotation quaternions
      const pitchQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), smoothedInput.current.rotate.y * rotationAmount);
      const yawQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), smoothedInput.current.rotate.x * rotationAmount);
      const rollQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), smoothedInput.current.roll * rotationAmount);
      
      // Apply rotations in local space
      quaternion.current.multiply(pitchQuat);
      quaternion.current.multiply(yawQuat);
      quaternion.current.multiply(rollQuat);
      quaternion.current.normalize();

      // Thrust Logic
      const { weaponMode, setIsFiring } = useGameStore.getState();
      let targetThrust = 0;
      
      if (weaponMode === 'armed') {
        if (keys.current['Space']) {
          setIsFiring(true);
          targetThrust = 0;
        } else {
          setIsFiring(false);
          if (keys.current['KeyW']) targetThrust = 0.3;
        }
      } else {
        if (keys.current['Space']) targetThrust = 1;
      }
      
      if (keys.current['KeyC']) targetThrust = -0.5;

      smoothedInput.current.thrust = THREE.MathUtils.lerp(smoothedInput.current.thrust, targetThrust, alpha);
      
      // Apply thrust curve
      const thrustPower = Math.pow(Math.abs(smoothedInput.current.thrust), SHIP_SPECS.thrustCurve) * Math.sign(smoothedInput.current.thrust);
      
      const accel = modeSpecs.acceleration * controlPenalty;
      const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion.current);
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(quaternion.current);
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(quaternion.current);

      velocity.current.add(forward.multiplyScalar(thrustPower * accel * delta));
      velocity.current.add(right.multiplyScalar(smoothedInput.current.strafe.x * SHIP_SPECS.strafeSpeed * controlPenalty * delta));
      velocity.current.add(up.multiplyScalar(smoothedInput.current.strafe.y * SHIP_SPECS.strafeSpeed * controlPenalty * delta));

      // --- DAMPING ASSIST ---
      // If no input, apply stronger damping to help the ship stop
      const isMovingInput = Math.abs(targetThrust) > 0.01 || targetStrafe.length() > 0.01;
      const activeDamping = isMovingInput ? modeSpecs.damping : Math.min(modeSpecs.damping, 0.95);
      velocity.current.multiplyScalar(activeDamping);

      // Speed Cap
      if (velocity.current.length() > modeSpecs.maxSpeed) {
        velocity.current.setLength(modeSpecs.maxSpeed);
      }

      // Update visuals
      currentThrust = smoothedInput.current.thrust;
      rotateDir.copy(smoothedInput.current.rotate);
      moveDir.set(smoothedInput.current.strafe.x, smoothedInput.current.strafe.y, 0);
      rollDir = smoothedInput.current.roll;
    }

    // Update Position
    position.current.add(velocity.current.clone().multiplyScalar(delta));
    
    // --- COLLISION DETECTION ---
    const shipRadius = 1.5;
    const warningBuffer = 15;
    
    // Check Planets
    PLANETS.forEach(planet => {
      const planetPos = planetPositions[planet.id];
      if (!planetPos) return;
      
      const dist = position.current.distanceTo(planetPos);
      const collisionDist = planet.radius + shipRadius;
      
      // Warning trigger
      if (dist < collisionDist + warningBuffer) {
        nearCollision = true;
      }

      if (simulationTime - lastCollisionTime.current > collisionCooldown) {
        if (dist < collisionDist) {
          const impactSpeed = velocity.current.length();
          const normal = position.current.clone().sub(planetPos).normalize();
          
          // Calculate damage
          const damage = Math.max(10, impactSpeed * 1.5);
          damageShip(damage, Math.min(1, impactSpeed / 50), planet.name);
          
          // Bounce back with energy loss
          velocity.current.reflect(normal).multiplyScalar(0.2);
          position.current.copy(planetPos).add(normal.multiplyScalar(collisionDist + 0.1));
          
          lastCollisionTime.current = simulationTime;
          setScreenShake(Math.min(1, impactSpeed / 40));
        }
      }
    });

    // Check Debris Zones (Destruction Events)
    Object.values(destructionEvents).forEach(event => {
      const dist = position.current.distanceTo(event.position);
      const collisionDist = event.radius * 0.8 + shipRadius;
      
      if (dist < collisionDist + warningBuffer * 0.5) {
        nearCollision = true;
      }

      if (simulationTime - lastCollisionTime.current > collisionCooldown) {
        if (dist < collisionDist) {
          const impactSpeed = velocity.current.length();
          const normal = position.current.clone().sub(event.position).normalize();
          
          const damage = Math.max(5, impactSpeed * 0.8);
          damageShip(damage, Math.min(0.6, impactSpeed / 40), `Debris from ${event.id}`);
          
          velocity.current.reflect(normal).multiplyScalar(0.4);
          position.current.copy(event.position).add(normal.multiplyScalar(collisionDist + 0.1));
          
          lastCollisionTime.current = simulationTime;
          setScreenShake(Math.min(0.8, impactSpeed / 30));
        }
      }
    });

    setCollisionWarning(nearCollision);

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
        shipHealth={shipHealth}
      />
    </group>
  );
};
