import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, WeaponSlot } from '../../store/useGameStore';
import { PLANETS, WEAPONS, WEAPON_BINDINGS, WEAPON_SYSTEM_TUNING } from '../../constants/gameData';
import { useKeyboard } from '../../hooks/useKeyboard';

const SLOT_INPUTS: Record<string, string> = {
  LMB: 'MouseLeft',
  RMB: 'MouseRight',
  MMB: 'MouseMiddle',
};

const SLOT_PRIORITY: WeaponSlot[] = ['heavy', 'secondary', 'primary'];

export const WeaponSystem = () => {
  const keys = useKeyboard();
  const {
    shipPosition,
    targetPlanetId,
    currentWeaponId,
    setWeapon,
    activeWeaponSlot,
    setActiveWeaponSlot,
    weaponCooldowns,
    setWeaponCooldowns,
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
    weaponEffectIntensity,
    planetStates,
  } = useGameStore();

  const beamRef = useRef<THREE.Group>(null);
  const impactRef = useRef<THREE.Group>(null);
  const chargingSlotRef = useRef<WeaponSlot | null>(null);
  const fireFlashTimerRef = useRef(0);

  const [targetPos, setTargetPos] = useState(new THREE.Vector3());
  const [beamOpacity, setBeamOpacity] = useState(0);
  const [effectWeaponId, setEffectWeaponId] = useState(currentWeaponId);

  const weaponsById = useMemo(
    () =>
      Object.fromEntries(WEAPONS.map((weapon) => [weapon.id, weapon])) as Record<
        string,
        (typeof WEAPONS)[number]
      >,
    []
  );

  const bindingsBySlot = useMemo(
    () =>
      Object.fromEntries(WEAPON_BINDINGS.map((binding) => [binding.slot, binding])) as Record<
        WeaponSlot,
        (typeof WEAPON_BINDINGS)[number]
      >,
    []
  );

  const getBindingPressed = (slot: WeaponSlot) => {
    const binding = bindingsBySlot[slot];
    const mouseCode = binding.mouseInput ? SLOT_INPUTS[binding.mouseInput] : undefined;
    return Boolean(
      keys.current[binding.keyInput] ||
        keys.current[binding.fallbackKey] ||
        (mouseCode ? keys.current[mouseCode] : false)
    );
  };

  useFrame((_, delta) => {
    const nextCooldowns = { ...weaponCooldowns };
    let cooldownsChanged = false;

    (Object.keys(nextCooldowns) as WeaponSlot[]).forEach((slot) => {
      const nextValue = Math.max(0, nextCooldowns[slot] - delta * WEAPON_SYSTEM_TUNING.cooldownTickRate);
      if (Math.abs(nextValue - nextCooldowns[slot]) > 0.0001) {
        nextCooldowns[slot] = nextValue;
        cooldownsChanged = true;
      }
    });

    if (cooldownsChanged) {
      setWeaponCooldowns(nextCooldowns);
    }

    const targetPlanet = targetPlanetId ? PLANETS.find((planet) => planet.id === targetPlanetId) ?? null : null;
    const targetState = targetPlanet ? planetStates[targetPlanet.id] : null;
    const hasValidTarget = Boolean(targetPlanet && !targetState?.isDestroyed);

    if (!hasValidTarget || weaponMode !== 'armed') {
      if (chargingSlotRef.current) chargingSlotRef.current = null;
      if (isCharging) setIsCharging(false);
      if (isFiring) setIsFiring(false);
      if (chargeProgress !== 0) setChargeProgress(0);
      setBeamOpacity((prev) => Math.max(0, prev - delta * WEAPON_SYSTEM_TUNING.beamFadeSpeed));

      if (weaponEnergy < 100) {
        setWeaponEnergy(Math.min(100, weaponEnergy + delta * WEAPON_SYSTEM_TUNING.energyRegenPerSecond));
      }
      return;
    }

    const angle = simulationTime * targetPlanet.speed;
    const pPos = new THREE.Vector3(
      Math.cos(angle) * targetPlanet.distance,
      0,
      Math.sin(angle) * targetPlanet.distance
    );
    setTargetPos(pPos);

    const dist = shipPosition.distanceTo(pPos);
    const inRange = dist <= WEAPON_SYSTEM_TUNING.attackRange;

    const pressedSlot =
      SLOT_PRIORITY.find((slot) => getBindingPressed(slot)) ??
      null;

    const selectedSlot = chargingSlotRef.current ?? pressedSlot ?? activeWeaponSlot;
    const selectedBinding = bindingsBySlot[selectedSlot];
    const selectedWeapon = weaponsById[selectedBinding.weaponId] ?? WEAPONS[0];

    if (currentWeaponId !== selectedWeapon.id) {
      setWeapon(selectedWeapon.id);
    }
    if (activeWeaponSlot !== selectedSlot) {
      setActiveWeaponSlot(selectedSlot);
    }

    if (!pressedSlot && weaponEnergy < 100 && !chargingSlotRef.current) {
      setWeaponEnergy(Math.min(100, weaponEnergy + delta * WEAPON_SYSTEM_TUNING.energyRegenPerSecond));
    }

    const canUseSelectedWeapon =
      inRange &&
      nextCooldowns[selectedSlot] <= 0 &&
      weaponEnergy >= selectedWeapon.energyCost;

    if (chargingSlotRef.current) {
      const chargingSlot = chargingSlotRef.current;
      const chargingBinding = bindingsBySlot[chargingSlot];
      const chargingWeapon = weaponsById[chargingBinding.weaponId] ?? WEAPONS[0];
      const isStillHeld = getBindingPressed(chargingSlot);
      const chargingReady =
        inRange &&
        nextCooldowns[chargingSlot] <= 0 &&
        weaponEnergy >= chargingWeapon.energyCost;

      if (!isStillHeld || !chargingReady) {
        chargingSlotRef.current = null;
        if (isCharging) setIsCharging(false);
        if (chargeProgress !== 0) setChargeProgress(0);
      } else {
        const nextProgress = chargeProgress + delta / chargingWeapon.chargeTime;
        if (!isCharging) setIsCharging(true);

        if (nextProgress >= 1) {
          const currentDamage = useGameStore.getState().planetStates[targetPlanet.id]?.damage || 0;
          setPlanetDamage(targetPlanet.id, currentDamage + chargingWeapon.damage / 100);
          setWeaponEnergy(Math.max(0, weaponEnergy - chargingWeapon.energyCost));
          nextCooldowns[chargingSlot] = chargingWeapon.cooldown;
          setWeaponCooldowns(nextCooldowns);
          setChargeProgress(0);
          setIsCharging(false);
          setIsFiring(true);
          fireFlashTimerRef.current = 0.18;
          chargingSlotRef.current = null;
          setEffectWeaponId(chargingWeapon.id);
          setBeamOpacity(1);
        } else {
          setChargeProgress(nextProgress);
          setBeamOpacity(Math.max(beamOpacity, nextProgress * 0.35));
        }
      }
    } else if (pressedSlot && canUseSelectedWeapon) {
      chargingSlotRef.current = selectedSlot;
      if (!isCharging) setIsCharging(true);
      if (chargeProgress !== 0) setChargeProgress(0);
      setEffectWeaponId(selectedWeapon.id);
    }

    if (!chargingSlotRef.current) {
      if (isCharging) setIsCharging(false);
      if (chargeProgress !== 0 && !pressedSlot) setChargeProgress(0);
      setBeamOpacity((prev) => Math.max(0, prev - delta * WEAPON_SYSTEM_TUNING.beamFadeSpeed));
    }

    if (fireFlashTimerRef.current > 0) {
      fireFlashTimerRef.current = Math.max(0, fireFlashTimerRef.current - delta);
      if (fireFlashTimerRef.current === 0 && isFiring) {
        setIsFiring(false);
      }
    }

    if (beamRef.current) {
      beamRef.current.position.copy(shipPosition);
      beamRef.current.lookAt(pPos);
      beamRef.current.scale.set(1, 1, dist);
    }

    if (impactRef.current) {
      impactRef.current.position.copy(pPos);
      impactRef.current.lookAt(shipPosition);
    }
  });

  const activeWeapon = weaponsById[effectWeaponId] ?? weaponsById[currentWeaponId] ?? WEAPONS[0];
  const activeBinding = bindingsBySlot[activeWeaponSlot];
  const beamWidth =
    activeWeapon.type === 'destabilizer' ? 1.2 : activeWeapon.type === 'lance' ? 0.75 : 0.42;
  const sparkleScale =
    activeWeapon.type === 'destabilizer' ? 14 : activeWeapon.type === 'lance' ? 11 : 8;

  if (weaponMode !== 'armed' && beamOpacity <= 0 && !isCharging) return null;

  return (
    <group>
      {isCharging && (
        <group position={shipPosition}>
          <mesh>
            <sphereGeometry args={[0.7 + chargeProgress * 1.8 * weaponEffectIntensity, 18, 18]} />
            <meshBasicMaterial
              color={activeWeapon.color}
              transparent
              opacity={0.42 * weaponEffectIntensity}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <Sparkles
            count={Math.round((18 + chargeProgress * 22) * weaponEffectIntensity)}
            scale={2.2 + chargeProgress * 3.2}
            size={activeWeapon.type === 'destabilizer' ? 3 : 2}
            speed={activeWeapon.type === 'beam' ? 5 : 3.5}
            color={activeWeapon.color}
          />
        </group>
      )}

      <group ref={beamRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.5]}>
          <cylinderGeometry args={[beamWidth * weaponEffectIntensity, beamWidth * 1.5 * weaponEffectIntensity, 1, 10, 1, true]} />
          <meshBasicMaterial
            color={activeWeapon.color}
            transparent
            opacity={beamOpacity * weaponEffectIntensity}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.5]}>
          <cylinderGeometry args={[beamWidth * 0.28 * weaponEffectIntensity, beamWidth * 0.55 * weaponEffectIntensity, 1, 10, 1, true]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={beamOpacity * 0.82 * weaponEffectIntensity}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      <group ref={impactRef}>
        <Sparkles
          count={Math.round((40 + beamOpacity * 30) * weaponEffectIntensity)}
          scale={sparkleScale * Math.max(beamOpacity, 0.15) * weaponEffectIntensity}
          size={activeWeapon.type === 'destabilizer' ? 2.8 : 2.2}
          speed={3}
          color={activeWeapon.color}
          opacity={beamOpacity * weaponEffectIntensity}
        />
        <mesh position={targetPos}>
          <sphereGeometry args={[4.5 * Math.max(beamOpacity, 0.1) * weaponEffectIntensity, 16, 16]} />
          <meshBasicMaterial
            color={activeWeapon.color}
            transparent
            opacity={beamOpacity * 0.48 * weaponEffectIntensity}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <pointLight
          color={activeWeapon.color}
          intensity={beamOpacity * 18 * weaponEffectIntensity}
          distance={110}
        />
      </group>

    </group>
  );
};
