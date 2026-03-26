import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, PlanetData } from '../../store/useGameStore';
import { DebrisSystem } from './DebrisSystem';
import { AlertTriangle } from 'lucide-react';
import { Moon, Atmosphere, Clouds, Rings, TargetHighlight, GravityWell, ScannedOverlay } from './PlanetComponents';
import { TARGET_UX_TUNING } from '../../constants/gameData';

interface PlanetProps {
  data: PlanetData;
}

export const Planet = ({ data }: PlanetProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { 
    simulationTime, 
    shipPosition,
    targetPlanetId, 
    setTarget, 
    showOrbits, 
    isScanning, 
    scanProgress,
    planetStates,
    scannedPlanetIds,
    updatePlanetPosition
  } = useGameStore();

  const isTarget = targetPlanetId === data.id;
  const state = planetStates[data.id] || { damage: 0, isCritical: false, health: 100, isDestroyed: false };
  const isScanned = scannedPlanetIds.includes(data.id);
  const visuals = data.visuals;
  const currentAngle = simulationTime * data.speed;
  const currentPosition = useMemo(
    () => new THREE.Vector3(Math.cos(currentAngle) * data.distance, 0, Math.sin(currentAngle) * data.distance),
    [currentAngle, data.distance]
  );
  const targetDistance = Math.round(shipPosition.distanceTo(currentPosition));
  const isScannable = targetDistance <= TARGET_UX_TUNING.scanRange;
  const isInspectable = targetDistance <= TARGET_UX_TUNING.inspectRange;
  const isAttackable = targetDistance <= TARGET_UX_TUNING.attackRange && !state.isDestroyed;
  const targetTone: keyof typeof TARGET_UX_TUNING.colors = state.isDestroyed
    ? 'invalid'
    : isAttackable
      ? 'inRange'
      : isScannable || isInspectable
        ? 'warning'
        : 'neutral';

  // Texture loading with fallback
  const textures = useMemo(() => {
    if (!visuals.textures) return {};
    const loader = new THREE.TextureLoader();
    const result: any = {};
    
    Object.entries(visuals.textures).forEach(([key, path]) => {
      if (path) {
        result[key] = loader.load(path, undefined, undefined, (err) => {
          console.warn(`Failed to load texture ${key} for ${data.name}: ${path}`, err);
        });
        // Set texture properties for better realism
        if (result[key]) {
          result[key].anisotropy = 8;
          if (key === 'map' || key === 'emissiveMap') {
            result[key].colorSpace = THREE.SRGBColorSpace;
          }
        }
      }
    });
    
    return result;
  }, [visuals.textures, data.name]);

  const damageStage = useMemo(() => {
    const d = state.damage;
    if (visuals.type === 'gas') {
      if (d >= 1) return 'DISPERSED';
      if (d > 0.8) return 'CORE COLLAPSE';
      if (d > 0.6) return 'STORM RUPTURE';
      if (d > 0.3) return 'ATMOS DISTURBANCE';
      return 'INTACT';
    } else {
      if (d >= 1) return 'DESTROYED';
      if (d > 0.8) return 'DESTABILIZED';
      if (d > 0.6) return 'SEVERE FRACTURE';
      if (d > 0.4) return 'CRACKED';
      if (d > 0.1) return 'IMPACTED';
      return 'INTACT';
    }
  }, [state.damage, visuals.type]);

  // Calculate orbital position
  useFrame(() => {
    if (groupRef.current) {
      const angle = simulationTime * data.speed;
      groupRef.current.position.x = Math.cos(angle) * data.distance;
      groupRef.current.position.z = Math.sin(angle) * data.distance;
      
      // Sync position to store for gravity overlay
      updatePlanetPosition(data.id, groupRef.current.position);
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  const surfaceMaterial = useMemo(() => {
    const hasColorMap = Boolean(textures.map);
    const mat = new THREE.MeshStandardMaterial({
      color: hasColorMap ? '#ffffff' : visuals.surfaceColor,
      map: textures.map || null,
      normalMap: textures.normalMap || null,
      roughnessMap: textures.roughnessMap || null,
      roughness: visuals.roughness ?? 0.7,
      metalness: visuals.metalness ?? 0.2,
      emissive: visuals.emissiveColor ?? '#000000',
      emissiveMap: textures.emissiveMap || null,
      emissiveIntensity: visuals.emissiveIntensity ?? 0,
    });

    // Add damage effects
    if (state.damage > 0) {
      const damageColor = visuals.type === 'gas' 
        ? (visuals.damageConfig.stormColor || visuals.damageConfig.glowColor)
        : visuals.damageConfig.glowColor;
      
      // Blend emissive with damage
      const baseEmissive = new THREE.Color(visuals.emissiveColor || '#000000');
      const damageEmissive = new THREE.Color(damageColor);
      mat.emissive.copy(baseEmissive).lerp(damageEmissive, state.damage);
      mat.emissiveIntensity = (visuals.emissiveIntensity ?? 0) + state.damage * 8;
      
      if (visuals.type === 'rocky') {
        mat.color.lerp(new THREE.Color(visuals.damageConfig.crackColor), state.damage * 0.6);
      }
    }

    return mat;
  }, [visuals, state.damage, textures]);

  if (state.isDestroyed) {
    return (
      <group ref={groupRef}>
        <DebrisSystem 
          id={data.id} 
          position={new THREE.Vector3()} 
          radius={data.radius} 
          color={visuals.damageConfig.glowColor} 
          startTime={state.destructionTime || 0} 
        />
        
        <GravityWell planet={data} isTarget={isTarget} isDestroyed={true} />
        
        {data.moons?.map((moon) => (
          <Moon key={moon.id} data={moon} parentPlanetId={data.id} />
        ))}

        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <Text
            position={[0, data.radius + 6, 0]}
            fontSize={data.radius * 0.2 + 2}
            color="#ff0000"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
          >
            {data.name} [REMNANTS]
          </Text>
        </Float>
      </group>
    );
  }

  return (
    <group>
      {/* Orbit Ring */}
      {showOrbits && data.distance > 0 && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[data.distance - 0.2, data.distance + 0.2, 256]} />
          <meshBasicMaterial 
            color={state.isDestroyed ? "#ff0000" : (state.damage > 0.6 ? "#ff8800" : "#ffffff")} 
            transparent 
            opacity={state.isDestroyed ? 0.02 : (state.damage > 0.6 ? 0.1 : 0.05)} 
            side={THREE.DoubleSide} 
            wireframe={state.damage > 0.6}
          />
        </mesh>
      )}

      <group ref={groupRef}>
        <group 
          onClick={(e) => {
            e.stopPropagation();
            setTarget(data.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setIsHovered(true);
          }}
          onPointerOut={() => setIsHovered(false)}
        >
          <mesh ref={meshRef} material={surfaceMaterial}>
            <sphereGeometry args={[data.radius, 64, 64]} />
          </mesh>

          {visuals.atmosphere && (
            <Atmosphere config={visuals.atmosphere} radius={data.radius} />
          )}

          {visuals.clouds && visuals.textures?.cloudsMap && (
            <Clouds 
              config={visuals.clouds} 
              radius={data.radius} 
              texturePath={visuals.textures?.cloudsMap} 
            />
          )}

          {visuals.rings && (
            <Rings 
              config={visuals.rings} 
              radius={data.radius} 
              texturePath={visuals.textures?.ringsMap} 
            />
          )}

          {isScanned && (
            <ScannedOverlay radius={data.radius} />
          )}

          {isTarget && (
            <TargetHighlight 
              radius={data.radius} 
              isScanning={isScanning} 
              scanProgress={scanProgress} 
              tone={targetTone}
              targetName={data.name}
              distance={targetDistance}
              targetType={visuals.type}
              attackable={isAttackable}
              scannable={isScannable}
            />
          )}

          <GravityWell planet={data} isTarget={isTarget} />

          {state.isCritical && (
            <mesh scale={[1.05, 1.05, 1.05]}>
              <sphereGeometry args={[data.radius, 32, 32]} />
              <meshBasicMaterial 
                color={visuals.damageConfig.glowColor} 
                transparent 
                opacity={0.3 + Math.sin(Date.now() * 0.01) * 0.2} 
              />
            </mesh>
          )}

          {state.damage > 0 && (
            <Html position={[0, -data.radius - 4, 0]} center>
              <div className="flex flex-col items-center gap-1">
                <div className="px-2 py-1 bg-black/80 border border-red-500/50 rounded text-[8px] font-bold text-red-500 whitespace-nowrap tracking-widest uppercase">
                  {damageStage}
                </div>
                {state.isCritical && (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-500 text-black text-[7px] font-bold rounded animate-pulse">
                    <AlertTriangle size={8} />
                    ORBIT UNSTABLE
                  </div>
                )}
              </div>
            </Html>
          )}
        </group>

        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <Text
            position={[0, data.radius + 6, 0]}
            fontSize={data.radius * 0.2 + 2}
            color={isTarget ? TARGET_UX_TUNING.colors[targetTone] : isHovered ? "#d8f7ff" : "white"}
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
          >
            {isTarget ? `${data.name} [LOCKED]` : isHovered ? `${data.name} [SELECT]` : data.name}
          </Text>
          {(isTarget || isHovered) && (
            <Text
              position={[0, data.radius + 4, 0]}
              fontSize={1.5}
              color={isTarget ? TARGET_UX_TUNING.colors[targetTone] : "#a5f3fc"}
              fillOpacity={0.6}
              anchorX="center"
              anchorY="middle"
            >
              {isTarget
                ? `${targetDistance} KM  |  ${isAttackable ? 'ATTACK' : isScannable ? 'SCAN' : 'APPROACH'}`
                : isScanned
                  ? "DATA SECURED"
                  : "CLICK TO LOCK"}
            </Text>
          )}
        </Float>

        {data.moons?.map((moon) => (
          <Moon key={moon.id} data={moon} parentPlanetId={data.id} />
        ))}
      </group>
    </group>
  );
};
