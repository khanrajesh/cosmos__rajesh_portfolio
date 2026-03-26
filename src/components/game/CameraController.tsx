import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { SHIP_SPECS, PLANETS, GAME_CAMERA_TUNING } from '../../constants/gameData';

export const CameraController = () => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const { 
    shipPosition, 
    shipQuaternion, 
    cameraMode, 
    isBoosting,
    cameraRotation,
    cameraDistance,
    setCameraRotation,
    setCameraDistance,
    status,
    targetPlanetId,
    shipVelocity,
    effectIntensity,
    simulationTime,
    cameraSensitivity,
    zoomSensitivity,
    screenShake,
    setScreenShake,
    isAutoPilot,
    currentWeaponId,
    isFiring,
    isCharging,
    weaponMode,
    destructionEvents
  } = useGameStore();
  
  const { gl } = useThree();
  
  const raycaster = useRef(new THREE.Raycaster());
  const smoothedTargetWorld = useRef<THREE.Vector3 | null>(null);
  const currentFov = useRef(60);
  const currentRotation = useRef(new THREE.Euler().copy(cameraRotation));
  const currentDistance = useRef(cameraDistance);
  const targetRotation = useRef(new THREE.Euler().copy(cameraRotation));
  const targetDistance = useRef(cameraDistance);
  const lookAtTarget = useRef(new THREE.Vector3());
  const shakeOffset = useRef(new THREE.Vector3());
  const previousMode = useRef(cameraMode);
  const modeTransition = useRef(1);
  
  const isDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });

  // Sync from store (for resets)
  useEffect(() => {
    targetRotation.current.copy(cameraRotation);
    targetDistance.current = cameraDistance;
  }, [cameraRotation, cameraDistance]);

  useEffect(() => {
    if (previousMode.current !== cameraMode) {
      previousMode.current = cameraMode;
      modeTransition.current = 0;
    }
  }, [cameraMode]);
  
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (status !== 'playing') return;
      isDragging.current = true;
      previousMouse.current = { x: e.clientX, y: e.clientY };
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || status !== 'playing') return;
      
      const deltaX = e.clientX - previousMouse.current.x;
      const deltaY = e.clientY - previousMouse.current.y;
      
      const sensitivityX = GAME_CAMERA_TUNING.orbit.yawSpeed * (0.65 + cameraSensitivity);
      const sensitivityY = GAME_CAMERA_TUNING.orbit.pitchSpeed * (0.65 + cameraSensitivity);
      targetRotation.current.y -= deltaX * sensitivityX;
      targetRotation.current.x -= deltaY * sensitivityY;
      
      targetRotation.current.x = Math.max(
        GAME_CAMERA_TUNING.orbit.minPitch,
        Math.min(GAME_CAMERA_TUNING.orbit.maxPitch, targetRotation.current.x)
      );
      
      previousMouse.current = { x: e.clientX, y: e.clientY };
    };
    
    const handleMouseUp = () => {
      isDragging.current = false;
      // Sync back to store when done dragging
      setCameraRotation(targetRotation.current.clone());
    };
    
    const handleWheel = (e: WheelEvent) => {
      if (status !== 'playing') return;
      const sensitivity = zoomSensitivity * GAME_CAMERA_TUNING.zoom.wheelSpeed;
      const minZoom = GAME_CAMERA_TUNING.zoom.min[cameraMode];
      const maxZoom = GAME_CAMERA_TUNING.zoom.max[cameraMode];
      targetDistance.current = Math.max(minZoom, Math.min(maxZoom, targetDistance.current + e.deltaY * sensitivity));
      setCameraDistance(targetDistance.current);
    };
    
    const canvas = gl.domElement;
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);
    
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [gl, status, setCameraRotation, setCameraDistance, cameraMode, zoomSensitivity, cameraSensitivity]);

  useFrame((state, delta) => {
    if (!cameraRef.current || status !== 'playing') return;

    const mode = SHIP_SPECS.cameraModes[cameraMode];
    const tuning = GAME_CAMERA_TUNING.modeConfig[cameraMode];
    modeTransition.current = Math.min(1, modeTransition.current + delta * 3.4);
    const modeBlend = THREE.MathUtils.smoothstep(modeTransition.current, 0, 1);
    const rotationAlpha = (1 - Math.exp(-Math.max(tuning.rotationDamping, 0.04) * 10 * delta)) * (0.6 + modeBlend * 0.4);
    const positionAlpha = (1 - Math.exp(-Math.max(tuning.positionDamping, 0.04) * 10 * delta)) * (0.55 + modeBlend * 0.45);
    const lookAlpha = (1 - Math.exp(-Math.max(tuning.lookDamping, 0.04) * 10 * delta)) * (0.55 + modeBlend * 0.45);
    
    const minZoom = GAME_CAMERA_TUNING.zoom.min[cameraMode];
    const maxZoom = GAME_CAMERA_TUNING.zoom.max[cameraMode];
    targetDistance.current = THREE.MathUtils.clamp(targetDistance.current, minZoom, maxZoom);

    currentRotation.current.x = THREE.MathUtils.lerp(currentRotation.current.x, targetRotation.current.x, rotationAlpha);
    currentRotation.current.y = THREE.MathUtils.lerp(currentRotation.current.y, targetRotation.current.y, rotationAlpha);
    currentDistance.current = THREE.MathUtils.lerp(currentDistance.current, targetDistance.current, positionAlpha);

    const shipSpeed = shipVelocity.length();
    const shipForward = new THREE.Vector3(0, 0, 1).applyQuaternion(shipQuaternion).normalize();
    const shipUp = new THREE.Vector3(0, 1, 0).applyQuaternion(shipQuaternion).normalize();
    const shipRight = new THREE.Vector3(1, 0, 0).applyQuaternion(shipQuaternion).normalize();
    const stabilizedUp = new THREE.Vector3(0, 1, 0).lerp(shipUp, tuning.rollFollow).normalize();

    const targetPlanet = targetPlanetId
      ? PLANETS.find((planet) => planet.id === targetPlanetId) ?? null
      : null;
    const targetPlanetPosition = targetPlanet
      ? new THREE.Vector3(
          Math.cos(simulationTime * targetPlanet.speed) * targetPlanet.distance,
          0,
          Math.sin(simulationTime * targetPlanet.speed) * targetPlanet.distance
        )
      : null;
    const targetPlanetDistance = targetPlanetPosition ? shipPosition.distanceTo(targetPlanetPosition) : Infinity;

    if (targetPlanetPosition) {
      if (!smoothedTargetWorld.current) {
        smoothedTargetWorld.current = targetPlanetPosition.clone();
      } else {
        smoothedTargetWorld.current.lerp(targetPlanetPosition, Math.min(1, delta * 4));
      }
    } else {
      smoothedTargetWorld.current = null;
    }

    let desiredDistance = currentDistance.current;
    if (isBoosting) {
      desiredDistance = THREE.MathUtils.lerp(desiredDistance, tuning.boostDistance, 0.35);
    } else {
      desiredDistance = THREE.MathUtils.lerp(desiredDistance, tuning.baseDistance, 0.15);
    }
    desiredDistance = THREE.MathUtils.clamp(desiredDistance, minZoom, maxZoom);
    currentDistance.current = THREE.MathUtils.lerp(currentDistance.current, desiredDistance, positionAlpha);

    let targetFOV = mode.fov;
    if (isBoosting) targetFOV += tuning.boostFovDelta;
    if (weaponMode === 'armed' && (isFiring || isCharging)) targetFOV += tuning.weaponFovDelta;
    if (isAutoPilot) targetFOV += 1.5;
    currentFov.current = THREE.MathUtils.lerp(currentFov.current, targetFOV, 0.04 + modeBlend * 0.06);
    cameraRef.current.fov = currentFov.current;
    cameraRef.current.updateProjectionMatrix();

    const localLookQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(currentRotation.current.x, currentRotation.current.y, 0, 'YXZ')
    );
    const orbitBasis = new THREE.Matrix4().lookAt(
      new THREE.Vector3(0, 0, 0),
      shipForward,
      stabilizedUp
    );
    const shipStabilizedQuat = new THREE.Quaternion().setFromRotationMatrix(orbitBasis).invert();
    const combinedQuat = shipStabilizedQuat.clone().multiply(localLookQuat);

    const baseOffset = new THREE.Vector3(mode.offset.x, mode.offset.y, mode.offset.z);
    const baseLookAt = new THREE.Vector3(mode.lookAt.x, mode.lookAt.y, mode.lookAt.z);
    const zoomScale = currentDistance.current / Math.max(1, tuning.baseDistance);
    if (cameraMode !== 'pilot') {
      baseOffset.multiplyScalar(zoomScale);
    }

    let targetCamPos = shipPosition.clone().add(baseOffset.applyQuaternion(combinedQuat));
    let desiredLookAt = shipPosition.clone().add(baseLookAt.applyQuaternion(combinedQuat));

    if (cameraMode === 'pilot') {
      const pilotOffset = shipForward.clone().multiplyScalar(-2.4 - (isBoosting ? 0.6 : 0))
        .add(stabilizedUp.clone().multiplyScalar(1.15))
        .add(shipRight.clone().multiplyScalar(tuning.shoulderBias + currentRotation.current.y * 0.45));
      targetCamPos = shipPosition.clone().add(pilotOffset);
      desiredLookAt = shipPosition.clone()
        .add(shipForward.clone().multiplyScalar(tuning.lookAhead))
        .add(stabilizedUp.clone().multiplyScalar(currentRotation.current.x * 5));
    } else if (cameraMode === 'explorer') {
      targetCamPos = shipPosition.clone()
        .add(shipForward.clone().multiplyScalar(-currentDistance.current))
        .add(stabilizedUp.clone().multiplyScalar(4.5 + tuning.nearPlanetLift))
        .add(shipRight.clone().multiplyScalar(currentRotation.current.y * 4.5));
      desiredLookAt = shipPosition.clone()
        .add(shipForward.clone().multiplyScalar(tuning.lookAhead))
        .add(stabilizedUp.clone().multiplyScalar(1.75));
    } else if (cameraMode === 'cinematic') {
      targetCamPos = shipPosition.clone()
        .add(shipForward.clone().multiplyScalar(-currentDistance.current * 0.85))
        .add(stabilizedUp.clone().multiplyScalar(6.2 + tuning.nearPlanetLift))
        .add(shipRight.clone().multiplyScalar(9.5 + tuning.targetSideBias * 4));
      desiredLookAt = shipPosition.clone()
        .add(shipForward.clone().multiplyScalar(tuning.lookAhead))
        .add(stabilizedUp.clone().multiplyScalar(1));
    }

    if (smoothedTargetWorld.current) {
      const toTarget = smoothedTargetWorld.current.clone().sub(shipPosition);
      const targetDistance = toTarget.length();
      const assistStrength = THREE.MathUtils.clamp(
        1 - targetDistance / tuning.targetComposeDistance,
        0,
        1
      ) * tuning.targetAssist;
      if (assistStrength > 0.001) {
        const midpoint = shipPosition.clone().lerp(smoothedTargetWorld.current, 0.45);
        desiredLookAt.lerp(midpoint, assistStrength);
        const targetSide = shipRight.dot(toTarget.normalize());
        targetCamPos.add(shipRight.clone().multiplyScalar(-targetSide * tuning.targetSideBias * assistStrength * currentDistance.current));
        targetCamPos.add(stabilizedUp.clone().multiplyScalar(Math.min(4, assistStrength * currentDistance.current * 0.16)));
      }
    }

    if (targetPlanet && targetPlanetDistance < targetPlanet.radius + 35) {
      const nearFactor = THREE.MathUtils.clamp(1 - (targetPlanetDistance - targetPlanet.radius) / 35, 0, 1);
      targetCamPos.add(stabilizedUp.clone().multiplyScalar(tuning.nearPlanetLift * nearFactor * 4));
      desiredLookAt.add(shipForward.clone().multiplyScalar(nearFactor * 8));
    }

    if (isAutoPilot) {
      targetCamPos.add(shipForward.clone().multiplyScalar(-GAME_CAMERA_TUNING.autoPilot.forwardLead));
      desiredLookAt.add(shipForward.clone().multiplyScalar(GAME_CAMERA_TUNING.autoPilot.lookAhead));
    }

    const toCamera = targetCamPos.clone().sub(shipPosition);
    const desiredCameraDistance = toCamera.length();
    if (desiredCameraDistance > 0.001) {
      const dir = toCamera.clone().normalize();
      let safeDistance = desiredCameraDistance;

      Object.values(useGameStore.getState().planetPositions).forEach((planetPos, index) => {
        const planet = PLANETS[index];
        if (!planet) return;
        raycaster.current.set(shipPosition, dir);
        const projection = raycaster.current.ray.closestPointToPoint(planetPos, new THREE.Vector3());
        const offAxisDistance = projection.distanceTo(planetPos);
        if (offAxisDistance < planet.radius + GAME_CAMERA_TUNING.collision.safetyRadius) {
          const alongRay = shipPosition.distanceTo(projection);
          if (alongRay > 0 && alongRay < safeDistance) {
            safeDistance = Math.max(
              GAME_CAMERA_TUNING.zoom.min[cameraMode],
              alongRay - planet.radius - GAME_CAMERA_TUNING.collision.padding
            );
          }
        }
      });

      targetCamPos = shipPosition.clone().add(dir.multiplyScalar(safeDistance));
    }

    lookAtTarget.current.lerp(desiredLookAt, lookAlpha);

    // Only apply collision-driven shake, and smooth it so the HUD/camera read as stable.
    if (screenShake > 0.001 && effectIntensity > 0.05) {
      const t = state.clock.elapsedTime * 20;
      const shakeAmount = Math.min(0.35, screenShake * 0.3 * effectIntensity);
      shakeOffset.current.set(
        Math.sin(t) * shakeAmount,
        Math.cos(t * 1.3) * shakeAmount * 0.6,
        0
      );
      setScreenShake(Math.max(0, screenShake - delta * 1.5));
    } else {
      shakeOffset.current.lerp(new THREE.Vector3(), Math.min(1, delta * 10));
    }

    cameraRef.current.position.lerp(targetCamPos.clone().add(shakeOffset.current), Math.min(1, positionAlpha * 1.5));
    
    cameraRef.current.lookAt(lookAtTarget.current);
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault near={0.1} far={200000} />;
};
