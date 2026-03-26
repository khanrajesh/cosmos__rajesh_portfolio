import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform, useMotionValueEvent } from 'motion/react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { 
  ChevronRight, Download, Rocket, Code, Briefcase, 
  History, Heart, Mail, Github, Linkedin, ExternalLink,
  Cpu, Database, Globe, Smartphone, Brain, Layers,
  Apple, Server, GraduationCap, Phone, Send, CheckCircle2,
  Terminal, Monitor, Sparkles, Zap, Shield, MousePointer2,
  Menu as MenuIcon, X
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { PORTFOLIO_DATA } from '../../constants/portfolioData';
import { PortfolioBackgroundShip } from '../game/PortfolioBackgroundShip';

const IconMap: Record<string, React.ReactNode> = {
  smartphone: <Smartphone size={20} />,
  apple: <Apple size={20} />,
  globe: <Globe size={20} />,
  server: <Server size={20} />,
  brain: <Brain size={20} />,
  database: <Database size={20} />,
};

const TechStack = [
  "Kotlin", "Java", "Compose UI", "React Native", "Swift", "React.js", "Ktor", "Django", "Firebase", "SQL", "Python", "AI/ML"
];

export const PortfolioLanding = () => {
  const { setStatus } = useGameStore();
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mouse = useRef(new THREE.Vector2(0, 0));
  const scrollRef = useRef(0);
  const { scrollY } = useScroll();
  const { scrollYProgress } = useScroll();
  const smoothScroll = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Header visibility logic
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    const diff = latest - previous;
    
    // Hide header when scrolling down, show when scrolling up
    // But always show at the very top
    if (latest < 50) {
      setHeaderVisible(true);
    } else if (diff > 5) { // Scrolling down
      setHeaderVisible(false);
    } else if (diff < -5) { // Scrolling up
      setHeaderVisible(true);
    }
    
    setScrolled(latest > 50);
    
    // Update active section
    const sections = PORTFOLIO_DATA.navItems.map(item => item.id);
    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 200 && rect.bottom >= 200) {
          setActiveSection(section);
        }
      }
    }
    
    scrollRef.current = latest / (document.documentElement.scrollHeight - window.innerHeight);
  });

  // Mouse tracking for parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setMobileMenuOpen(false);
    }
  };

  const handleStartGame = () => {
    setStatus('loading');
  };

  return (
    <div className="relative min-h-screen bg-[#020205] text-white font-sans selection:bg-[#00ffff] selection:text-black overflow-x-hidden">
      {/* --- BACKGROUND SHIP LAYER --- */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
        <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, 10]} intensity={2} color="#00ffff" />
          <PortfolioBackgroundShip mouse={mouse} scroll={scrollRef} />
        </Canvas>
      </div>

      {/* --- BACKGROUND EFFECTS --- */}
      <div className="fixed inset-0 pointer-events-none z-[1]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.03)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(0,255,255,0.01),rgba(0,0,0,0),rgba(0,255,255,0.01))] bg-[length:100%_4px,4px_100%]" />
        
        {/* Animated accent glow */}
        <motion.div 
          animate={{ 
            opacity: [0.1, 0.2, 0.1],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-1/4 w-[50%] h-[50%] bg-[#00ffff]/5 blur-[120px] rounded-full"
        />
      </div>

      {/* --- NAVIGATION --- */}
      <motion.nav 
        initial={{ y: 0 }}
        animate={{ y: headerVisible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-[#00ffff]/20 py-4' : 'bg-transparent py-8'}`}
      >
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => scrollTo('home')}
          >
            <div className="w-10 h-10 bg-[#00ffff] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(0,255,255,0.3)] group-hover:scale-110 transition-transform">
              <Rocket className="text-black" size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter uppercase italic leading-none">{PORTFOLIO_DATA.name}</span>
              <span className="text-[8px] font-bold tracking-[0.4em] uppercase text-[#00ffff] opacity-70">Cosmos Pilot</span>
            </div>
          </motion.div>

          <div className="hidden lg:flex items-center gap-8">
            {PORTFOLIO_DATA.navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`text-[10px] font-bold tracking-[0.3em] uppercase transition-all hover:text-[#00ffff] relative group ${activeSection === item.id ? 'text-[#00ffff]' : 'text-white/50'}`}
              >
                {item.label}
                <div className={`absolute -bottom-2 left-0 h-0.5 bg-[#00ffff] transition-all duration-300 ${activeSection === item.id ? 'w-full' : 'w-0 group-hover:w-1/2'}`} />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleStartGame}
              className="hidden md:block px-6 py-2 bg-[#00ffff] text-black text-[10px] font-black uppercase tracking-widest rounded hover:bg-white transition-all shadow-[0_0_20px_rgba(0,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] active:scale-95"
            >
              {PORTFOLIO_DATA.ctas.start}
            </motion.button>

            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-2 text-white/70 hover:text-[#00ffff] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-black/95 backdrop-blur-2xl border-b border-[#00ffff]/10 overflow-hidden"
            >
              <div className="px-8 py-12 flex flex-col gap-6">
                {PORTFOLIO_DATA.navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className={`text-lg font-black tracking-[0.2em] uppercase text-left transition-all ${activeSection === item.id ? 'text-[#00ffff] translate-x-4' : 'text-white/40'}`}
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={handleStartGame}
                  className="mt-4 px-8 py-4 bg-[#00ffff] text-black font-black uppercase tracking-widest text-xs rounded text-center"
                >
                  {PORTFOLIO_DATA.ctas.start}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* --- HERO SECTION --- */}
      <section id="home" className="relative min-h-screen flex items-center pt-20 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-2 bg-[#00ffff]/10 border border-[#00ffff]/20 rounded-full text-[#00ffff] text-[10px] font-black tracking-widest uppercase"
            >
              <Zap size={12} className="animate-pulse" />
              {PORTFOLIO_DATA.hero.welcome}
            </motion.div>

            <div className="space-y-4">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-7xl lg:text-9xl font-black tracking-tighter leading-[0.85] uppercase italic"
              >
                {PORTFOLIO_DATA.hero.greeting.split(' ').map((word, i) => (
                  <span key={i} className={word === 'Rajesh' || word === 'Khan' ? 'text-[#00ffff] block' : ''}>
                    {word}{' '}
                  </span>
                ))}
              </motion.h1>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4"
              >
                <div className="h-px w-12 bg-[#00ffff]" />
                <p className="text-xl lg:text-3xl text-white/60 font-medium tracking-tight">
                  {PORTFOLIO_DATA.hero.role}
                </p>
              </motion.div>
            </div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-xl text-lg text-white/70 leading-relaxed font-medium"
            >
              {PORTFOLIO_DATA.summary}
            </motion.p>

            {/* Tech Stack Strip */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-x-6 gap-y-3 py-6 border-t border-white/5"
            >
              {TechStack.map((tech, i) => (
                <span key={tech} className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-[#00ffff] transition-colors cursor-default">
                  {tech}
                </span>
              ))}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <button className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded flex items-center gap-3 hover:bg-[#00ffff] transition-all group shadow-xl">
                <Download size={18} />
                {PORTFOLIO_DATA.ctas.resume}
              </button>
              <button 
                onClick={handleStartGame}
                className="px-8 py-4 bg-transparent border border-white/20 font-black uppercase tracking-widest text-xs rounded flex items-center gap-3 hover:border-[#00ffff] hover:text-[#00ffff] transition-all group"
              >
                <Rocket size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                {PORTFOLIO_DATA.ctas.start}
              </button>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
            className="relative lg:ml-auto"
          >
            <div className="relative w-[300px] h-[400px] md:w-[400px] md:h-[500px] group">
              {/* Decorative frames */}
              <div className="absolute -inset-4 border border-[#00ffff]/20 rounded-2xl -rotate-3 group-hover:rotate-0 transition-transform duration-700" />
              <div className="absolute -inset-4 border border-white/10 rounded-2xl rotate-3 group-hover:rotate-0 transition-transform duration-700 delay-100" />
              
              {/* Main Image Block */}
              <div className="relative w-full h-full bg-[#111] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <img 
                  src="https://picsum.photos/seed/rajesh/800/1000" 
                  alt="Rajesh Khan"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* Floating Info */}
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-[#00ffff]">Experience</div>
                      <div className="text-xl font-black italic">4+ YEARS</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Location</div>
                      <div className="text-sm font-bold">UST, India</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Tech Badges */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-8 -right-8 p-4 bg-black border border-[#00ffff]/30 rounded-2xl backdrop-blur-xl shadow-2xl"
              >
                <Cpu className="text-[#00ffff]" size={32} />
              </motion.div>
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-8 -left-8 p-4 bg-black border border-[#00ffff]/30 rounded-2xl backdrop-blur-xl shadow-2xl"
              >
                <Brain className="text-[#00ffff]" size={32} />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- FEATURED PROJECT: JEWEL VAULT --- */}
      <section className="py-32 px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-[40px] p-8 md:p-16 overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
              <Shield size={200} className="text-[#00ffff]" />
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[10px] font-black uppercase tracking-widest">
                  <Sparkles size={12} />
                  Featured Project
                </div>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
                  Jewel <span className="text-[#00ffff]">Vault</span>
                </h2>
                <p className="text-xl text-white/60 leading-relaxed">
                  A high-security inventory management ecosystem for the jewelry industry. Built with Kotlin and Jetpack Compose, focusing on real-time tracking, valuation analytics, and seamless customer workflows.
                </p>
                <div className="flex flex-wrap gap-3">
                  {["Kotlin", "Compose", "REST API", "Firebase", "Clean Architecture"].map(tag => (
                    <span key={tag} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-4 pt-4">
                  <button className="px-8 py-4 bg-[#00ffff] text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white transition-all">
                    View Case Study
                  </button>
                  <button className="p-4 bg-white/5 border border-white/10 rounded-xl hover:text-[#00ffff] transition-all">
                    <Github size={20} />
                  </button>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-700">
                  <img 
                    src="https://picsum.photos/seed/jewel/1200/800" 
                    alt="Jewel Vault"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {/* Decorative UI elements */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#00ffff]/20 blur-3xl rounded-full" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- SKILLS SECTION --- */}
      <section id="skills" className="py-32 px-8 relative">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">Technical <span className="text-[#00ffff]">Arsenal</span></h2>
              <p className="text-white/40 max-w-xl text-lg">Mastering the tools that power the next generation of mobile and cloud experiences.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PORTFOLIO_DATA.skills.map((skill, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-10 bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl hover:border-[#00ffff]/50 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  {IconMap[skill.icon]}
                </div>
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#00ffff]/10 group-hover:scale-110 transition-all">
                  <span className="text-[#00ffff]">{IconMap[skill.icon]}</span>
                </div>
                <h3 className="text-2xl font-black tracking-tight mb-6 uppercase italic">{skill.category}</h3>
                <div className="flex flex-wrap gap-3">
                  {skill.items.map(item => (
                    <span key={item} className="px-4 py-2 bg-white/5 text-white/60 text-[10px] font-black rounded-xl uppercase tracking-widest border border-white/5 group-hover:border-white/20 transition-colors">
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PROJECTS SECTION --- */}
      <section id="projects" className="py-32 px-8">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">Other <span className="text-[#00ffff]">Missions</span></h2>
              <p className="text-white/40 max-w-xl text-lg">A selection of my recent work, ranging from complex Android libraries to AI-driven applications.</p>
            </div>
            <button className="text-[#00ffff] text-xs font-black tracking-[0.3em] uppercase flex items-center gap-3 hover:gap-6 transition-all group">
              Full Archive <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {PORTFOLIO_DATA.projects.filter(p => p.title !== 'Jewel Vault').map((project, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative flex flex-col bg-white/2 border border-white/10 rounded-[32px] overflow-hidden hover:border-[#00ffff]/30 transition-all hover:-translate-y-2"
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-6 right-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${project.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                      {project.status}
                    </span>
                  </div>
                </div>
                <div className="p-10 space-y-6 flex-grow flex flex-col relative">
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-black uppercase tracking-widest text-[#00ffff]/60">#{tag}</span>
                    ))}
                  </div>
                  <h3 className="text-3xl font-black tracking-tight uppercase italic">{project.title}</h3>
                  <p className="text-white/50 text-base leading-relaxed flex-grow">{project.description}</p>
                  <div className="flex gap-4 pt-8 border-t border-white/5">
                    <button className="flex-1 py-3 bg-white/5 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-[#00ffff] hover:text-black transition-all flex items-center justify-center gap-2">
                      <ExternalLink size={14} /> Demo
                    </button>
                    <button className="p-3 bg-white/5 text-white rounded-xl hover:bg-white hover:text-black transition-all">
                      <Github size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TIMELINE SECTION --- */}
      <section id="timeline" className="py-32 px-8 relative">
        <div className="max-w-5xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">Professional <span className="text-[#00ffff]">Log</span></h2>
          </div>

          <div className="relative">
            {/* Center line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#00ffff]/50 via-white/10 to-transparent transform -translate-x-1/2 hidden md:block" />

            <div className="space-y-20">
              {PORTFOLIO_DATA.experience.map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`relative flex flex-col md:flex-row gap-8 md:gap-0 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Dot */}
                  <div className="absolute left-0 md:left-1/2 top-0 w-4 h-4 bg-[#00ffff] rounded-full transform -translate-x-1/2 shadow-[0_0_15px_rgba(0,255,255,0.5)] z-10 hidden md:block" />
                  
                  <div className="md:w-1/2 px-8">
                    <div className={`space-y-4 p-8 bg-white/5 border border-white/10 rounded-[32px] hover:border-[#00ffff]/30 transition-all ${i % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                      <div className={`flex flex-col ${i % 2 === 0 ? 'md:items-start' : 'md:items-end'} gap-2`}>
                        <span className="px-4 py-1 bg-[#00ffff]/10 text-[#00ffff] text-[10px] font-black rounded-full uppercase tracking-widest border border-[#00ffff]/20">
                          {item.period}
                        </span>
                        <h3 className="text-3xl font-black tracking-tight uppercase italic">{item.role}</h3>
                        <p className="text-[#00ffff] font-black uppercase text-xs tracking-[0.2em]">{item.company}</p>
                      </div>
                      <p className="text-white/50 leading-relaxed text-sm">{item.description}</p>
                    </div>
                  </div>
                  <div className="md:w-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- EDUCATION & CONTRIBUTIONS --- */}
      <div className="grid lg:grid-cols-2 max-w-7xl mx-auto gap-8 px-8 py-32">
        <section id="education" className="space-y-12">
          <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Academic <span className="text-[#00ffff]">Base</span></h2>
          <div className="grid gap-6">
            {PORTFOLIO_DATA.education.map((edu, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-8 bg-white/2 border border-white/10 rounded-3xl flex items-center justify-between gap-6 hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-[#00ffff]/10 rounded-2xl flex items-center justify-center text-[#00ffff]">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase italic">{edu.school}</h3>
                    <p className="text-white/40 text-xs font-bold tracking-widest uppercase">{edu.degree}</p>
                  </div>
                </div>
                <span className="text-[10px] font-black tracking-widest text-[#00ffff] uppercase whitespace-nowrap">{edu.period}</span>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="contributions" className="space-y-12">
          <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Open <span className="text-[#00ffff]">Source</span></h2>
          <div className="grid gap-6">
            {PORTFOLIO_DATA.contributions.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-8 bg-white/2 border border-white/10 rounded-3xl space-y-4 hover:bg-white/5 transition-all group"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-black uppercase italic">{item.title}</h3>
                  <div className="flex gap-2">
                    {item.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-[#00ffff]/10 text-[#00ffff] text-[8px] font-black uppercase tracking-widest rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-white/50 text-sm leading-relaxed">{item.description}</p>
                <button className="text-[#00ffff] text-[10px] font-black tracking-widest uppercase flex items-center gap-2 hover:gap-4 transition-all">
                  View Repo <ChevronRight size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* --- FOOTER / CONNECT --- */}
      <footer id="connect" className="py-32 px-8 border-t border-white/5 relative overflow-hidden bg-black/40">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 relative z-10">
          <div className="space-y-16">
            <div className="space-y-6">
              <h2 className="text-7xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.85]">
                Let's <span className="text-[#00ffff]">Build</span> <br /> Something <br /> Great
              </h2>
              <p className="text-white/60 text-xl max-w-md leading-relaxed font-medium">
                I'm currently available for new projects and collaborations. Let's start a conversation about your next mission.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <a href={`mailto:${PORTFOLIO_DATA.contact.email}`} className="p-8 bg-white/5 border border-white/10 rounded-[32px] space-y-4 hover:border-[#00ffff]/50 transition-all group">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:bg-[#00ffff]/10 group-hover:text-[#00ffff] transition-all">
                  <Mail size={24} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Email Me</div>
                  <div className="text-lg font-black italic">{PORTFOLIO_DATA.contact.email}</div>
                </div>
              </a>
              <a href={`tel:${PORTFOLIO_DATA.contact.mobile}`} className="p-8 bg-white/5 border border-white/10 rounded-[32px] space-y-4 hover:border-[#00ffff]/50 transition-all group">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:bg-[#00ffff]/10 group-hover:text-[#00ffff] transition-all">
                  <Phone size={24} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Call Me</div>
                  <div className="text-lg font-black italic">{PORTFOLIO_DATA.contact.mobile}</div>
                </div>
              </a>
            </div>

            <div className="flex gap-4">
              {PORTFOLIO_DATA.contact.socials.map(social => (
                <a 
                  key={social.platform} 
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white/40 hover:bg-[#00ffff] hover:text-black transition-all hover:-translate-y-2"
                >
                  {social.platform === 'Github' ? <Github size={28} /> : <Linkedin size={28} />}
                </a>
              ))}
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-12 bg-gradient-to-br from-white/10 to-transparent rounded-[48px] border border-white/10 space-y-10 backdrop-blur-2xl shadow-2xl relative"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Send size={100} className="text-[#00ffff]" />
            </div>
            
            <div className="space-y-8 relative z-10">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">Full Name</label>
                  <input type="text" className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 focus:border-[#00ffff] outline-none transition-all text-sm font-bold" placeholder="John Doe" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">Email Address</label>
                  <input type="email" className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 focus:border-[#00ffff] outline-none transition-all text-sm font-bold" placeholder="john@example.com" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">Your Message</label>
                <textarea className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 h-48 focus:border-[#00ffff] outline-none transition-all text-sm font-bold resize-none" placeholder="Tell me about your project..." />
              </div>
              <button className="w-full py-6 bg-[#00ffff] text-black font-black rounded-2xl uppercase tracking-[0.3em] text-xs hover:bg-white transition-all flex items-center justify-center gap-4 group shadow-[0_0_40px_rgba(0,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] active:scale-95">
                Initiate Contact
                <Send size={18} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto mt-40 pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10 text-[10px] font-black tracking-[0.4em] uppercase text-white/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#00ffff]/10 rounded-lg flex items-center justify-center">
              <Rocket size={14} className="text-[#00ffff]" />
            </div>
            <span>© 2026 {PORTFOLIO_DATA.name}. Built for the Cosmos.</span>
          </div>
          <div className="flex gap-16">
            <a href="#" className="hover:text-[#00ffff] transition-colors">Privacy Protocol</a>
            <a href="#" className="hover:text-[#00ffff] transition-colors">Mission Terms</a>
          </div>
        </div>
      </footer>

      {/* --- SCROLL INDICATOR --- */}
      <motion.div 
        style={{ scaleX: smoothScroll }}
        className="fixed top-0 left-0 right-0 h-1 bg-[#00ffff] origin-left z-[60] shadow-[0_0_10px_rgba(0,255,255,0.5)]"
      />
    </div>
  );
};
