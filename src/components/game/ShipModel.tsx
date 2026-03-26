import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

interface ShipModelProps {
  thrustIntensity: number;
  boostIntensity: number;
  rotationVelocity: THREE.Vector2;
  strafeVelocity: THREE.Vector2;
  shipHealth: number;
  modelIdOverride?: keyof typeof SHIP_MODEL_CONFIG;
}

const SHIP_MODEL_CONFIG = {
  spacy: {
    path: '/models/sci_fi_spacy_ship.glb',
    targetSize: 6.2,
    rotation: new THREE.Euler(0, Math.PI / 2, 0),
    position: new THREE.Vector3(0, -0.1, 0),
  },
  scipio: {
    path: '/models/scipio_africanus.glb',
    targetSize: 5.6,
    rotation: new THREE.Euler(0, Math.PI / 2, 0),
    position: new THREE.Vector3(0, -0.25, 0),
  },
} as const;

const PreparedShip = ({ modelId }: { modelId: keyof typeof SHIP_MODEL_CONFIG }) => {
  const config = SHIP_MODEL_CONFIG[modelId];
  const { scene } = useGLTF(config.path);

  const preparedScene = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z) || 1;
    const scale = config.targetSize / maxDimension;
    const container = new THREE.Group();

    clone.scale.setScalar(scale);
    clone.position.set(
      -center.x * scale + config.position.x,
      -center.y * scale + config.position.y,
      -center.z * scale + config.position.z
    );

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => {
          material.transparent = false;
          material.opacity = 1;
          material.alphaTest = 0;
          material.depthWrite = true;
          material.needsUpdate = true;
        });
      }
    });

    container.rotation.copy(config.rotation);
    container.add(clone);

    return container;
  }, [scene, config]);

  return <primitive object={preparedScene} />;
};

export const ShipModel = ({
  thrustIntensity,
  boostIntensity,
  rotationVelocity,
  strafeVelocity,
  modelIdOverride,
}: ShipModelProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const shipModelId = useGameStore((state) => state.shipModelId);
  const activeModelId = modelIdOverride ?? shipModelId;

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    if (!groupRef.current) return;

    const targetTiltZ = -rotationVelocity.y * 0.35 - strafeVelocity.x * 0.2;
    const targetTiltX = -rotationVelocity.x * 0.25 + strafeVelocity.y * 0.12;
    const targetTiltY = Math.sin(t * 0.6) * 0.03 + thrustIntensity * 0.04;

    const alpha = 1 - Math.exp(-8 * delta);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetTiltZ, alpha);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetTiltX, alpha);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetTiltY, alpha);
    groupRef.current.position.y = Math.sin(t * 0.8) * 0.08 - boostIntensity * 0.05;
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.8} rotationIntensity={0.08} floatIntensity={0.12}>
        <PreparedShip modelId={activeModelId} />
      </Float>
    </group>
  );
};

useGLTF.preload('/models/sci_fi_spacy_ship.glb');
useGLTF.preload('/models/scipio_africanus.glb');
