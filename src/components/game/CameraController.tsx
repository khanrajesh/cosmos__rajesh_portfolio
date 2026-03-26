import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { SHIP_SPECS, PLANETS } from '../../constants/gameData';

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
    zoomSensitivity
  } = useGameStore();
  
  const { gl } = useThree();
  
  // Internal values for smooth interpolation
  const currentRotation = useRef(new THREE.Euler().copy(cameraRotation));
  const currentDistance = useRef(cameraDistance);
  const targetRotation = useRef(new THREE.Euler().copy(cameraRotation));
  const targetDistance = useRef(cameraDistance);
  
  const isDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });

  // Sync from store (for resets)
  useEffect(() => {
    targetRotation.current.copy(cameraRotation);
    targetDistance.current = cameraDistance;
  }, [cameraRotation, cameraDistance]);
  
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
      
      const sensitivity = cameraSensitivity * 0.01;
      targetRotation.current.y -= deltaX * sensitivity;
      targetRotation.current.x -= deltaY * sensitivity;
      
      // Clamp vertical rotation
      targetRotation.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, targetRotation.current.x));
      
      previousMouse.current = { x: e.clientX, y: e.clientY };
    };
    
    const handleMouseUp = () => {
      isDragging.current = false;
      // Sync back to store when done dragging
      setCameraRotation(targetRotation.current.clone());
    };
    
    const handleWheel = (e: WheelEvent) => {
      if (status !== 'playing') return;
      const sensitivity = zoomSensitivity * 0.1;
      targetDistance.current = Math.max(5, Math.min(150, targetDistance.current + e.deltaY * sensitivity));
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
  }, [gl, status, setCameraRotation, setCameraDistance]);

  useFrame((state, delta) => {
    if (!cameraRef.current || status !== 'playing') return;

    const mode = SHIP_SPECS.cameraModes[cameraMode];
    
    // Smoothly interpolate rotation and distance
    currentRotation.current.x = THREE.MathUtils.lerp(currentRotation.current.x, targetRotation.current.x, 0.1);
    currentRotation.current.y = THREE.MathUtils.lerp(currentRotation.current.y, targetRotation.current.y, 0.1);
    currentDistance.current = THREE.MathUtils.lerp(currentDistance.current, targetDistance.current, 0.1);

    // FOV Boost and Mode-based FOV
    const targetFOV = isBoosting ? mode.fov + 15 : mode.fov;
    cameraRef.current.fov = THREE.MathUtils.lerp(cameraRef.current.fov, targetFOV, 0.05);
    cameraRef.current.updateProjectionMatrix();

    // Calculate camera position relative to ship
    // We combine the ship's orientation with the user's orbital rotation
    // User said "Camera movement should be independent from ship orientation"
    // but usually you want it centered on ship.
    
    const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(currentRotation.current);
    const offset = new THREE.Vector3(0, 0, currentDistance.current).applyMatrix4(rotationMatrix);
    
    // Add ship's base offset if in pilot mode? 
    // Actually, let's just use the orbital offset for all modes now as requested.
    
    const targetCamPos = shipPosition.clone().add(offset);
    cameraRef.current.position.lerp(targetCamPos, 0.2);
    
    // Look at ship
    const lookAtPos = shipPosition.clone();
    
    // Camera Shake based on speed and proximity
    const speed = shipVelocity.length();
    if (speed > 10 && effectIntensity > 0.2) {
      const shakeAmount = (speed / 100) * 0.05 * effectIntensity;
      cameraRef.current.position.x += (Math.random() - 0.5) * shakeAmount;
      cameraRef.current.position.y += (Math.random() - 0.5) * shakeAmount;
    }

    // Cinematic Arrival
    if (targetPlanetId) {
      const targetPlanet = PLANETS.find(p => p.id === targetPlanetId);
      if (targetPlanet) {
        const dist = shipPosition.distanceTo(new THREE.Vector3(
          Math.cos(simulationTime * targetPlanet.speed) * targetPlanet.distance,
          0,
          Math.sin(simulationTime * targetPlanet.speed) * targetPlanet.distance
        ));
        
        // Zoom in slightly when approaching
        if (dist < targetPlanet.radius + 50 && dist > targetPlanet.radius + 10) {
          const approachFactor = 1 - (dist - targetPlanet.radius - 10) / 40;
          cameraRef.current.fov -= approachFactor * 5;
          cameraRef.current.updateProjectionMatrix();
        }
      }
    }
    
    cameraRef.current.lookAt(lookAtPos);
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault near={0.1} far={200000} />;
};
