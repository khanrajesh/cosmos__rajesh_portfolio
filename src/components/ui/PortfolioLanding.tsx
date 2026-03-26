import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform, useMotionValueEvent } from 'motion/react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { 
  ChevronRight, Download, Rocket, Code, Briefcase, 
  History, Heart, Mail, Github, Linkedin, ExternalLink,
  Cpu, Database, Globe, Smartphone, Brain, Layers,
  Apple, Server, GraduationCap, Phone, Send, CheckCircle2,
  Terminal, Monitor, Sparkles, Zap, Shield, MousePointer2, Instagram, BookOpen,
  Menu as MenuIcon, X
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { PORTFOLIO_DATA } from '../../constants/portfolioData';
import { PortfolioBackgroundShip } from '../game/PortfolioBackgroundShip';
import { ShipModel } from '../game/ShipModel';
import gitlabIcon from '../../assets/img/gitlab.svg';
import mediumIcon from '../../assets/img/medium.svg';

const IconMap: Record<string, React.ReactNode> = {
  smartphone: <Smartphone size={20} />,
  apple: <Apple size={20} />,
  globe: <Globe size={20} />,
  server: <Server size={20} />,
  brain: <Brain size={20} />,
  database: <Database size={20} />,
};

const TechStack = [
  "Python", "AI/ML", "Generative AI", "LLM Workflows", "Prompt Engineering", "AWS", "Firebase", "Ktor", "Django", "OpenCV", "MediaPipe", "SQL"
];

const currentProjectTitles = ['Jewel Vault', 'Tool Detection & Monitoring Software', 'Vision Gesture Command System'];
const currentProjects = PORTFOLIO_DATA.projects.filter((project) => currentProjectTitles.includes(project.title));
const featuredProject = currentProjects.find((project) => project.title === 'Jewel Vault') ?? currentProjects[0] ?? PORTFOLIO_DATA.projects[0];

const getEmbeddedVideoUrl = (url?: string) => {
  if (!url) return '';

  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      const videoId = parsed.pathname.replace('/', '');
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
    }
    if (parsed.pathname.includes('/shorts/')) {
      const videoId = parsed.pathname.split('/shorts/')[1];
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
    }
    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
      }
    }
  } catch {
    return '';
  }

  return '';
};

const getSocialIcon = (platform: string) => {
  switch (platform) {
    case 'Github':
      return <Github size={28} />;
    case 'Linkedin':
      return <Linkedin size={28} />;
    case 'Instagram':
      return <Instagram size={28} />;
    case 'Gitlab':
      return <img src={gitlabIcon} alt="GitLab" className="h-7 w-7 invert" />;
    case 'Medium':
      return <img src={mediumIcon} alt="Medium" className="h-7 w-7 invert" />;
    default:
      return <ExternalLink size={28} />;
  }
};

const OrbitingShipButton = ({
  label,
  onClick,
  className,
  wrapperClassName,
}: {
  label: string;
  onClick: () => void;
  className: string;
  wrapperClassName?: string;
}) => {
  const rotationVelocity = useRef(new THREE.Vector2(0.06, -0.04));
  const strafeVelocity = useRef(new THREE.Vector2(0.04, 0.02));

  return (
    <div className={`relative inline-flex shrink-0 items-center pl-8 ${wrapperClassName ?? ''}`}>
      <motion.div
        className="pointer-events-none absolute left-0 top-1/2 z-20 -translate-y-1/2"
        animate={{ y: ['-50%', '-58%', '-50%'] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="relative h-11 w-11">
          <motion.div
            className="absolute left-6 top-1/2 h-1.5 w-8 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#ffd54a]/90 via-[#ffb800]/60 to-transparent blur-[3px]"
            animate={{ opacity: [0.45, 0.9, 0.45], scaleX: [0.9, 1.1, 0.9] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          />
          <Canvas camera={{ position: [0, 0, 12], fov: 28 }}>
            <ambientLight intensity={1.8} />
            <pointLight position={[8, 6, 10]} intensity={12} color="#00ffff" />
            <pointLight position={[-6, 0, -4]} intensity={8} color="#ffd54a" />
            <group rotation={[0.2, Math.PI * 1.08, 0]} scale={0.72}>
              <ShipModel
                thrustIntensity={0.55}
                boostIntensity={0.9}
                rotationVelocity={rotationVelocity.current}
                strafeVelocity={strafeVelocity.current}
                shipHealth={100}
              />
            </group>
          </Canvas>
        </div>
      </motion.div>

      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        className={className}
      >
        <Rocket size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        {label}
      </motion.button>
    </div>
  );
};

const ShipPreview = ({
  modelId,
  active,
  onClick,
}: {
  modelId: 'spacy' | 'scipio';
  active: boolean;
  onClick: () => void;
}) => {
  const rotationVelocity = useRef(new THREE.Vector2(0.03, -0.02));
  const strafeVelocity = useRef(new THREE.Vector2(0.02, 0.01));

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative h-20 w-full min-w-0 overflow-hidden bg-transparent transition-transform sm:w-[5.25rem]"
      title={`Use ${modelId} ship`}
    >
      <div className={`pointer-events-none absolute inset-x-2 inset-y-3 rounded-[16px] blur-lg transition-opacity ${active ? 'bg-[#ffd54a]/32 opacity-100' : 'bg-[#ffd54a]/14 opacity-70'}`} />
      <Canvas camera={{ position: [0, 0, 12], fov: 28 }}>
        <ambientLight intensity={1.6} />
        <pointLight position={[7, 6, 10]} intensity={10} color="#00ffff" />
        <pointLight position={[-6, 0, -4]} intensity={6} color="#ffd54a" />
        <group rotation={[0.18, Math.PI * 1.06, 0]} scale={0.7}>
          <ShipModel
            thrustIntensity={0.45}
            boostIntensity={active ? 0.85 : 0.45}
            rotationVelocity={rotationVelocity.current}
            strafeVelocity={strafeVelocity.current}
            shipHealth={100}
            modelIdOverride={modelId}
          />
        </group>
      </Canvas>
      <span className={`absolute inset-x-0 bottom-0.5 text-center text-[8px] font-black uppercase tracking-[0.14em] ${active ? 'text-[#00ffff]' : 'text-white/80'}`}>
        {modelId}
      </span>
    </button>
  );
};

export const PortfolioLanding = () => {
  const { setStatus, shipModelId, setShipModelId } = useGameStore();
  const [activeSection, setActiveSection] = useState('home');
  const [activeProjectTab, setActiveProjectTab] = useState<'web' | 'mobile' | 'aiml'>('web');
  const [scrolled, setScrolled] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    fullName: '',
    email: '',
    message: '',
  });
  const mouse = useRef(new THREE.Vector2(0, 0));
  const touchTarget = useRef(new THREE.Vector2(0, 0));
  const isTouchTracking = useRef(false);
  const scrollRef = useRef(0);
  const { scrollY } = useScroll();
  const { scrollYProgress } = useScroll();
  const smoothScroll = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const backgroundScrollY = useTransform(smoothScroll, [0, 1], ['-1%', '6%']);
  const backgroundMouseX = useSpring(0, { stiffness: 60, damping: 20, mass: 0.8 });
  const backgroundMouseY = useSpring(0, { stiffness: 60, damping: 20, mass: 0.8 });

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
    let frameId = 0;

    const applyParallaxTarget = (x: number, y: number) => {
      mouse.current.x = x;
      mouse.current.y = y;
      backgroundMouseX.set(mouse.current.x * 14);
      backgroundMouseY.set(-mouse.current.y * 10);
    };

    const normalizePoint = (clientX: number, clientY: number) => ({
      x: (clientX / window.innerWidth) * 2 - 1,
      y: -(clientY / window.innerHeight) * 2 + 1,
    });

    const tickTouchSmoothing = () => {
      if (isTouchTracking.current) {
        mouse.current.lerp(touchTarget.current, 0.14);
        applyParallaxTarget(mouse.current.x, mouse.current.y);
      }
      frameId = window.requestAnimationFrame(tickTouchSmoothing);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const point = normalizePoint(e.clientX, e.clientY);
      applyParallaxTarget(point.x, point.y);
    };

    const handleTouchStartOrMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      const point = normalizePoint(touch.clientX, touch.clientY);
      touchTarget.current.set(point.x, point.y);
      isTouchTracking.current = true;
    };

    const resetParallaxTarget = () => {
      isTouchTracking.current = false;
      touchTarget.current.set(0, 0);
      applyParallaxTarget(0, 0);
    };

    frameId = window.requestAnimationFrame(tickTouchSmoothing);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouchStartOrMove, { passive: true });
    window.addEventListener('touchmove', handleTouchStartOrMove, { passive: true });
    window.addEventListener('touchend', resetParallaxTarget, { passive: true });
    window.addEventListener('touchcancel', resetParallaxTarget, { passive: true });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchStartOrMove);
      window.removeEventListener('touchmove', handleTouchStartOrMove);
      window.removeEventListener('touchend', resetParallaxTarget);
      window.removeEventListener('touchcancel', resetParallaxTarget);
    };
  }, [backgroundMouseX, backgroundMouseY]);

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

  const handleContactSubmit = () => {
    if (!contactForm.fullName.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      window.alert('Fill in name, email, and message first.');
      return;
    }

    const subject = encodeURIComponent(`Portfolio inquiry from ${contactForm.fullName}`);
    const body = encodeURIComponent(
      `Name: ${contactForm.fullName}\nEmail: ${contactForm.email}\n\nMessage:\n${contactForm.message}`
    );
    const mailtoUrl = `mailto:${PORTFOLIO_DATA.contact.email}?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
  };

  const handleWhatsAppContact = () => {
    if (!contactForm.fullName.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      window.alert('Fill in name, email, and message first.');
      return;
    }

    const phone = PORTFOLIO_DATA.contact.mobile.replace(/[^\d]/g, '');
    const message = encodeURIComponent(
      `Hello Rajesh,\n\nName: ${contactForm.fullName}\nEmail: ${contactForm.email}\n\nMessage:\n${contactForm.message}`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  const otherProjects = PORTFOLIO_DATA.projects.filter((project) => !currentProjectTitles.includes(project.title));
  const projectTabs = {
    web: otherProjects.filter((project) => project.tags.includes('Web')),
    mobile: otherProjects.filter((project) => project.tags.includes('Android') || project.tags.includes('iOS') || project.tags.includes('Architecture') || project.tags.includes('Play Store')),
    aiml: otherProjects.filter((project) =>
      project.tags.includes('AI') ||
      project.tags.includes('ML') ||
      project.tags.includes('Python') ||
      project.tags.includes('Computer Vision') ||
      project.tags.includes('Monitoring') ||
      project.tags.includes('Django') ||
      project.tags.includes('Backend') ||
      project.tags.includes('Ktor') ||
      project.tags.includes('System Design')
    )
  };

  return (
    <div className="relative min-h-screen bg-[#020205] text-white font-sans selection:bg-[#00ffff] selection:text-black overflow-x-hidden">
      {/* --- BACKGROUND SHIP LAYER --- */}
      <div className="fixed inset-0 z-10 pointer-events-none opacity-100">
        <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
          <ambientLight intensity={1.05} />
          <pointLight position={[10, 10, 10]} intensity={2.8} color="#00ffff" />
          <pointLight position={[-16, -10, 8]} intensity={3} color="#00ffff" distance={44} />
          <pointLight position={[16, -10, 8]} intensity={3} color="#ffd54a" distance={44} />
          <PortfolioBackgroundShip mouse={mouse} scroll={scrollRef} />
          <EffectComposer>
            <Bloom intensity={0.18} luminanceThreshold={0.55} luminanceSmoothing={0.9} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* --- BACKGROUND EFFECTS --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute -inset-[8%] opacity-100"
          style={{
            backgroundImage: "url('/textures/space/milky_way.jpg')",
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            x: backgroundMouseX,
            y: backgroundMouseY,
            translateY: backgroundScrollY,
          }}
        />
        <div className="absolute right-[15%] top-[18%] h-[46vh] w-[36vw] rounded-full bg-[radial-gradient(circle,rgba(2,2,5,0.52)_0%,rgba(2,2,5,0.28)_42%,rgba(2,2,5,0)_78%)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(2,2,5,0)_0%,rgba(2,2,5,0.12)_72%,rgba(2,2,5,0.28)_100%)]" />
        
        {/* Animated accent glow */}
        <motion.div 
          animate={{ 
            opacity: [0.04, 0.08, 0.04],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-1/4 w-[50%] h-[50%] bg-[#00ffff]/5 blur-[120px] rounded-full"
        />
      </div>

      <div className="relative z-20">

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
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="hidden md:block">
              <OrbitingShipButton
                label={PORTFOLIO_DATA.ctas.start}
                onClick={handleStartGame}
                className="group relative z-10 px-6 py-2 bg-[#00ffff] text-black text-[10px] font-black uppercase tracking-widest rounded hover:bg-white transition-all shadow-[0_0_20px_rgba(0,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] active:scale-95 flex items-center gap-2"
              />
            </motion.div>

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
          <div className="space-y-5">
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
              className="flex flex-wrap gap-x-6 gap-y-2 py-3 border-t border-white/5"
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
              className="grid w-full max-w-[300px] grid-cols-2 gap-2 pt-0.5 sm:flex sm:max-w-none sm:items-stretch sm:justify-start sm:gap-1"
            >
              <a
                href={PORTFOLIO_DATA.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-20 w-full min-w-0 items-center justify-center gap-2.5 rounded bg-white px-4 py-3.5 text-center text-[10px] font-black uppercase tracking-[0.14em] text-black transition-all group shadow-xl hover:bg-[#00ffff] sm:w-auto sm:shrink-0 sm:justify-start sm:px-5 sm:text-[11px] sm:tracking-[0.16em]"
              >
                <Download size={13} />
                {PORTFOLIO_DATA.ctas.resume}
              </a>
              <OrbitingShipButton
                label={PORTFOLIO_DATA.ctas.start}
                onClick={handleStartGame}
                wrapperClassName="w-full sm:w-auto"
                className="group relative z-10 flex h-20 w-full min-w-0 items-center justify-center gap-2.5 rounded border border-white/20 bg-transparent px-4 py-3.5 text-center text-[10px] font-black uppercase tracking-[0.14em] transition-all hover:border-[#00ffff] hover:text-[#00ffff] sm:w-auto sm:shrink-0 sm:justify-start sm:px-5 sm:text-[11px] sm:tracking-[0.16em]"
              />
              <ShipPreview
                modelId="spacy"
                active={shipModelId === 'spacy'}
                onClick={() => setShipModelId('spacy')}
              />
              <ShipPreview
                modelId="scipio"
                active={shipModelId === 'scipio'}
                onClick={() => setShipModelId('scipio')}
              />
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
            className="relative lg:ml-auto"
          >
            <div className="relative w-full max-w-[300px] h-[380px] sm:h-[400px] md:w-[400px] md:max-w-none md:h-[500px] mx-auto group">
              {/* Decorative frames */}
              <div className="absolute -inset-4 border border-[#00ffff]/20 rounded-2xl -rotate-3 group-hover:rotate-0 transition-transform duration-700" />
              <div className="absolute -inset-4 border border-white/10 rounded-2xl rotate-3 group-hover:rotate-0 transition-transform duration-700 delay-100" />
              
              {/* Main Image Block */}
              <div className="relative w-full h-full bg-[#111] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <img 
                  src={PORTFOLIO_DATA.heroImage} 
                  alt="Rajesh Khan"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* Floating Info */}
                <div className="absolute bottom-2 left-3 right-3 p-2 sm:bottom-6 sm:left-6 sm:right-6 sm:p-4 bg-black/50 backdrop-blur-md border border-white/10 rounded-xl">
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#00ffff]">Experience</div>
                      <div className="text-[15px] sm:text-xl font-black italic leading-tight">{PORTFOLIO_DATA.experienceSummary}</div>
                    </div>
                    <div className="sm:text-right">
                      <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/40">Location</div>
                      <div className="text-[11px] sm:text-sm font-bold">{PORTFOLIO_DATA.location}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Tech Badges */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 right-0 p-3 sm:-top-8 sm:-right-8 sm:p-4 bg-black border border-[#00ffff]/30 rounded-2xl backdrop-blur-xl shadow-2xl"
              >
                <Cpu className="text-[#00ffff]" size={24} />
              </motion.div>
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-4 left-0 p-3 sm:-bottom-8 sm:-left-8 sm:p-4 bg-black border border-[#00ffff]/30 rounded-2xl backdrop-blur-xl shadow-2xl"
              >
                <Brain className="text-[#00ffff]" size={24} />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- CURRENT PROJECTS --- */}
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
                  Current Projects
                </div>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
                  {featuredProject.title.split(' ')[0]} <span className="text-[#00ffff]">{featuredProject.title.split(' ').slice(1).join(' ')}</span>
                </h2>
                <p className="text-xl text-white/60 leading-relaxed">
                  {featuredProject.description}
                </p>
                <div className="flex flex-wrap gap-3">
                  {featuredProject.tags.map(tag => (
                    <span key={tag} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-4 pt-4">
                  {featuredProject.liveUrl ? (
                    <a href={featuredProject.liveUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-[#00ffff] text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white transition-all">
                      View Project
                    </a>
                  ) : (
                    <div className="px-8 py-4 bg-white/5 text-white/40 font-black uppercase tracking-widest text-xs rounded-xl border border-white/10">
                      Private Project
                    </div>
                  )}
                  {featuredProject.repoUrl ? (
                    <a href={featuredProject.repoUrl} target="_blank" rel="noopener noreferrer" className="p-4 bg-white/5 border border-white/10 rounded-xl hover:text-[#00ffff] transition-all">
                      <Github size={20} />
                    </a>
                  ) : null}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-700">
                  <img 
                    src={featuredProject.image} 
                    alt={featuredProject.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Decorative UI elements */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#00ffff]/20 blur-3xl rounded-full" />
              </div>
            </div>
          </motion.div>

          {currentProjects.length > 1 && (
            <div className="grid md:grid-cols-2 gap-8 mt-10">
              {currentProjects
                .filter((project) => project.title !== featuredProject.title)
                .map((project, i) => (
                  <motion.div
                    key={project.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="group relative flex flex-col bg-white/2 border border-white/10 rounded-[32px] overflow-hidden hover:border-[#00ffff]/30 transition-all hover:-translate-y-2"
                  >
                    <div className="aspect-[16/9] overflow-hidden relative bg-black">
                      {getEmbeddedVideoUrl(project.videoUrl || project.liveUrl) ? (
                        <iframe
                          src={getEmbeddedVideoUrl(project.videoUrl || project.liveUrl)}
                          title={`${project.title} demo`}
                          className="h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="strict-origin-when-cross-origin"
                        />
                      ) : (
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-50 pointer-events-none" />
                      <div className="absolute top-6 right-6">
                        <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          {project.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-7 space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <span key={tag} className="text-[10px] font-black uppercase tracking-widest text-[#00ffff]/60">#{tag}</span>
                        ))}
                      </div>
                      <h3 className="text-2xl font-black tracking-tight uppercase italic">{project.title}</h3>
                      <p className="text-white/50 text-sm leading-relaxed">{project.description}</p>
                      <div className="flex gap-3 pt-5 border-t border-white/5">
                        {project.liveUrl ? (
                          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 bg-white/5 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-[#00ffff] hover:text-black transition-all flex items-center justify-center gap-2">
                            <ExternalLink size={14} /> View Details
                          </a>
                        ) : (
                          <div className="flex-1 py-3 bg-white/5 text-white/30 font-black uppercase tracking-widest text-[10px] rounded-xl border border-white/10 flex items-center justify-center gap-2">
                            <ExternalLink size={14} /> Private
                          </div>
                        )}
                        {project.repoUrl ? (
                          <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 text-white rounded-xl hover:bg-white hover:text-black transition-all">
                            <Github size={18} />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          )}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PORTFOLIO_DATA.skills.map((skill, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-7 bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl hover:border-[#00ffff]/50 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  {IconMap[skill.icon]}
                </div>
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[#00ffff]/10 group-hover:scale-110 transition-all">
                  <span className="text-[#00ffff]">{IconMap[skill.icon]}</span>
                </div>
                <h3 className="text-xl font-black tracking-tight mb-4 uppercase italic">{skill.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {skill.items.map(item => (
                    <span key={item} className="px-3 py-1.5 bg-white/5 text-white/60 text-[9px] font-black rounded-xl uppercase tracking-widest border border-white/5 group-hover:border-white/20 transition-colors">
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
            <div className="relative z-20 flex flex-wrap gap-3 pointer-events-auto">
              {([
                { id: 'web', label: 'Web' },
                { id: 'mobile', label: 'Mobile' },
                { id: 'aiml', label: 'AI/ML' }
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveProjectTab(tab.id)}
                  type="button"
                  className={`px-5 py-3 rounded-xl border text-[10px] font-black tracking-[0.3em] uppercase transition-all ${
                    activeProjectTab === tab.id
                      ? 'bg-[#00ffff] text-black border-[#00ffff]'
                      : 'bg-white/5 text-white/50 border-white/10 hover:border-[#00ffff]/40 hover:text-[#00ffff]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projectTabs[activeProjectTab].map((project, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative flex flex-col bg-white/2 border border-white/10 rounded-[32px] overflow-hidden hover:border-[#00ffff]/30 transition-all hover:-translate-y-2"
              >
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-6 right-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${project.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                      {project.status}
                    </span>
                  </div>
                </div>
                <div className="p-7 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-black uppercase tracking-widest text-[#00ffff]/60">#{tag}</span>
                    ))}
                  </div>
                  <h3 className="text-2xl font-black tracking-tight uppercase italic">{project.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{project.description}</p>
                  <div className="flex gap-3 pt-5 border-t border-white/5">
                    {project.liveUrl ? (
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 bg-white/5 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-[#00ffff] hover:text-black transition-all flex items-center justify-center gap-2">
                        <ExternalLink size={14} /> Live
                      </a>
                    ) : (
                      <div className="flex-1 py-3 bg-white/5 text-white/30 font-black uppercase tracking-widest text-[10px] rounded-xl border border-white/10 flex items-center justify-center gap-2">
                        <ExternalLink size={14} /> Private
                      </div>
                    )}
                    {project.videoUrl ? (
                      <a href={project.videoUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 text-white rounded-xl hover:bg-white hover:text-black transition-all">
                        <Monitor size={18} />
                      </a>
                    ) : null}
                    {project.repoUrl ? (
                      <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 text-white rounded-xl hover:bg-white hover:text-black transition-all">
                        <Github size={18} />
                      </a>
                    ) : null}
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
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[#00ffff] text-[10px] font-black tracking-widest uppercase flex items-center gap-2 hover:gap-4 transition-all">
                  View Repo <ChevronRight size={14} />
                </a>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* --- FOOTER / CONNECT --- */}
      <footer id="connect" className="py-16 md:py-24 px-4 md:px-8 border-t border-white/5 relative overflow-hidden bg-black/40">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 md:gap-16 items-end relative z-10">
          <div className="space-y-10 md:space-y-16">
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter uppercase italic leading-[0.9]">
                Let's <span className="text-[#00ffff]">Build</span> <br /> Something <br /> Great
              </h2>
              <p className="text-white/60 text-base md:text-xl max-w-md leading-relaxed font-medium">
                I'm currently available for new projects and collaborations. Let's start a conversation about your next mission.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
              <a href={`mailto:${PORTFOLIO_DATA.contact.email}`} className="p-4 md:p-5 bg-white/5 border border-white/10 rounded-[24px] md:rounded-[28px] space-y-3 hover:border-[#00ffff]/50 transition-all group min-w-0">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:bg-[#00ffff]/10 group-hover:text-[#00ffff] transition-all">
                  <Mail size={20} className="md:w-6 md:h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Email Me</div>
                  <div className="text-sm md:text-base font-black italic break-all">{PORTFOLIO_DATA.contact.email}</div>
                </div>
              </a>
              <a href={`tel:${PORTFOLIO_DATA.contact.mobile}`} className="p-4 md:p-5 bg-white/5 border border-white/10 rounded-[24px] md:rounded-[28px] space-y-3 hover:border-[#00ffff]/50 transition-all group">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:bg-[#00ffff]/10 group-hover:text-[#00ffff] transition-all">
                  <Phone size={20} className="md:w-6 md:h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Call Me</div>
                  <div className="text-base md:text-lg font-black italic">{PORTFOLIO_DATA.contact.mobile}</div>
                </div>
              </a>
            </div>

            <div className="flex flex-wrap gap-3 md:gap-4">
              {PORTFOLIO_DATA.contact.socials.map(social => (
                <a 
                  key={social.platform} 
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 md:w-16 md:h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white/40 hover:bg-[#00ffff] hover:text-black transition-all hover:-translate-y-2"
                >
                  {getSocialIcon(social.platform)}
                </a>
              ))}
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="self-end p-5 md:p-8 bg-gradient-to-br from-white/10 to-transparent rounded-[28px] md:rounded-[40px] border border-white/10 space-y-5 md:space-y-6 backdrop-blur-2xl shadow-2xl relative min-w-0"
          >
            <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10">
              <Send size={72} className="text-[#00ffff] md:w-[100px] md:h-[100px]" />
            </div>
            
            <div className="space-y-4 md:space-y-6 relative z-10">
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2 md:space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">Full Name</label>
                  <input
                    type="text"
                    value={contactForm.fullName}
                    onChange={(e) => setContactForm((prev) => ({ ...prev, fullName: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-3 md:p-4 focus:border-[#00ffff] outline-none transition-all text-sm font-bold"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2 md:space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">Email Address</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-3 md:p-4 focus:border-[#00ffff] outline-none transition-all text-sm font-bold"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2 md:space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">Your Message</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, message: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-3 md:p-4 h-28 md:h-32 focus:border-[#00ffff] outline-none transition-all text-sm font-bold resize-none"
                  placeholder="Tell me about your project..."
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
                <button
                  onClick={handleWhatsAppContact}
                  className="w-full py-3 md:py-3.5 bg-[#25D366] text-black font-black rounded-2xl uppercase tracking-[0.24em] md:tracking-[0.3em] text-[11px] md:text-xs hover:bg-[#3bf07d] transition-all flex items-center justify-center gap-3 md:gap-4 group shadow-[0_0_30px_rgba(37,211,102,0.25)] active:scale-95"
                >
                  WhatsApp
                  <Send size={18} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                </button>
                <button
                  onClick={handleContactSubmit}
                  className="w-full py-3 md:py-3.5 bg-[#00ffff] text-black font-black rounded-2xl uppercase tracking-[0.24em] md:tracking-[0.3em] text-[11px] md:text-xs hover:bg-white transition-all flex items-center justify-center gap-3 md:gap-4 group shadow-[0_0_40px_rgba(0,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] active:scale-95"
                >
                  Email
                  <Send size={18} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto mt-14 md:mt-24 pt-8 md:pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-10 text-[9px] md:text-[10px] font-black tracking-[0.24em] md:tracking-[0.4em] uppercase text-white/20">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-8 h-8 bg-[#00ffff]/10 rounded-lg flex items-center justify-center">
              <Rocket size={14} className="text-[#00ffff]" />
            </div>
            <span>© 2026 {PORTFOLIO_DATA.name}. Built for the Cosmos.</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-16">
            <a href="#" className="hover:text-[#00ffff] transition-colors">Privacy Protocol</a>
            <a href="#" className="hover:text-[#00ffff] transition-colors">Mission Terms</a>
          </div>
        </div>
      </footer>
      </div>

      {/* --- SCROLL INDICATOR --- */}
      <motion.div 
        style={{ scaleX: smoothScroll }}
        className="fixed top-0 left-0 right-0 h-1 bg-[#00ffff] origin-left z-[60] shadow-[0_0_10px_rgba(0,255,255,0.5)]"
      />
    </div>
  );
};
