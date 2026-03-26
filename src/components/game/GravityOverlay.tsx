import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, PlanetData } from '../../store/useGameStore';
import { PLANETS } from '../../constants/gameData';

const GravityFieldMarkers = () => {
  const { shipPosition, showGravityOverlay, planetPositions, debrisIntensity } = useGameStore();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const gridSize = 3;
  const spacing = 80;
  const count = Math.pow(gridSize * 2 + 1, 3);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const markers = useMemo(() => {
    const m = [];
    for (let x = -gridSize; x <= gridSize; x++) {
      for (let y = -gridSize; y <= gridSize; y++) {
        for (let z = -gridSize; z <= gridSize; z++) {
          m.push(new THREE.Vector3(x * spacing, y * spacing, z * spacing));
        }
      }
    }
    return m;
  }, []);

  useFrame(() => {
    if (!meshRef.current || !showGravityOverlay) return;

    const snappedX = Math.round(shipPosition.x / spacing) * spacing;
    const snappedY = Math.round(shipPosition.y / spacing) * spacing;
    const snappedZ = Math.round(shipPosition.z / spacing) * spacing;
    const gridOrigin = new THREE.Vector3(snappedX, snappedY, snappedZ);

    for (let i = 0; i < count; i++) {
      const markerPos = markers[i].clone().add(gridOrigin);
      const totalForce = new THREE.Vector3();
      let maxInfluence = 0;

      PLANETS.forEach((planet) => {
        const planetPos = planetPositions[planet.id];
        if (!planetPos) return;

        const toPlanet = planetPos.clone().sub(markerPos);
        const distance = toPlanet.length();

        if (distance < planet.gravityRadius) {
          const influence = Math.pow(1 - (distance / planet.gravityRadius), 1.5);
          const planetState = useGameStore.getState().planetStates[planet.id];
          const massFactor = planetState?.isDestroyed ? 0.1 : 1.0;
          const strength = planet.gravityStrength * influence * massFactor;
          
          if (planet.id !== 'sun' || influence >= 0.9) {
            totalForce.add(toPlanet.normalize().multiplyScalar(strength));
            maxInfluence = Math.max(maxInfluence, influence);
          }
        }
      });

      if (totalForce.length() > 0.1) {
        dummy.position.copy(markerPos);
        dummy.lookAt(markerPos.clone().add(totalForce));
        dummy.scale.setScalar((0.5 + maxInfluence * 2) * debrisIntensity);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      } else {
        dummy.position.set(0, -100000, 0); // Hide
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!showGravityOverlay) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <coneGeometry args={[0.5, 3, 4]} />
      <meshBasicMaterial color="#00ffff" transparent opacity={0.2} depthWrite={false} />
    </instancedMesh>
  );
};

export const GravityOverlay = () => {
  return (
    <group>
      <GravityFieldMarkers />
    </group>
  );
};
