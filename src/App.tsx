import { lazy, useEffect, Suspense, useState } from 'react';
import { PortfolioLanding } from './components/ui/PortfolioLanding';
import { useGameStore } from './store/useGameStore';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Home, Loader2, Shield, Zap, Radar, User, FileText, ArrowLeft } from 'lucide-react';

const GameExperience = lazy(() => import('./components/game/GameExperience'));

const LoadingScreen = () => {
  const { setStatus } = useGameStore();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setStatus('playing'), 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [setStatus]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-[#010103] flex flex-col items-center justify-center font-mono"
    >
      <div className="w-full max-w-2xl px-12 space-y-12">
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-4 text-[#00ffff] opacity-40">
            <div className="h-px w-12 bg-current" />
            <span className="text-[10px] uppercase tracking-[0.5em]">System Initialization</span>
            <div className="h-px w-12 bg-current" />
          </div>
          <h2 className="text-4xl font-black tracking-[0.2em] uppercase text-white">
            Pre-Flight <span className="text-[#00ffff]">Check</span>
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className={`space-y-3 transition-opacity duration-500 ${progress > 20 ? 'opacity-100' : 'opacity-20'}`}>
            <div className="flex items-center gap-2 text-[#00ffff] text-[10px] font-bold tracking-widest">
              <Radar size={12} /> SENSORS
            </div>
            <div className="h-1 bg-white/10 overflow-hidden">
              <motion.div className="h-full bg-[#00ffff]" initial={{ width: 0 }} animate={{ width: progress > 20 ? '100%' : '0%' }} transition={{ duration: 0.5 }} />
            </div>
          </div>
          <div className={`space-y-3 transition-opacity duration-500 ${progress > 50 ? 'opacity-100' : 'opacity-20'}`}>
            <div className="flex items-center gap-2 text-[#00ffff] text-[10px] font-bold tracking-widest">
              <Zap size={12} /> ENGINES
            </div>
            <div className="h-1 bg-white/10 overflow-hidden">
              <motion.div className="h-full bg-[#00ffff]" initial={{ width: 0 }} animate={{ width: progress > 50 ? '100%' : '0%' }} transition={{ duration: 0.5 }} />
            </div>
          </div>
          <div className={`space-y-3 transition-opacity duration-500 ${progress > 80 ? 'opacity-100' : 'opacity-20'}`}>
            <div className="flex items-center gap-2 text-[#00ffff] text-[10px] font-bold tracking-widest">
              <Shield size={12} /> SHIELDS
            </div>
            <div className="h-1 bg-white/10 overflow-hidden">
              <motion.div className="h-full bg-[#00ffff]" initial={{ width: 0 }} animate={{ width: progress > 80 ? '100%' : '0%' }} transition={{ duration: 0.5 }} />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold tracking-widest text-[#00ffff]">
            <span className="animate-pulse">UPLOADING NEURAL LINK...</span>
            <span>{Math.floor(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
            <motion.div 
              className="h-full bg-[#00ffff] shadow-[0_0_20px_rgba(0,255,255,0.5)]"
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="text-center">
          <Loader2 className="animate-spin text-[#00ffff]/40 mx-auto" size={24} />
        </div>
      </div>

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      </div>
    </motion.div>
  );
};

const PauseOverlay = () => {
  const { isPaused, setPaused, setStatus } = useGameStore();

  if (!isPaused) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md pointer-events-auto"
    >
      <div className="w-full max-w-md p-12 bg-black/80 border border-[#00ffff]/20 space-y-8 text-center shadow-[0_0_50px_rgba(0,255,255,0.1)]">
        <h2 className="text-3xl font-light tracking-[0.3em] uppercase text-[#00ffff]">System Paused</h2>
        
        <div className="space-y-4">
          <button 
            onClick={() => setPaused(false)}
            className="w-full py-4 bg-[#00ffff] text-black font-bold uppercase tracking-widest hover:bg-white transition-colors"
          >
            Resume Mission
          </button>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => {
                setPaused(false);
                window.location.reload();
              }}
              className="py-4 border border-white/20 text-white uppercase tracking-widest text-[10px] hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw size={12} /> Restart
            </button>

            <button 
              onClick={() => {
                setPaused(false);
                setStatus('menu');
              }}
              className="py-4 border border-white/20 text-white uppercase tracking-widest text-[10px] hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <Home size={12} /> Hangar
            </button>
          </div>

          <div className="h-px bg-white/10 my-4" />

          <button 
            onClick={() => {
              setPaused(false);
              setStatus('portfolio');
            }}
            className="w-full py-4 border border-[#00ffff]/40 text-[#00ffff] uppercase tracking-widest text-xs hover:bg-[#00ffff]/10 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} /> Back to Portfolio
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => {
                setPaused(false);
                setStatus('portfolio');
                setTimeout(() => {
                  const el = document.getElementById('home');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="py-3 border border-white/10 text-white/60 uppercase tracking-widest text-[9px] hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
            >
              <User size={12} /> About Rajesh
            </button>
            <button 
              onClick={() => window.open('#', '_blank')}
              className="py-3 border border-white/10 text-white/60 uppercase tracking-widest text-[9px] hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
            >
              <FileText size={12} /> Resume
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5">
          <div className="text-[10px] opacity-40 uppercase tracking-widest mb-4">Settings</div>
          <div className="flex justify-center gap-8 text-[10px] opacity-60">
            <div className="flex items-center gap-2">
              <span>AUDIO</span>
              <span className="text-[#00ffff]">ON</span>
            </div>
            <div className="flex items-center gap-2">
              <span>GRAPHICS</span>
              <span className="text-[#00ffff]">ULTRA</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const { status, updateSimulationTime, isPaused, setPaused } = useGameStore();

  // Global simulation loop
  useEffect(() => {
    let lastTime = performance.now();
    const loop = (now: number) => {
      const delta = (now - lastTime) / 1000;
      if (!isPaused && status === 'playing') {
        updateSimulationTime(delta);
      }
      lastTime = now;
      requestAnimationFrame(loop);
    };
    const frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [updateSimulationTime, isPaused, status]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && status === 'playing') {
        setPaused(!isPaused);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, status, setPaused]);

  return (
    <div className={`w-full ${status === 'portfolio' ? 'relative' : 'h-screen overflow-hidden'} bg-[#020205] custom-scrollbar`}>
      <AnimatePresence mode="wait">
        {status === 'portfolio' ? (
          <motion.div
            key="portfolio"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
            className="w-full min-h-screen"
          >
            <PortfolioLanding />
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-full h-full relative"
          >
            <Suspense fallback={null}>
              <GameExperience />
            </Suspense>
            
            <AnimatePresence>
              {status === 'loading' && <LoadingScreen />}
              {isPaused && <PauseOverlay />}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
