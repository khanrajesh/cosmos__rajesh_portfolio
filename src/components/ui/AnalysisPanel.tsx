import { useGameStore } from '../../store/useGameStore';
import { PLANETS } from '../../constants/gameData';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  AlertTriangle, 
  Info, 
  TrendingDown, 
  Zap, 
  Eye, 
  EyeOff,
  ChevronRight,
  X
} from 'lucide-react';

export const AnalysisPanel = () => {
  const { 
    showAnalysisPanel, 
    setShowAnalysisPanel, 
    planetStates, 
    isInspectionMode, 
    setIsInspectionMode,
    scannedPlanetIds
  } = useGameStore();

  if (!showAnalysisPanel) return null;

  const destroyedPlanets = Object.entries(planetStates).filter(([_, s]) => s.isDestroyed);
  const criticalPlanets = Object.entries(planetStates).filter(([_, s]) => s.damage > 0.5 && !s.isDestroyed);

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="fixed top-24 right-8 w-80 bg-black/80 border border-[#00ffff]/30 backdrop-blur-xl rounded-lg overflow-hidden flex flex-col pointer-events-auto shadow-[0_0_40px_rgba(0,255,255,0.1)] z-50"
    >
      {/* Header */}
      <div className="p-4 bg-[#00ffff]/10 border-b border-[#00ffff]/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-[#00ffff]" />
          <span className="font-bold tracking-widest text-[10px] text-[#00ffff]">SYSTEM ANALYSIS</span>
        </div>
        <button 
          onClick={() => setShowAnalysisPanel(false)}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <X size={14} className="text-white/60" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
        {/* Inspection Mode Toggle */}
        <div className="p-3 bg-white/5 border border-white/10 rounded flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold tracking-wider">INSPECTION MODE</span>
            <span className="text-[7px] opacity-50 uppercase">Visualize Trajectories</span>
          </div>
          <button
            onClick={() => setIsInspectionMode(!isInspectionMode)}
            className={`p-2 rounded transition-all ${
              isInspectionMode 
              ? 'bg-[#00ffff] text-black shadow-[0_0_10px_#00ffff]' 
              : 'bg-white/10 text-white/40 hover:bg-white/20'
            }`}
          >
            {isInspectionMode ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        </div>

        {/* Instability Summary */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 opacity-40">
            <AlertTriangle size={12} />
            <span className="text-[8px] font-bold tracking-[0.2em]">INSTABILITY EVENTS</span>
          </div>
          
          {destroyedPlanets.length === 0 && criticalPlanets.length === 0 && (
            <div className="p-4 border border-dashed border-white/10 rounded text-center">
              <span className="text-[9px] opacity-30 italic">SYSTEM STABLE</span>
            </div>
          )}

          {destroyedPlanets.map(([id, state]) => {
            const planet = PLANETS.find(p => p.id === id);
            return (
              <div key={id} className="p-3 bg-red-500/10 border border-red-500/30 rounded space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-red-400 uppercase">{planet?.name}</span>
                  <span className="px-1.5 py-0.5 bg-red-500 text-white text-[7px] font-bold rounded">COLLAPSED</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-[7px] opacity-50">MASS LOSS</span>
                    <span className="text-[9px] font-bold text-red-300">-90%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7px] opacity-50">GRAVITY</span>
                    <span className="text-[9px] font-bold text-red-300">UNSTABLE</span>
                  </div>
                </div>
                {planet?.moons && planet.moons.length > 0 && (
                  <div className="pt-2 border-t border-red-500/20">
                    <span className="text-[7px] opacity-50 block mb-1">AFFECTED SATELLITES</span>
                    <div className="flex flex-wrap gap-1">
                      {planet.moons.map(m => (
                        <span key={m.id} className="px-1 py-0.5 bg-red-500/20 text-red-400 text-[7px] border border-red-500/30 rounded">
                          {m.name} [ESCAPING]
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {criticalPlanets.map(([id, state]) => {
            const planet = PLANETS.find(p => p.id === id);
            return (
              <div key={id} className="p-3 bg-orange-500/10 border border-orange-500/30 rounded space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-orange-400 uppercase">{planet?.name}</span>
                  <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[7px] font-bold rounded">CRITICAL</span>
                </div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-orange-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${state.damage * 100}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 text-[8px] text-orange-300/70">
                  <TrendingDown size={10} />
                  <span>CORE DESTABILIZATION DETECTED</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* System Overview */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 opacity-40">
            <Info size={12} />
            <span className="text-[8px] font-bold tracking-[0.2em]">SYSTEM OVERVIEW</span>
          </div>
          
          <div className="space-y-2">
            {PLANETS.map(p => {
              const state = planetStates[p.id] || { health: 100, isDestroyed: false, damage: 0 };
              const isScanned = scannedPlanetIds.includes(p.id);
              
              return (
                <div key={p.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded transition-colors group">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: p.color, boxShadow: `0 0 10px ${p.color}` }} 
                    />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold tracking-wider uppercase">{p.name}</span>
                      <span className="text-[7px] opacity-40 uppercase">{isScanned ? 'Data Secured' : 'Unscanned'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-[9px] font-bold ${state.isDestroyed ? 'text-red-500' : 'text-[#00ffff]'}`}>
                      {state.isDestroyed ? '0%' : `${Math.round(state.health)}%`}
                    </div>
                    <div className="text-[7px] opacity-40 uppercase">Health</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 bg-black border-t border-white/5 text-center">
        <span className="text-[7px] opacity-30 tracking-[0.4em] uppercase">Cosmos Pilot Analysis Tool v1.0</span>
      </div>
    </motion.div>
  );
};
