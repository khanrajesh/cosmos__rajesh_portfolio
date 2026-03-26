import { create } from 'zustand';
import * as THREE from 'three';
import { PLANETS } from '../constants/gameData';

export interface MoonData {
  id: string;
  name: string;
  radius: number;
  distance: number;
  speed: number;
  color: string;
}

export type PlanetType = 'rocky' | 'gas' | 'ice' | 'star';

export interface PlanetVisualConfig {
  type: PlanetType;
  surfaceColor: string;
  secondaryColor?: string;
  emissiveColor?: string;
  emissiveIntensity?: number;
  roughness?: number;
  metalness?: number;
  atmosphere?: {
    color: string;
    intensity: number;
    opacity: number;
  };
  clouds?: {
    color: string;
    opacity: number;
    speed: number;
  };
  rings?: {
    color: string;
    innerRadius: number;
    outerRadius: number;
    opacity: number;
  };
  damageConfig: {
    crackColor: string;
    glowColor: string;
    stormColor?: string;
  };
}

export interface PlanetState {
  damage: number; // 0 to 1
  isCritical: boolean;
  health: number; // 0 to 100
  isDestroyed: boolean;
  destructionTime?: number;
  effectiveMass: number;
}

export interface WeaponData {
  id: string;
  name: string;
  description: string;
  type: 'beam' | 'lance' | 'destabilizer';
  damage: number;
  chargeTime: number; // seconds
  cooldown: number; // seconds
  color: string;
  energyCost: number;
}

export interface PlanetData {
  id: string;
  name: string;
  radius: number;
  distance: number;
  speed: number;
  color: string;
  description: string;
  visuals: PlanetVisualConfig;
  moons?: MoonData[];
  // Gravity properties
  mass: number;
  gravityRadius: number;
  gravityStrength: number;
}

export type GameStatus = 'loading' | 'menu' | 'playing';
export type CameraMode = 'pilot' | 'explorer' | 'cinematic';
export type GraphicsQuality = 'low' | 'medium' | 'high';
export type GameMode = 'explorer' | 'sandbox';

interface GameState {
  // Game Status
  status: GameStatus;
  gameMode: GameMode;
  
  // Ship State
  shipPosition: THREE.Vector3;
  shipVelocity: THREE.Vector3;
  shipQuaternion: THREE.Quaternion;
  isBoosting: boolean;
  isAutoPilot: boolean;
  orbitAssist: boolean;
  gravityInfluence: number; // 0 to 1
  gravitySourceId: string | null;
  gravityVector: THREE.Vector3;
  
  // Navigation
  targetPlanetId: string | null;
  timeScale: number;
  showOrbits: boolean;
  showGravityOverlay: boolean;
  showAnalysisPanel: boolean;
  isInspectionMode: boolean;
  
  // Camera & Visuals
  cameraMode: CameraMode;
  graphicsQuality: GraphicsQuality;
  effectIntensity: number;
  cameraSensitivity: number;
  zoomSensitivity: number;
  debrisIntensity: number;
  weaponEffectIntensity: number;
  cameraRotation: THREE.Euler;
  cameraDistance: number;
  
  // Simulation
  simulationTime: number;
  
  // Discovery & Progression
  scannedPlanetIds: string[];
  scanProgress: number;
  isScanning: boolean;
  objective: string;
  isPaused: boolean;
  weaponMode: 'safe' | 'armed';
  currentWeaponId: string;
  weaponEnergy: number; // 0 to 100
  isFiring: boolean;
  isCharging: boolean;
  chargeProgress: number; // 0 to 1
  
  // Planet States
  planetStates: Record<string, PlanetState>;
  planetPositions: Record<string, THREE.Vector3>;
  
  // Destruction Events
  destructionEvents: Record<string, {
    id: string;
    startTime: number;
    position: THREE.Vector3;
    radius: number;
    color: string;
  }>;
  
  // Actions
  setStatus: (status: GameStatus) => void;
  setGameMode: (mode: GameMode) => void;
  setShipState: (pos: THREE.Vector3, vel: THREE.Vector3, quat: THREE.Quaternion, isBoosting: boolean) => void;
  setTarget: (id: string | null) => void;
  setTimeScale: (scale: number) => void;
  setShowOrbits: (show: boolean) => void;
  setShowGravityOverlay: (show: boolean) => void;
  setShowAnalysisPanel: (show: boolean) => void;
  setIsInspectionMode: (is: boolean) => void;
  setAutoPilot: (active: boolean) => void;
  setOrbitAssist: (active: boolean) => void;
  setGravityInfluence: (value: number) => void;
  setGravitySourceId: (id: string | null) => void;
  setGravityVector: (vec: THREE.Vector3) => void;
  setCameraMode: (mode: CameraMode) => void;
  setGraphicsQuality: (quality: GraphicsQuality) => void;
  setEffectIntensity: (intensity: number) => void;
  setCameraSensitivity: (sensitivity: number) => void;
  setZoomSensitivity: (sensitivity: number) => void;
  setDebrisIntensity: (intensity: number) => void;
  setWeaponEffectIntensity: (intensity: number) => void;
  setCameraRotation: (rotation: THREE.Euler) => void;
  setCameraDistance: (distance: number) => void;
  resetCamera: () => void;
  setScanProgress: (progress: number) => void;
  setIsScanning: (active: boolean) => void;
  addScannedPlanet: (id: string) => void;
  setObjective: (text: string) => void;
  setPaused: (paused: boolean) => void;
  setWeaponMode: (mode: 'safe' | 'armed') => void;
  setWeapon: (id: string) => void;
  setIsFiring: (active: boolean) => void;
  setIsCharging: (active: boolean) => void;
  setChargeProgress: (progress: number) => void;
  setWeaponEnergy: (energy: number) => void;
  setPlanetDamage: (id: string, damage: number) => void;
  destroyPlanet: (id: string) => void;
  updatePlanetPosition: (id: string, pos: THREE.Vector3) => void;
  updateSimulationTime: (delta: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  status: 'menu',
  gameMode: 'explorer',
  
  shipPosition: new THREE.Vector3(0, 0, 500),
  shipVelocity: new THREE.Vector3(0, 0, 0),
  shipQuaternion: new THREE.Quaternion(),
  isBoosting: false,
  isAutoPilot: false,
  orbitAssist: false,
  gravityInfluence: 0,
  gravitySourceId: null,
  gravityVector: new THREE.Vector3(),
  
  targetPlanetId: null,
  timeScale: 1,
  showOrbits: true,
  showGravityOverlay: false,
  showAnalysisPanel: false,
  isInspectionMode: false,
  
  cameraMode: 'pilot',
  graphicsQuality: 'high',
  effectIntensity: 0.8,
  cameraSensitivity: 0.5,
  zoomSensitivity: 0.5,
  debrisIntensity: 0.8,
  weaponEffectIntensity: 0.8,
  cameraRotation: new THREE.Euler(0, 0, 0),
  cameraDistance: 15,
  
  simulationTime: 0,
  
  scannedPlanetIds: [],
  scanProgress: 0,
  isScanning: false,
  objective: 'Select Earth to begin mission',
  isPaused: false,
  weaponMode: 'safe',
  currentWeaponId: 'fracture-beam',
  weaponEnergy: 100,
  isFiring: false,
  isCharging: false,
  chargeProgress: 0,
  
  planetStates: {},
  planetPositions: {},
  destructionEvents: {},
  
  setStatus: (status) => set({ status }),
  setGameMode: (gameMode) => set({ gameMode }),
  
  setShipState: (pos, vel, quat, isBoosting) => set({ 
    shipPosition: pos.clone(), 
    shipVelocity: vel.clone(), 
    shipQuaternion: quat.clone(),
    isBoosting
  }),
  
  setTarget: (id) => set((state) => {
    let nextObjective = state.objective;
    if (id === 'earth' && state.objective === 'Select Earth to begin mission') {
      nextObjective = 'Travel to Earth';
    }
    return { targetPlanetId: id, objective: nextObjective };
  }),
  
  setTimeScale: (scale) => set({ timeScale: scale }),
  
  setShowOrbits: (show) => set({ showOrbits: show }),
  setShowGravityOverlay: (showGravityOverlay) => set({ showGravityOverlay }),
  setShowAnalysisPanel: (showAnalysisPanel) => set({ showAnalysisPanel }),
  setIsInspectionMode: (isInspectionMode) => set({ isInspectionMode }),
  
  setAutoPilot: (active) => set({ isAutoPilot: active }),
  setOrbitAssist: (orbitAssist) => set({ orbitAssist }),
  setGravityInfluence: (gravityInfluence) => set({ gravityInfluence }),
  setGravitySourceId: (gravitySourceId) => set({ gravitySourceId }),
  setGravityVector: (gravityVector) => set({ gravityVector: gravityVector.clone() }),
  
  setCameraMode: (mode) => set({ cameraMode: mode }),
  
  setGraphicsQuality: (quality) => set({ graphicsQuality: quality }),
  
  setEffectIntensity: (intensity) => set({ effectIntensity: intensity }),
  
  setCameraSensitivity: (sensitivity) => set({ cameraSensitivity: sensitivity }),
  setZoomSensitivity: (sensitivity) => set({ zoomSensitivity: sensitivity }),
  setDebrisIntensity: (intensity) => set({ debrisIntensity: intensity }),
  setWeaponEffectIntensity: (intensity) => set({ weaponEffectIntensity: intensity }),
  
  setCameraRotation: (cameraRotation) => set({ cameraRotation }),
  setCameraDistance: (cameraDistance) => set({ cameraDistance }),
  resetCamera: () => set({ 
    cameraRotation: new THREE.Euler(0, 0, 0), 
    cameraDistance: 15,
    cameraMode: 'pilot'
  }),
  
  setScanProgress: (progress) => set({ scanProgress: progress }),
  
  setIsScanning: (active) => set({ isScanning: active }),
  
  addScannedPlanet: (id) => set((state) => ({ 
    scannedPlanetIds: [...state.scannedPlanetIds, id] 
  })),
  
  setObjective: (text) => set({ objective: text }),
  
  setPaused: (paused) => set({ isPaused: paused }),
  
  setWeaponMode: (mode: 'safe' | 'armed') => set({ weaponMode: mode }),
  
  setWeapon: (id) => set({ currentWeaponId: id }),
  setIsFiring: (isFiring) => set({ isFiring }),
  setIsCharging: (isCharging) => set({ isCharging }),
  setChargeProgress: (chargeProgress) => set({ chargeProgress }),
  setWeaponEnergy: (weaponEnergy) => set({ weaponEnergy }),
  
  setPlanetDamage: (id, damage) => set((state) => {
    const currentState = state.planetStates[id] || { damage: 0, isCritical: false, health: 100, isDestroyed: false, effectiveMass: 0 };
    const planet = PLANETS.find(p => p.id === id);
    if (!planet && id !== 'sun') return state;
    
    const baseMass = planet?.mass || 0;
    const nextDamage = Math.min(1, damage);
    const isNowDestroyed = nextDamage >= 1 && !currentState.isDestroyed;
    
    const nextState = {
      ...currentState,
      damage: nextDamage,
      isCritical: nextDamage > 0.8,
      health: Math.max(0, 100 - nextDamage * 100),
      isDestroyed: nextDamage >= 1 || currentState.isDestroyed,
      effectiveMass: nextDamage >= 1 ? baseMass * 0.1 : baseMass, // Reduce mass on destruction
    };

    if (isNowDestroyed) {
      nextState.destructionTime = state.simulationTime;
      
      // Calculate current position for the event
      const angle = state.simulationTime * (planet?.speed || 0);
      const pos = new THREE.Vector3(
        Math.cos(angle) * (planet?.distance || 0),
        0,
        Math.sin(angle) * (planet?.distance || 0)
      );

      return {
        planetStates: { ...state.planetStates, [id]: nextState },
        destructionEvents: {
          ...state.destructionEvents,
          [id]: {
            id,
            startTime: state.simulationTime,
            position: pos,
            radius: planet?.radius || 10,
            color: planet?.visuals.damageConfig.glowColor || '#ff4400'
          }
        }
      };
    }

    return {
      planetStates: {
        ...state.planetStates,
        [id]: nextState
      }
    };
  }),

  destroyPlanet: (id) => {
    const state = useGameStore.getState();
    state.setPlanetDamage(id, 1);
  },

  updatePlanetPosition: (id, pos) => set((state) => ({
    planetPositions: {
      ...state.planetPositions,
      [id]: pos.clone()
    }
  })),
  
  updateSimulationTime: (delta) => set((state) => ({ 
    simulationTime: state.simulationTime + delta * state.timeScale 
  })),
}));
