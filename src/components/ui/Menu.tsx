import { useGameStore, GraphicsQuality } from '../../store/useGameStore';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Settings, Info, ChevronRight, Radar, Zap, Shield, Monitor, X } from 'lucide-react';
import { useState } from 'react';

export const Menu = () => {
  const { status, setStatus, graphicsQuality, setGraphicsQuality } = useGameStore();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <AnimatePresence>
      {status === 'menu' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-[#010103] z-50 font-mono overflow-hidden"
        >
          {/* Background Ambience */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#00ffff]/5 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full animate-pulse" />
          </div>

          <div className="relative w-full max-w-6xl px-12 flex flex-col items-center">
            {/* Logo / Title Section */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
              className="text-center space-y-6 mb-20"
            >
              <div className="flex items-center justify-center gap-6 text-[#00ffff] opacity-30">
                <div className="h-px w-16 bg-current" />
                <span className="text-[10px] uppercase tracking-[0.6em]">Deep Space Initiative</span>
                <div className="h-px w-16 bg-current" />
              </div>
              
              <h1 className="text-8xl md:text-9xl font-black tracking-[0.2em] uppercase text-white leading-none">
                Cosmos<span className="text-[#00ffff]">Pilot</span>
              </h1>
              
              <p className="text-white/40 text-sm tracking-[0.4em] uppercase">
                Advanced Planetary Exploration Simulator v5.0
              </p>
            </motion.div>

            {/* Main Actions */}
            <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
              <motion.button
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                onClick={() => setStatus('loading')}
                className="group relative flex items-center justify-between p-6 bg-[#00ffff] text-black overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,255,255,0.2)]"
              >
                <div className="relative z-10 flex items-center gap-4 font-bold tracking-[0.3em] uppercase">
                  <Play size={20} fill="currentColor" />
                  Begin Mission
                </div>
                <ChevronRight className="relative z-10 group-hover:translate-x-2 transition-transform" />
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </motion.button>

              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => setShowSettings(true)}
                  className="flex items-center justify-center gap-3 p-4 border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all hover:bg-white/5 uppercase tracking-widest text-[10px]"
                >
                  <Settings size={14} />
                  Settings
                </motion.button>

                <motion.button
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-center gap-3 p-4 border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all hover:bg-white/5 uppercase tracking-widest text-[10px]"
                >
                  <Info size={14} />
                  Manual
                </motion.button>
              </div>
            </div>

            {/* Settings Overlay */}
            <AnimatePresence>
              {showSettings && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-xl z-50 p-12"
                >
                  <div className="w-full max-w-md space-y-12">
                    <div className="flex justify-between items-center border-b border-white/10 pb-8">
                      <h2 className="text-3xl font-light tracking-[0.2em] uppercase">System Config</h2>
                      <button onClick={() => setShowSettings(false)} className="text-white/40 hover:text-white">
                        <X size={24} />
                      </button>
                    </div>

                    <div className="space-y-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-[#00ffff] text-[10px] font-bold tracking-widest uppercase">
                          <Monitor size={16} /> Graphics Quality
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          {(['low', 'medium', 'high'] as GraphicsQuality[]).map(q => (
                            <button
                              key={q}
                              onClick={() => setGraphicsQuality(q)}
                              className={`py-4 text-[10px] border transition-all tracking-widest ${
                                graphicsQuality === q 
                                ? 'bg-[#00ffff]/20 border-[#00ffff] text-[#00ffff]' 
                                : 'border-white/10 text-white/40 hover:border-white/30 hover:bg-white/5'
                              }`}
                            >
                              {q.toUpperCase()}
                            </button>
                          ))}
                        </div>
                        <p className="text-[9px] text-white/20 leading-relaxed">
                          Higher quality enables advanced post-processing effects like Bloom, Chromatic Aberration, and higher star density.
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => setShowSettings(false)}
                      className="w-full py-4 bg-white/5 border border-white/10 hover:border-[#00ffff] hover:text-[#00ffff] transition-all uppercase tracking-[0.3em] text-[10px]"
                    >
                      Save Configuration
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* System Diagnostics */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-20 grid grid-cols-3 gap-12 w-full max-w-4xl border-t border-white/5 pt-12"
            >
              <div className="space-y-3 opacity-30">
                <div className="flex items-center gap-2 text-[#00ffff] text-[10px] font-bold tracking-widest">
                  <Radar size={12} /> SENSORS
                </div>
                <div className="text-[9px] leading-relaxed">Long-range planetary scanners calibrated. Proximity detection active.</div>
              </div>
              <div className="space-y-3 opacity-30">
                <div className="flex items-center gap-2 text-[#00ffff] text-[10px] font-bold tracking-widest">
                  <Zap size={12} /> PROPULSION
                </div>
                <div className="text-[9px] leading-relaxed">Ion engines at 100% capacity. Boost capacitors charged and ready.</div>
              </div>
              <div className="space-y-3 opacity-30">
                <div className="flex items-center gap-2 text-[#00ffff] text-[10px] font-bold tracking-widest">
                  <Shield size={12} /> HULL
                </div>
                <div className="text-[9px] leading-relaxed">Titanium-alloy structure integrity verified. Radiation shielding nominal.</div>
              </div>
            </motion.div>

            {/* Footer Info */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute bottom-0 left-0 right-0 p-12 flex justify-between items-end text-[8px] uppercase tracking-[0.4em] text-white/10"
            >
              <div className="space-y-2">
                <div>Neural Link: <span className="text-green-500/30">STABLE</span></div>
                <div>Hardware: <span className="text-[#00ffff]/30">NOMINAL</span></div>
                <div>Location: <span className="text-white/20">SOLAR SYSTEM SECTOR 0-1</span></div>
              </div>
              
              <div className="text-right space-y-2">
                <div>Authorized Personnel Only</div>
                <div>© 2026 Deep Space Initiative</div>
              </div>
            </motion.div>
          </div>

          {/* Scanning Lines Effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
            <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
