import { Stars, Environment, Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing';
import { Planet } from './Planet';
import { GravityOverlay } from './GravityOverlay';
import { Ship } from './Ship';
import { WeaponSystem } from './WeaponSystem';
import { CameraController } from './CameraController';
import { PLANETS } from '../../constants/gameData';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';
import { useMemo, useRef } from 'react';

const SpeedStreaks = () => {
  const { shipVelocity, effectIntensity } = useGameStore();
  const points = useMemo(() => {
    const p = [];
    for (let i = 0; i < 100; i++) {
      p.push(new THREE.Vector3(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 200
      ));
    }
    return p;
  }, []);

  const groupRef = useRef<THREE.Group>(null);
  const speed = shipVelocity.length();

  useFrame((state, delta) => {
    if (!groupRef.current || speed < 5) return;
    
    // Move streaks opposite to velocity
    const dir = shipVelocity.clone().normalize().multiplyScalar(-1);
    groupRef.current.children.forEach((child, i) => {
      child.position.add(dir.clone().multiplyScalar(speed * 2 * delta));
      
      // Wrap around
      if (child.position.length() > 150) {
        child.position.copy(dir.clone().multiplyScalar(-150).add(new THREE.Vector3(
          (Math.random() - 0.5) * 50,
          (Math.random() - 0.5) * 50,
          (Math.random() - 0.5) * 50
        )));
      }
    });
  });

  if (speed < 5 || effectIntensity < 0.3) return null;

  return (
    <group ref={groupRef}>
      {points.map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.05, 0.05, 2 + speed * 0.1]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.2 * effectIntensity} />
        </mesh>
      ))}
    </group>
  );
};

export const SpaceScene = () => {
  const { 
    targetPlanetId, 
    isAutoPilot, 
    shipPosition, 
    simulationTime,
    graphicsQuality,
    effectIntensity
  } = useGameStore();

  const navLinePoints = useMemo(() => {
    if (!isAutoPilot || !targetPlanetId) return null;
    const targetPlanet = PLANETS.find(p => p.id === targetPlanetId);
    if (!targetPlanet) return null;

    const angle = simulationTime * targetPlanet.speed;
    const targetPos = new THREE.Vector3(
      Math.cos(angle) * targetPlanet.distance,
      0,
      Math.sin(angle) * targetPlanet.distance
    );

    return [shipPosition, targetPos];
  }, [isAutoPilot, targetPlanetId, shipPosition, simulationTime]);

  // Destination-aware visual mood
  const moodColor = useMemo(() => {
    if (!targetPlanetId) return '#010103';
    const targetPlanet = PLANETS.find(p => p.id === targetPlanetId);
    if (!targetPlanet) return '#010103';
    
    // Subtle shift towards planet color
    const base = new THREE.Color('#010103');
    const accent = new THREE.Color(targetPlanet.color);
    return base.lerp(accent, 0.05).getStyle();
  }, [targetPlanetId]);

  const bloomIntensity = graphicsQuality === 'high' ? 1.5 * effectIntensity : 0.8 * effectIntensity;
  const vignetteDarkness = 0.8 + (0.4 * effectIntensity);

  return (
    <>
      <color attach="background" args={[moodColor]} />
      
      {/* Enhanced Starfield */}
      <Stars 
        radius={4000} 
        depth={100} 
        count={graphicsQuality === 'high' ? 15000 : 8000} 
        factor={6} 
        saturation={0.5} 
        fade 
        speed={0.5} 
      />
      
      {/* Navigation Guide Line */}
      {navLinePoints && (
        <Line
          points={navLinePoints}
          color="#00ffff"
          lineWidth={1}
          transparent
          opacity={0.3}
          dashed
          dashScale={5}
          dashSize={1}
          gapSize={0.5}
        />
      )}

      {/* Lighting: Sun as the primary source */}
      <ambientLight intensity={0.05} />
      
      {/* The Sun's PointLight (at origin) */}
      <pointLight 
        position={[0, 0, 0]} 
        intensity={8} 
        distance={5000} 
        decay={1.5} 
        color="#fff4d6" 
        castShadow
      />

      {/* Subtle fill light for dark sides */}
      <directionalLight 
        position={[100, 100, 100]} 
        intensity={0.1} 
        color="#ffffff"
      />

      <group>
        {PLANETS.map((planet) => (
          <Planet key={planet.id} data={planet} />
        ))}
        <GravityOverlay />
        <Ship />
        <WeaponSystem />
        <SpeedStreaks />
      </group>

      {/* Post-Processing for Cinematic Feel */}
      <EffectComposer>
        <Bloom 
          intensity={bloomIntensity} 
          luminanceThreshold={0.2} 
          luminanceSmoothing={0.9} 
        />
        <Noise opacity={0.05} />
        <Vignette eskil={false} offset={0.1} darkness={vignetteDarkness} />
        {graphicsQuality === 'high' && (
          <ChromaticAberration 
            offset={new THREE.Vector2(0.001 * effectIntensity, 0.001 * effectIntensity)} 
          />
        )}
      </EffectComposer>

      <Environment preset="night" />
      <CameraController />
    </>
  );
};
