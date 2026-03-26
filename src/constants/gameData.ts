import { PlanetData } from '../store/useGameStore';

export const PLANETS: PlanetData[] = [
  {
    id: 'sun',
    name: 'The Sun',
    radius: 40,
    distance: 0,
    speed: 0,
    color: '#ffcc00',
    description: 'The heart of our system. A massive ball of glowing plasma.',
    visuals: {
      type: 'star',
      surfaceColor: '#ffcc00',
      secondaryColor: '#ff8800',
      emissiveColor: '#ffcc00',
      emissiveIntensity: 2,
      atmosphere: { color: '#ffcc00', intensity: 1.5, opacity: 0.4 },
      damageConfig: { crackColor: '#ffffff', glowColor: '#ff0000' }
    },
    mass: 1000,
    gravityRadius: 1000,
    gravityStrength: 50
  },
  {
    id: 'mercury',
    name: 'Mercury',
    radius: 3,
    distance: 80,
    speed: 0.8,
    color: '#A5A5A5',
    description: 'The smallest and innermost planet. Scorched by the Sun.',
    visuals: {
      type: 'rocky',
      surfaceColor: '#A5A5A5',
      secondaryColor: '#707070',
      roughness: 0.9,
      damageConfig: { crackColor: '#ff4400', glowColor: '#ff8800' }
    },
    mass: 10,
    gravityRadius: 30,
    gravityStrength: 5
  },
  {
    id: 'venus',
    name: 'Venus',
    radius: 7,
    distance: 120,
    speed: 0.5,
    color: '#E3BB76',
    description: 'A hellish world of thick clouds and crushing pressure.',
    visuals: {
      type: 'rocky',
      surfaceColor: '#E3BB76',
      secondaryColor: '#B8860B',
      atmosphere: { color: '#E3BB76', intensity: 1.2, opacity: 0.3 },
      clouds: { color: '#FFE4B5', opacity: 0.6, speed: 0.8 },
      damageConfig: { crackColor: '#ff0000', glowColor: '#ffaa00' }
    },
    mass: 40,
    gravityRadius: 60,
    gravityStrength: 12
  },
  {
    id: 'earth',
    name: 'Earth',
    radius: 7.5,
    distance: 180,
    speed: 0.3,
    color: '#2271B3',
    description: 'Our home. The only known world teeming with life.',
    visuals: {
      type: 'rocky',
      surfaceColor: '#2271B3',
      secondaryColor: '#228B22',
      atmosphere: { color: '#4da6ff', intensity: 1.1, opacity: 0.2 },
      clouds: { color: '#ffffff', opacity: 0.5, speed: 0.4 },
      damageConfig: { crackColor: '#ff4400', glowColor: '#ffaa00' }
    },
    moons: [
      { id: 'moon', name: 'Moon', radius: 1.5, distance: 15, speed: 1.2, color: '#D6D6D6' }
    ],
    mass: 50,
    gravityRadius: 80,
    gravityStrength: 15
  },
  {
    id: 'mars',
    name: 'Mars',
    radius: 5,
    distance: 240,
    speed: 0.2,
    color: '#E27B58',
    description: 'The Red Planet. Home to the solar system\'s largest volcano.',
    visuals: {
      type: 'rocky',
      surfaceColor: '#E27B58',
      secondaryColor: '#8B4513',
      atmosphere: { color: '#E27B58', intensity: 1.05, opacity: 0.1 },
      damageConfig: { crackColor: '#ff2200', glowColor: '#ff6600' }
    },
    mass: 25,
    gravityRadius: 50,
    gravityStrength: 8
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    radius: 20,
    distance: 350,
    speed: 0.1,
    color: '#D39C7E',
    description: 'A gas giant with a Great Red Spot that could swallow Earth.',
    visuals: {
      type: 'gas',
      surfaceColor: '#D39C7E',
      secondaryColor: '#A0522D',
      atmosphere: { color: '#D39C7E', intensity: 1.3, opacity: 0.2 },
      damageConfig: { crackColor: '#ffffff', glowColor: '#ff00ff', stormColor: '#ff4400' }
    },
    mass: 300,
    gravityRadius: 300,
    gravityStrength: 40
  },
  {
    id: 'saturn',
    name: 'Saturn',
    radius: 16,
    distance: 480,
    speed: 0.07,
    color: '#C5AB6E',
    description: 'Famous for its spectacular ring system.',
    visuals: {
      type: 'gas',
      surfaceColor: '#C5AB6E',
      secondaryColor: '#BDB76B',
      atmosphere: { color: '#C5AB6E', intensity: 1.2, opacity: 0.15 },
      rings: { color: '#C5AB6E', innerRadius: 1.4, outerRadius: 2.4, opacity: 0.6 },
      damageConfig: { crackColor: '#ffffff', glowColor: '#00ffff', stormColor: '#ffff00' }
    },
    mass: 200,
    gravityRadius: 250,
    gravityStrength: 30
  },
  {
    id: 'uranus',
    name: 'Uranus',
    radius: 11,
    distance: 600,
    speed: 0.04,
    color: '#B5E3E3',
    description: 'An ice giant that rotates on its side.',
    visuals: {
      type: 'ice',
      surfaceColor: '#B5E3E3',
      secondaryColor: '#4682B4',
      atmosphere: { color: '#B5E3E3', intensity: 1.15, opacity: 0.1 },
      damageConfig: { crackColor: '#ffffff', glowColor: '#0000ff' }
    },
    mass: 100,
    gravityRadius: 150,
    gravityStrength: 20
  },
  {
    id: 'neptune',
    name: 'Neptune',
    radius: 10,
    distance: 700,
    speed: 0.03,
    color: '#4B70DD',
    description: 'The most distant planet. Whipped by supersonic winds.',
    visuals: {
      type: 'ice',
      surfaceColor: '#4B70DD',
      secondaryColor: '#00008B',
      atmosphere: { color: '#4B70DD', intensity: 1.15, opacity: 0.1 },
      damageConfig: { crackColor: '#ffffff', glowColor: '#4444ff' }
    },
    mass: 100,
    gravityRadius: 150,
    gravityStrength: 20
  }
];

export interface WeaponData {
  id: string;
  name: string;
  description: string;
  type: 'beam' | 'lance' | 'destabilizer';
  damage: number;
  chargeTime: number;
  cooldown: number;
  color: string;
  energyCost: number;
}

export const WEAPONS: WeaponData[] = [
  {
    id: 'fracture-beam',
    name: 'Fracture Beam',
    description: 'Concentrated sonic resonance designed to split tectonic plates.',
    type: 'beam',
    damage: 15,
    chargeTime: 2,
    cooldown: 3,
    color: '#00ffff',
    energyCost: 20
  },
  {
    id: 'thermal-lance',
    name: 'Thermal Lance',
    description: 'High-intensity plasma stream that melts planetary crusts.',
    type: 'lance',
    damage: 25,
    chargeTime: 4,
    cooldown: 5,
    color: '#ff4400',
    energyCost: 40
  },
  {
    id: 'graviton-destabilizer',
    name: 'Graviton Destabilizer',
    description: 'Manipulates local gravity to collapse planetary cores.',
    type: 'destabilizer',
    damage: 40,
    chargeTime: 8,
    cooldown: 10,
    color: '#aa00ff',
    energyCost: 70
  }
];

export const SHIP_SPECS = {
  acceleration: 20,
  boostMultiplier: 3,
  maxSpeed: 150,
  rotationSpeed: 1.5,
  strafeSpeed: 10,
  friction: 0.985,
  discoveryRange: 30,
  
  // Camera
  cameraLerp: 0.08,
  cameraOffset: { x: 0, y: 6, z: -18 },
  cameraLookAt: { x: 0, y: 0, z: 20 },
  fovNormal: 60,
  fovBoost: 85,
  
  cameraModes: {
    pilot: {
      offset: { x: 0, y: 4, z: -12 },
      lookAt: { x: 0, y: 0, z: 20 },
      lerp: 0.12,
      fov: 65
    },
    explorer: {
      offset: { x: 0, y: 12, z: -35 },
      lookAt: { x: 0, y: 0, z: 40 },
      lerp: 0.06,
      fov: 55
    },
    cinematic: {
      offset: { x: 15, y: 10, z: -25 },
      lookAt: { x: -5, y: 0, z: 10 },
      lerp: 0.03,
      fov: 45
    }
  },
  
  // Auto-Pilot
  autoPilotSpeed: 100,
  autoPilotSlowdownDist: 150,
  orbitDist: 50,
};
