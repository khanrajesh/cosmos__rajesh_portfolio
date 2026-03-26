import { useGameStore, CameraMode, GraphicsQuality, GameMode, WeaponData } from '../../store/useGameStore';
import { PLANETS, WEAPONS } from '../../constants/gameData';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, EyeOff, Play, Pause, Navigation, Zap, Radar, BookOpen, Target, 
  Settings, Camera, Monitor, Sliders, X, ChevronRight, Info, 
  RotateCcw, Shield, Crosshair, Globe, Activity, Flame, ZapOff,
  Dna, Atom, BarChart3, AlertTriangle
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { AnalysisPanel } from './AnalysisPanel';

export const HUD = () => {
  const { 
    shipVelocity, 
    shipPosition,
    targetPlanetId, 
    status, 
    timeScale, 
    setTimeScale, 
    showOrbits, 
    setShowOrbits,
    isAutoPilot, 
    setAutoPilot,
    isBoosting,
    isScanning,
    setIsScanning,
    scanProgress,
    scannedPlanetIds,
    objective,
    simulationTime,
    cameraMode,
    setCameraMode,
    graphicsQuality,
    setGraphicsQuality,
    effectIntensity,
    setEffectIntensity,
    cameraSensitivity,
    setCameraSensitivity,
    zoomSensitivity,
    setZoomSensitivity,
    debrisIntensity,
    setDebrisIntensity,
    weaponEffectIntensity,
    setWeaponEffectIntensity,
    isPaused,
    setPaused,
    gameMode,
    setGameMode,
    orbitAssist,
    setOrbitAssist,
    gravityInfluence,
    showGravityOverlay,
    setShowGravityOverlay,
    resetCamera,
    weaponMode,
    setWeaponMode,
    currentWeaponId,
    setWeapon,
    weaponEnergy,
    isFiring,
    setIsFiring,
    isCharging,
    chargeProgress,
    planetStates,
    showAnalysisPanel,
    setShowAnalysisPanel,
    shipHealth,
    shipStatus,
    collisionWarning,
    gravityWarning,
    lastCollisionTime,
    lastCollisionObject,
    flightMode,
    setFlightMode,
    controlSmoothing,
    setControlSmoothing
  } = useGameStore();

  const [showCodex, setShowCodex] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const criticalPlanets = useMemo(() => {
    return Object.entries(planetStates)
      .filter(([id, state]) => state.isDestroyed || state.damage > 0.7)
      .map(([id, state]) => ({
        id,
        name: PLANETS.find(p => p.id === id)?.name || id,
        isDestroyed: state.isDestroyed,
        damage: state.damage
      }));
  }, [planetStates]);

  const target = PLANETS.find(p => p.id === targetPlanetId);
  
  const distance = useMemo(() => {
    if (!target) return 0;
    const angle = simulationTime * target.speed;
    const targetPos = {
      x: Math.cos(angle) * target.distance,
      z: Math.sin(angle) * target.distance
    };
    return Math.round(Math.sqrt(
      Math.pow(shipPosition.x - targetPos.x, 2) + 
      Math.pow(shipPosition.z - targetPos.z, 2)
    ));
  }, [target, shipPosition, simulationTime]);

  const speed = Math.round(shipVelocity.length() * 10);

  const isScanned = target && scannedPlanetIds.includes(target.id);

  const isRecentlyCollided = simulationTime - lastCollisionTime < 2;

  const collisionVignette = useMemo(() => {
    if (collisionWarning) return 'rgba(239, 68, 68, 0.3)';
    if (isRecentlyCollided) return 'rgba(239, 68, 68, 0.15)';
    if (gravityWarning) return 'rgba(249, 115, 22, 0.1)';
    return 'transparent';
  }, [collisionWarning, isRecentlyCollided, gravityWarning]);

  if (status !== 'playing') return null;

  const cameraModes: { id: CameraMode; label: string }[] = [
    { id: 'pilot', label: 'PILOT' },
    { id: 'explorer', label: 'EXPLORER' },
    { id: 'cinematic', label: 'CINEMATIC' }
  ];

  return (
    <div className="fixed inset-0 pointer-events-none font-mono text-xs text-[#00ffff] select-none">
      {/* --- COLLISION VIGNETTE --- */}
      <div 
        className="fixed inset-0 transition-colors duration-300 pointer-events-none z-0"
        style={{ 
          background: `radial-gradient(circle, transparent 40%, ${collisionVignette} 100%)`,
          boxShadow: collisionWarning ? 'inset 0 0 100px rgba(239, 68, 68, 0.5)' : 'none'
        }}
      />

      {/* --- TOP BAR: MISSION & STATUS --- */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between px-8 border-t-2 border-[#00ffff]/30">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
          <div className="w-full h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(0,255,255,0.1)_2px)]" />
        </div>
        <div className="flex items-center gap-8 relative z-10">
          <div className="flex flex-col">
            <span className="text-[8px] opacity-40 tracking-[0.3em]">MISSION OBJECTIVE</span>
            <span className="text-[10px] font-bold tracking-wider uppercase">{objective}</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[8px] opacity-40 tracking-[0.3em]">SYSTEM MODE</span>
            <span className="text-[10px] font-bold tracking-wider text-white">{gameMode.toUpperCase()}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[8px] opacity-40 tracking-[0.3em]">SIMULATION TIME</div>
            <div className="text-[10px] font-bold">T+{Math.floor(simulationTime / 100)}:{(Math.floor(simulationTime) % 100).toString().padStart(2, '0')}</div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#00ffff]/5 border border-[#00ffff]/20 rounded">
            <Activity size={12} className="animate-pulse" />
            <span className="text-[10px] font-bold">LINK STABLE</span>
          </div>
        </div>
      </div>

      {/* --- WARNINGS: GRAVITATIONAL INSTABILITY --- */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <AnimatePresence>
          {collisionWarning && shipStatus !== 'destroyed' && (
            <motion.div
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="px-10 py-3 bg-red-600/60 border-2 border-red-400 backdrop-blur-xl flex items-center gap-4 shadow-[0_0_40px_rgba(239,68,68,0.4)]"
            >
              <AlertTriangle size={20} className="text-white animate-pulse" />
              <span className="text-lg font-black tracking-[0.4em] text-white uppercase">COLLISION IMMINENT</span>
            </motion.div>
          )}

          {gravityWarning && !collisionWarning && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="px-8 py-2 bg-orange-500/40 border border-orange-400 backdrop-blur-lg flex items-center gap-3 shadow-[0_0_20px_rgba(249,115,22,0.2)]"
            >
              <Activity size={14} className="text-orange-300 animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.3em] text-orange-200 uppercase">HIGH GRAVITY WELL DETECTED</span>
            </motion.div>
          )}

          {isRecentlyCollided && shipStatus !== 'destroyed' && !collisionWarning && (
            <motion.div
              initial={{ opacity: 0, scale: 1.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="px-8 py-4 bg-red-600/40 border-2 border-red-500 backdrop-blur-xl flex flex-col items-center gap-1 shadow-[0_0_50px_rgba(239,68,68,0.3)]"
            >
              <div className="flex items-center gap-3 text-white">
                <AlertTriangle size={24} className="animate-bounce" />
                <span className="text-xl font-black tracking-[0.3em] uppercase">COLLISION DETECTED</span>
              </div>
              <span className="text-[10px] font-bold text-red-200 tracking-widest uppercase">
                IMPACT WITH {lastCollisionObject?.toUpperCase() || 'UNKNOWN OBJECT'}
              </span>
            </motion.div>
          )}

          {shipStatus === 'destroyed' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-12 py-8 bg-red-900/80 border-4 border-red-500 backdrop-blur-2xl flex flex-col items-center gap-4 shadow-[0_0_100px_rgba(239,68,68,0.5)]"
            >
              <ZapOff size={48} className="text-red-500 animate-pulse" />
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black tracking-[0.5em] text-white uppercase">VESSEL DESTROYED</span>
                <span className="text-xs font-bold text-red-300 tracking-[0.2em] mt-2">INITIATING EMERGENCY RESPAWN PROTOCOL...</span>
              </div>
              <div className="w-64 h-1 bg-white/10 mt-4 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-red-500"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "linear" }}
                />
              </div>
            </motion.div>
          )}

          {criticalPlanets.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`px-6 py-2 border-l-4 ${p.isDestroyed ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-orange-500/20 border-orange-500 text-orange-500'} backdrop-blur-md flex items-center gap-4 shadow-[0_0_20px_rgba(239,68,68,0.1)]`}
            >
              <Flame size={16} className="animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold tracking-widest uppercase">
                  {p.isDestroyed ? 'GRAVITATIONAL COLLAPSE' : 'CRITICAL INSTABILITY'}
                </span>
                <span className="text-[8px] opacity-70 tracking-wider">
                  {p.name.toUpperCase()} - {p.isDestroyed ? 'MASS REDUCED 90%' : `STRUCTURAL DAMAGE ${Math.round(p.damage * 100)}%`}
                </span>
                {p.isDestroyed && (
                  <div className="flex gap-2 mt-1">
                    <span className="text-[7px] px-1 bg-red-500 text-white font-bold">DEBRIS BELT FORMING</span>
                    {PLANETS.find(pl => pl.id === p.id)?.moons?.length ? (
                      <span className="text-[7px] px-1 bg-orange-500 text-black font-bold">MOON ESCAPE TRAJECTORY</span>
                    ) : null}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* --- LEFT PANEL: VESSEL TELEMETRY --- */}
      <div className="absolute top-24 left-8 space-y-6 w-64">
        <div className="p-6 bg-black/60 border-l-2 border-[#00ffff] backdrop-blur-md shadow-[0_0_30px_rgba(0,255,255,0.05)] relative overflow-hidden group">
          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00ffff]/40" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00ffff]/40" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#00ffff]/40" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00ffff]/40" />
          
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <Zap size={40} />
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-end mb-1">
                <span className="text-[9px] opacity-50 tracking-widest">VELOCITY ({flightMode.toUpperCase()})</span>
                <span className="text-[8px] opacity-30">KM/S</span>
              </div>
              <div className="text-4xl font-light tracking-tighter">{speed}</div>
              <div className="mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full ${isBoosting ? 'bg-orange-500 shadow-[0_0_10px_#f97316]' : 'bg-[#00ffff]'}`}
                  animate={{ width: `${Math.min(speed / 5, 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-white/5">
              <div className="flex justify-between text-[8px] opacity-40 mb-1">
                <span>HULL INTEGRITY</span>
                <span className={shipHealth < 25 ? 'text-red-500 font-bold animate-pulse' : ''}>{Math.round(shipHealth)}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  className={`h-full ${shipHealth < 25 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : shipHealth < 75 ? 'bg-orange-500' : 'bg-[#00ffff]'}`}
                  animate={{ width: `${shipHealth}%` }}
                />
              </div>
              {shipStatus !== 'intact' && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`text-[7px] mt-1 font-bold uppercase tracking-widest flex items-center gap-2 ${shipStatus === 'critical' ? 'text-red-500 animate-pulse' : 'text-orange-400'}`}
                >
                  <AlertTriangle size={8} />
                  STATUS: {shipStatus}
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div className="space-y-1">
                <span className="text-[8px] opacity-40">THRUST</span>
                <div className={`text-[10px] font-bold ${speed > 0 ? 'text-[#00ffff]' : 'text-white/20'}`}>
                  {speed > 0 ? (isBoosting ? 'OVERDRIVE' : 'NOMINAL') : 'IDLE'}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[8px] opacity-40">GRAVITY</span>
                <div className="text-[10px] font-bold text-white uppercase">
                  {gravityInfluence > 0.05 ? (
                    <span className="text-[#00ffff]">
                      {PLANETS.find(p => p.id === useGameStore.getState().gravitySourceId)?.name || 'UNKNOWN'} ({(gravityInfluence * 100).toFixed(1)}%)
                    </span>
                  ) : 'ZERO-G'}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between text-[8px] opacity-40 mb-1">
                <span>WEAPON ENERGY</span>
                <span>{Math.round(weaponEnergy)}%</span>
              </div>
              <div className="h-0.5 w-full bg-white/10">
                <motion.div 
                  className="h-full bg-red-500" 
                  animate={{ width: `${weaponEnergy}%` }}
                />
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between text-[8px] opacity-40 mb-1">
                <span>FUEL CELLS</span>
                <span>98%</span>
              </div>
              <div className="h-0.5 w-full bg-white/10">
                <div className="h-full bg-green-500 w-[98%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-2 bg-black/60 border border-white/10 backdrop-blur-md rounded flex flex-col gap-2 pointer-events-auto">
          <button 
            onClick={() => setFlightMode(flightMode === 'cruise' ? 'precision' : 'cruise')}
            className={`flex items-center gap-3 p-3 transition-all rounded ${
              flightMode === 'precision' 
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' 
              : 'hover:bg-white/5 text-white/60'
            }`}
          >
            <Zap size={16} />
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold tracking-widest">FLIGHT MODE</span>
              <span className="text-[7px] opacity-50 uppercase">{flightMode} MODE</span>
            </div>
          </button>

          <button 
            onClick={() => setIsScanning(!isScanning)}
            disabled={!target || distance > 100}
            className={`flex items-center gap-3 p-3 transition-all rounded ${
              isScanning 
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' 
              : 'hover:bg-white/5 text-white/60'
            } ${(!target || distance > 100) && 'opacity-20 cursor-not-allowed'}`}
          >
            <Radar size={16} />
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold tracking-widest">SCANNER</span>
              <span className="text-[7px] opacity-50">PROXIMITY SENSOR</span>
            </div>
          </button>

          <button 
            onClick={() => setAutoPilot(!isAutoPilot)}
            className={`flex items-center gap-3 p-3 transition-all rounded ${
              isAutoPilot 
              ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
              : 'hover:bg-white/5 text-white/60'
            }`}
          >
            <Navigation size={16} />
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold tracking-widest">AUTO-PILOT</span>
              <span className="text-[7px] opacity-50">NAV-COMPUTER</span>
            </div>
          </button>

          <button 
            onClick={() => setOrbitAssist(!orbitAssist)}
            className={`flex items-center gap-3 p-3 transition-all rounded ${
              orbitAssist 
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' 
              : 'hover:bg-white/5 text-white/60'
            }`}
          >
            <Globe size={16} />
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold tracking-widest">ORBIT ASSIST</span>
              <span className="text-[7px] opacity-50">STABILIZATION</span>
            </div>
          </button>

          <button 
            onClick={() => setShowGravityOverlay(!showGravityOverlay)}
            className={`flex items-center gap-3 p-3 transition-all rounded ${
              showGravityOverlay 
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' 
              : 'hover:bg-white/5 text-white/60'
            }`}
          >
            <Shield size={16} />
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold tracking-widest">GRAVITY GRID</span>
              <span className="text-[7px] opacity-50">VISUALIZER</span>
            </div>
          </button>

          <button 
            onClick={() => setShowAnalysisPanel(!showAnalysisPanel)}
            className={`flex items-center gap-3 p-3 transition-all rounded ${
              showAnalysisPanel 
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
              : 'hover:bg-white/5 text-white/60'
            }`}
          >
            <BarChart3 size={16} />
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold tracking-widest">ANALYSIS</span>
              <span className="text-[7px] opacity-50">SYSTEM IMPACT</span>
            </div>
          </button>

          <button 
            onClick={() => setWeaponMode(weaponMode === 'safe' ? 'armed' : 'safe')}
            className={`flex items-center gap-3 p-3 transition-all rounded ${
              weaponMode === 'armed' 
              ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
              : 'hover:bg-white/5 text-white/60'
            }`}
          >
            <Crosshair size={16} />
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold tracking-widest">WEAPON SYS</span>
              <span className="text-[7px] opacity-50">{weaponMode === 'armed' ? 'READY' : 'SAFE'}</span>
            </div>
          </button>

          {weaponMode === 'armed' && (
            <div className="mt-2 p-2 border-t border-white/10 space-y-2">
              {WEAPONS.map(w => (
                <button
                  key={w.id}
                  onClick={() => setWeapon(w.id)}
                  className={`w-full flex items-center gap-2 p-2 rounded text-[9px] transition-all ${
                    currentWeaponId === w.id 
                    ? 'bg-red-500/40 text-white border border-red-500/50' 
                    : 'hover:bg-white/5 text-white/40'
                  }`}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: w.color }} />
                  <span className="font-bold tracking-wider uppercase">{w.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- RIGHT PANEL: TARGET DATA --- */}
      <AnimatePresence>
        {target && (
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="absolute top-24 right-8 w-72 space-y-6"
          >
            <div className="p-6 bg-black/60 border-r-2 border-[#00ffff] backdrop-blur-md shadow-[0_0_30px_rgba(0,255,255,0.05)] relative overflow-hidden">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00ffff]/40" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00ffff]/40" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#00ffff]/40" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00ffff]/40" />
              
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-[#00ffff] opacity-50">
                  <Target size={14} />
                  <span className="text-[9px] tracking-[0.2em]">TARGET LOCK</span>
                </div>
                <span className="text-[10px] font-bold text-white">{distance.toLocaleString()} KM</span>
              </div>

              <h2 className="text-3xl font-light tracking-wider uppercase mb-2">{target.name}</h2>
              
              {/* Damage Status */}
              <div className="mb-6 space-y-2">
                <div className="flex justify-between text-[8px] tracking-widest">
                  <span className="opacity-40 uppercase">Integrity</span>
                  <span className={planetStates[target.id]?.isCritical ? 'text-red-500' : 'text-green-400'}>
                    {Math.round(planetStates[target.id]?.health ?? 100)}%
                  </span>
                </div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full ${planetStates[target.id]?.isCritical ? 'bg-red-500' : 'bg-green-400'}`}
                    animate={{ width: `${planetStates[target.id]?.health ?? 100}%` }}
                  />
                </div>
                {planetStates[target.id]?.isDestroyed && (
                  <div className="text-[9px] font-bold text-red-500 animate-pulse tracking-[0.2em] uppercase">
                    Planet Destabilized / Core Collapse
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-white/5 border border-white/10 rounded">
                    <div className="text-[7px] opacity-40 mb-1 uppercase tracking-widest">Orbital Speed</div>
                    <div className="text-[10px] font-bold">{(target.speed * 1000).toFixed(1)} KM/H</div>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/10 rounded">
                    <div className="text-[7px] opacity-40 mb-1 uppercase tracking-widest">Moons</div>
                    <div className="text-[10px] font-bold">{target.moons?.length || 0} DETECTED</div>
                  </div>
                </div>

                <div className="p-4 bg-[#00ffff]/5 border border-[#00ffff]/10 rounded text-[10px] leading-relaxed opacity-70">
                  {isScanned ? target.description : "DATA ENCRYPTED. INITIATE PROXIMITY SCAN TO UNLOCK PLANETARY DETAILS."}
                </div>

                {isScanning && (
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-[9px] font-bold">
                      <span className="animate-pulse">SCANNING...</span>
                      <span>{Math.round(scanProgress)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-orange-500 shadow-[0_0_10px_#f97316]"
                        initial={{ width: 0 }}
                        animate={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {isScanned && (
                  <div className="flex items-center gap-2 text-green-400 text-[9px] font-bold bg-green-500/10 p-2 rounded border border-green-500/20">
                    <Shield size={12} />
                    <span>PLANETARY DATA SECURED</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- BOTTOM BAR: SIMULATION & CAMERA --- */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between px-8 border-b-2 border-[#00ffff]/30">
        <div className="flex items-center gap-6 pointer-events-auto">
          <div className="flex items-center gap-2 bg-black/40 p-1 rounded border border-white/5">
            {cameraModes.map(mode => (
              <button
                key={mode.id}
                onClick={() => setCameraMode(mode.id)}
                className={`px-4 py-2 rounded text-[9px] font-bold tracking-[0.2em] transition-all ${
                  cameraMode === mode.id 
                  ? 'bg-[#00ffff] text-black shadow-[0_0_15px_rgba(0,255,255,0.3)]' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
          <button 
            onClick={resetCamera}
            className="p-3 bg-white/5 border border-white/10 rounded hover:border-[#00ffff] hover:text-[#00ffff] transition-all"
            title="Reset Camera"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        <div className="flex items-center gap-8 pointer-events-auto">
          <div className="flex items-center gap-4 px-6 py-2 bg-black/40 rounded border border-white/5">
            <button 
              onClick={() => setPaused(!isPaused)}
              className="text-white hover:text-[#00ffff] transition-colors"
            >
              {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
            </button>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex flex-col gap-1 w-32">
              <div className="flex justify-between text-[9px] font-bold opacity-60">
                <span>TIME SCALE</span>
                <span>{timeScale.toFixed(1)}X</span>
              </div>
              <input 
                type="range" min="0" max="10" step="0.1" 
                value={timeScale}
                onChange={(e) => setTimeScale(parseFloat(e.target.value))}
                className="w-full accent-[#00ffff] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowOrbits(!showOrbits)}
              className={`p-3 rounded border transition-all ${showOrbits ? 'bg-[#00ffff]/10 border-[#00ffff] text-[#00ffff]' : 'bg-white/5 border-white/10 text-white/40'}`}
              title="Toggle Orbits"
            >
              <Eye size={18} />
            </button>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-3 rounded border transition-all ${showSettings ? 'bg-[#00ffff]/10 border-[#00ffff] text-[#00ffff]' : 'bg-white/5 border-white/10 text-white/40'}`}
              title="Settings"
            >
              <Settings size={18} />
            </button>
            <button 
              onClick={() => setShowCodex(!showCodex)}
              className={`p-3 rounded border transition-all ${showCodex ? 'bg-[#00ffff]/10 border-[#00ffff] text-[#00ffff]' : 'bg-white/5 border-white/10 text-white/40'}`}
              title="Discovery Log"
            >
              <BookOpen size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* --- CENTER CROSSHAIR --- */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 pointer-events-none">
        <div className={`absolute inset-0 transition-opacity duration-300 ${weaponMode === 'armed' ? 'opacity-100' : 'opacity-40'}`}>
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 ${weaponMode === 'armed' ? 'bg-red-500' : 'bg-[#00ffff]'}`} />
          <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-4 ${weaponMode === 'armed' ? 'bg-red-500' : 'bg-[#00ffff]'}`} />
          <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-4 h-px ${weaponMode === 'armed' ? 'bg-red-500' : 'bg-[#00ffff]'}`} />
          <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-px ${weaponMode === 'armed' ? 'bg-red-500' : 'bg-[#00ffff]'}`} />
          <div className={`absolute inset-4 border ${weaponMode === 'armed' ? 'border-red-500/40' : 'border-[#00ffff]/20'} rounded-full`} />
          <div className={`absolute inset-0 border ${weaponMode === 'armed' ? 'border-red-500/20' : 'border-[#00ffff]/10'} rounded-full animate-ping`} style={{ animationDuration: '3s' }} />
        </div>

        {/* Charge Meter */}
        {isCharging && (
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-32 space-y-1">
            <div className="flex justify-between text-[7px] font-bold text-red-400 tracking-widest">
              <span>CHARGING</span>
              <span>{Math.round(chargeProgress * 100)}%</span>
            </div>
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden border border-red-500/20">
              <motion.div 
                className="h-full bg-red-500 shadow-[0_0_10px_#ef4444]"
                initial={{ width: 0 }}
                animate={{ width: `${chargeProgress * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Fire Prompt */}
        {weaponMode === 'armed' && target && distance < 300 && !isCharging && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold text-red-500 animate-pulse tracking-[0.2em]">
            HOLD [SPACE] TO FIRE {WEAPONS.find(w => w.id === currentWeaponId)?.name.toUpperCase()}
          </div>
        )}
      </div>

      {/* --- ANALYSIS PANEL --- */}
      <AnimatePresence>
        {showAnalysisPanel && <AnalysisPanel />}
      </AnimatePresence>

      {/* --- SETTINGS OVERLAY --- */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-[60] pointer-events-auto"
          >
            <div className="w-full max-w-md p-8 bg-black/90 border border-[#00ffff]/30 shadow-[0_0_50px_rgba(0,255,255,0.1)]">
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3 text-[#00ffff]">
                  <Settings size={20} />
                  <h2 className="text-xl font-light tracking-[0.3em] uppercase">System Config</h2>
                </div>
                <button onClick={() => setShowSettings(false)} className="text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-4 custom-scrollbar">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] opacity-50 uppercase tracking-widest">
                    <Monitor size={14} /> Graphics Quality
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as GraphicsQuality[]).map(q => (
                      <button
                        key={q}
                        onClick={() => setGraphicsQuality(q)}
                        className={`py-3 text-[9px] font-bold border transition-all tracking-widest ${
                          graphicsQuality === q 
                          ? 'bg-[#00ffff]/20 border-[#00ffff] text-[#00ffff]' 
                          : 'border-white/10 text-white/40 hover:border-white/30'
                        }`}
                      >
                        {q.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] opacity-50 uppercase tracking-widest">
                    <div className="flex items-center gap-2"><Zap size={14} /> Effect Intensity</div>
                    <span>{Math.round(effectIntensity * 100)}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.1" 
                    value={effectIntensity}
                    onChange={(e) => setEffectIntensity(parseFloat(e.target.value))}
                    className="w-full accent-[#00ffff] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] opacity-50 uppercase tracking-widest">
                    <div className="flex items-center gap-2"><Sliders size={14} /> Control Smoothing</div>
                    <span>{Math.round(controlSmoothing * 100)}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.05" 
                    value={controlSmoothing}
                    onChange={(e) => setControlSmoothing(parseFloat(e.target.value))}
                    className="w-full accent-[#00ffff] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] opacity-50 uppercase tracking-widest">
                    <div className="flex items-center gap-2"><Camera size={14} /> Camera Sensitivity</div>
                    <span>{Math.round(cameraSensitivity * 100)}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.1" 
                    value={cameraSensitivity}
                    onChange={(e) => setCameraSensitivity(parseFloat(e.target.value))}
                    className="w-full accent-[#00ffff] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] opacity-50 uppercase tracking-widest">
                    <div className="flex items-center gap-2"><Monitor size={14} /> Zoom Sensitivity</div>
                    <span>{Math.round(zoomSensitivity * 100)}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.1" 
                    value={zoomSensitivity}
                    onChange={(e) => setZoomSensitivity(parseFloat(e.target.value))}
                    className="w-full accent-[#00ffff] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] opacity-50 uppercase tracking-widest">
                    <div className="flex items-center gap-2"><Atom size={14} /> Debris Intensity</div>
                    <span>{Math.round(debrisIntensity * 100)}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.1" 
                    value={debrisIntensity}
                    onChange={(e) => setDebrisIntensity(parseFloat(e.target.value))}
                    className="w-full accent-[#00ffff] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] opacity-50 uppercase tracking-widest">
                    <div className="flex items-center gap-2"><Crosshair size={14} /> Weapon Effects</div>
                    <span>{Math.round(weaponEffectIntensity * 100)}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.1" 
                    value={weaponEffectIntensity}
                    onChange={(e) => setWeaponEffectIntensity(parseFloat(e.target.value))}
                    className="w-full accent-[#00ffff] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

                <div className="pt-4">
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="w-full py-4 bg-[#00ffff] text-black font-bold uppercase tracking-[0.4em] text-[10px] hover:bg-white transition-colors"
                  >
                    Apply Changes
                  </button>
                </div>
              </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- CODEX OVERLAY --- */}
      <AnimatePresence>
        {showCodex && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-2xl z-[60] pointer-events-auto p-12"
          >
            <div className="w-full max-w-6xl h-full flex flex-col">
              <div className="flex justify-between items-end border-b border-[#00ffff]/20 pb-12 mb-12">
                <div>
                  <div className="text-[#00ffff] text-[10px] font-bold tracking-[0.5em] uppercase mb-4">Deep Space Archive</div>
                  <h2 className="text-6xl font-black tracking-[0.1em] uppercase">Discovery<span className="text-[#00ffff]">Log</span></h2>
                </div>
                <button 
                  onClick={() => setShowCodex(false)}
                  className="px-12 py-4 border border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff] hover:text-black transition-all uppercase tracking-[0.3em] font-bold text-[10px]"
                >
                  Return to Flight
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {PLANETS.map(planet => {
                    const isScanned = scannedPlanetIds.includes(planet.id);
                    return (
                      <motion.div 
                        key={planet.id} 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className={`group relative p-8 border transition-all duration-500 ${
                          isScanned 
                          ? 'border-[#00ffff]/30 bg-[#00ffff]/5 hover:bg-[#00ffff]/10' 
                          : 'border-white/5 bg-white/2 opacity-30'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-8">
                          <div className="text-3xl font-light tracking-wider uppercase">{planet.name}</div>
                          {isScanned ? (
                            <div className="p-2 bg-green-500/20 text-green-400 rounded border border-green-500/30">
                              <Shield size={16} />
                            </div>
                          ) : (
                            <div className="p-2 bg-white/5 text-white/20 rounded border border-white/10">
                              <Info size={16} />
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-6">
                          <div className="text-[11px] leading-relaxed opacity-60 min-h-[80px]">
                            {isScanned ? planet.description : 'ENCRYPTED DATA. PROXIMITY SCAN REQUIRED FOR ACCESS.'}
                          </div>
                          
                          {isScanned && (
                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                              <div className="space-y-1">
                                <div className="text-[8px] opacity-40 uppercase tracking-widest">Distance</div>
                                <div className="text-[10px] font-bold text-[#00ffff]">{Math.round(planet.distance)} AU</div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-[8px] opacity-40 uppercase tracking-widest">Moons</div>
                                <div className="text-[10px] font-bold text-[#00ffff]">{planet.moons?.length || 0}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- FLIGHT CONTROLS HELP --- */}
      <div className="absolute bottom-24 right-8 text-right opacity-20 text-[8px] uppercase tracking-[0.3em] space-y-2">
        <div className="flex items-center justify-end gap-3">
          <span>Flight Controls</span>
          <div className="h-px w-12 bg-white/20" />
        </div>
        <div>W/S: PITCH | A/D: YAW | Q/E: ROLL</div>
        <div>SPACE: THRUST | C: REVERSE | SHIFT: BOOST</div>
        <div>ARROWS: STRAFE | MOUSE: ORBIT CAMERA</div>
      </div>
    </div>
  );
};
