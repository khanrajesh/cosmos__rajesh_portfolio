import resumePdf from '../assets/resume/Rajesh Khan Resume.pdf';
import profileImage from '../assets/img/my_img.jpg';
import featuredImage from '../assets/img/jewel_vault_banner.png';
import webproject1 from '../assets/img/webproject1.png';
import webproject2 from '../assets/img/webproject2.png';
import webproject3 from '../assets/img/webproject3.png';
import webproject4 from '../assets/img/webproject4.png';
import androidproject1 from '../assets/img/androidproject1.png';
import androidproject2 from '../assets/img/androidproject2.png';
import androidproject3 from '../assets/img/androidproject3.png';
import androidproject4 from '../assets/img/androidproject4.png';
import androidproject6 from '../assets/img/androidproject6.png';
import androidproject7 from '../assets/img/androidproject7.jpeg';
import backendproject1 from '../assets/img/backendproject1.png';
import backendproject2 from '../assets/img/backendproject2.jpg';
import lazier from '../assets/img/lazier.png';
import charging from '../assets/img/charging.jpg';
import thrower from '../assets/img/throw.jpg';

export const PORTFOLIO_DATA = {
  name: 'Rajesh Khan',
  title: 'AI/ML and GenAI Engineer',
  location: 'India',
  experienceSummary: '4+ years of software development experience',
  summary:
    'Building AI-first product experiences across machine learning, Generative AI, cloud platforms, and intelligent application workflows. Strong foundation in data structures, algorithms, SOLID principles, design patterns, clean architecture, and production-focused software delivery.',
  resumeUrl: resumePdf,
  heroImage: profileImage,
  stats: [
    { label: 'Years Experience', value: '4+' },
    { label: 'Projects Built', value: '15+' },
    { label: 'Primary Stack', value: 'AI/ML + GenAI' },
    { label: 'Focus', value: 'Intelligent Systems' }
  ],
  skills: [
    {
      category: 'AI & Machine Learning',
      items: [
        'Python',
        'Scikit-learn',
        'TensorFlow',
        'OpenCV',
        'MediaPipe',
        'Detection Pipelines',
        'Tracking',
        'Computer Vision Systems',
        'Feature Extraction',
        'Real-time Inference',
        'Model Integration'
      ],
      icon: 'brain'
    },
    { category: 'Generative AI', items: ['LLM Workflows', 'Prompt Engineering', 'AI Integrations'], icon: 'smartphone' },
    { category: 'Cloud & Dev Platforms', items: ['AWS', 'GCP', 'Docker', 'CI/CD', 'Firebase', 'SQL', 'MongoDB'], icon: 'database' },
    { category: 'Backend Development', items: ['Ktor', 'Django', 'Flask'], icon: 'server' },
    { category: 'Application Development', items: ['Kotlin', 'Java', 'KMP', 'CMP', 'iOS Swift', 'Compose UI', 'Android SDK'], icon: 'apple' },
    { category: 'Web & Product Interfaces', items: ['React.js', 'JavaScript', 'React Native', 'Node JS'], icon: 'globe' }
  ],
  projects: [
    {
      title: 'Jewel Vault',
      status: 'In Progress',
      description:
        'A secure jewelry management platform focused on inventory tracking, valuation records, customer history, and issue-return workflows through a clean operational dashboard.',
      tags: ['Kotlin', 'Compose UI', 'REST API', 'Firebase', 'Clean Architecture'],
      image: featuredImage,
      liveUrl: '',
      repoUrl: '',
      videoUrl: ''
    },
    {
      title: 'Udgam Foundation',
      status: 'Completed',
      description: 'Website design and development for a public-facing foundation presence.',
      tags: ['Web', 'Design', 'Development'],
      image: webproject1,
      liveUrl: 'https://www.udgamfoundation.net/',
      repoUrl: '',
      videoUrl: ''
    },
    {
      title: 'Skill Afford',
      status: 'Completed',
      description: 'Website design and development for Skill Afford.',
      tags: ['Web', 'Design', 'Development'],
      image: webproject2,
      liveUrl: 'https://skillafford.wixsite.com/mysite',
      repoUrl: '',
      videoUrl: ''
    },
    {
      title: 'Biswal Group of Construction',
      status: 'Completed',
      description: 'Website design and development for a construction business presence.',
      tags: ['Web', 'Design', 'Development'],
      image: webproject3,
      liveUrl: 'https://skillafford.wixsite.com/website-1',
      repoUrl: '',
      videoUrl: ''
    },
    {
      title: 'Dew Drop Entertainment',
      status: 'Completed',
      description: 'Website design and development for an entertainment brand.',
      tags: ['Web', 'Design', 'Development'],
      image: webproject4,
      liveUrl: 'https://skillafford.wixsite.com/dewdropsent',
      repoUrl: '',
      videoUrl: ''
    },
    {
      title: 'Intealth (The Healthy App)',
      status: 'Completed',
      description: 'Product design and development support for a healthcare-focused application.',
      tags: ['Android', 'Healthcare', 'Design', 'Development'],
      image: androidproject1,
      liveUrl: 'https://scene.zeplin.io/project/6220d01c9159c859c61d0d16',
      repoUrl: '',
      videoUrl: ''
    },
    {
      title: 'Sutpitara',
      status: 'Completed',
      description: 'Design and development work for a product concept with mobile-first flows.',
      tags: ['Android', 'UI/UX', 'Design'],
      image: androidproject2,
      liveUrl: 'https://www.figma.com/file/TYNm63kDEpVO64HrJ638FI/Sutpitara?type=design&node-id=0%3A1&mode=design&t=gbbUOcMQZXLy9vRE-1',
      repoUrl: '',
      videoUrl: ''
    },
    {
      title: 'DORO',
      status: 'Completed',
      description: 'Design, development, and architecture for a production Android application.',
      tags: ['Android', 'Architecture', 'Play Store'],
      image: androidproject3,
      liveUrl: 'https://play.google.com/store/apps/details?id=com.silverphoenix_v2.doro',
      repoUrl: '',
      videoUrl: ''
    },
    {
      title: 'DORO Partner',
      status: 'Completed',
      description: 'Companion Android app built for partner-side operational workflows.',
      tags: ['Android', 'Architecture', 'Play Store'],
      image: androidproject4,
      liveUrl: 'https://play.google.com/store/apps/details?id=com.silverphoenix.doropartner',
      repoUrl: '',
      videoUrl: ''
    },
    {
      title: 'NetWeb Bharat',
      status: 'Completed',
      description: 'Android product work and architecture support for a live business platform.',
      tags: ['Android', 'Architecture', 'Production'],
      image: androidproject6,
      liveUrl: 'https://netwebbharat.com/',
      repoUrl: '',
      videoUrl: ''
    },
    {
      title: 'Unity is Strength',
      status: 'Completed',
      description: 'Application development and architecture work for an organization platform.',
      tags: ['Android', 'Architecture', 'Production'],
      image: androidproject7,
      liveUrl: 'https://uisodisha.in/',
      repoUrl: '',
      videoUrl: ''
    },
    {
      title: 'Backend Developer (Ktor)',
      status: 'Completed',
      description: 'System design and server development work focused on scalable backend flows.',
      tags: ['Backend', 'Ktor', 'System Design'],
      image: backendproject1,
      liveUrl: '',
      repoUrl: '',
      videoUrl: ''
    },
    {
      title: 'Tool Detection & Monitoring Software',
      status: 'Completed',
      description: 'Monitoring and detection software built with Python and Django for industrial workflows.',
      tags: ['Python', 'Django', 'Monitoring', 'Computer Vision'],
      image: backendproject2,
      liveUrl: 'https://www.youtube.com/watch?v=j-TP_aDeRd8',
      repoUrl: '',
      videoUrl: 'https://www.youtube.com/shorts/j-TP_aDeRd8'
    },
    {
      title: 'Vision Gesture Command System',
      status: 'Completed',
      description:
        'A gesture-driven interaction system that interprets hand movements and maps them to app actions for touch-free control and faster accessibility.',
      tags: ['Python', 'OpenCV', 'MediaPipe', 'ML'],
      image: androidproject6,
      liveUrl: 'https://www.youtube.com/watch?v=NJDS436ZG4o',
      repoUrl: '',
      videoUrl: 'https://youtu.be/NJDS436ZG4o'
    }
  ],
  experience: [
    { company: 'UST', role: 'Software Engineer', period: '2023 - Present', description: 'Building mobile products and software solutions with a strong quality and architecture focus.' },
    { company: 'IServeU Technology', role: 'Software Engineer', period: '2022 - 2023', description: 'Worked on scalable fintech solutions and application development.' },
    { company: 'Intealth Technology Pvt Ltd', role: 'Software Engineer Trainee', period: '2021 - 2022', description: 'Contributed to healthcare analytics-oriented product development.' },
    { company: 'Silver Phoenix Pvt Ltd', role: 'Software Engineer Intern', period: '2021 - 2021', description: 'Supported web and mobile development, testing, and delivery workflows.' },
    { company: 'Skill Afford', role: 'Data Science & Analyst Intern', period: '2020 - 2021', description: 'Worked on analytics, data interpretation, and model-oriented experimentation.' },
    { company: "Bhadani's Quantity Surveying Institute", role: 'Jr. Quantity Surveyor cum Corporate Trainer', period: '2020 - 2020', description: 'Handled surveying support and technical training responsibilities.' }
  ],
  education: [
    { school: 'GIET University, Gunupur', degree: 'B.Tech (Civil Engineering)', period: '2016 - 2020' },
    { school: 'Govt. Jr Science College, Malkangiri', degree: 'Higher Secondary (+2)', period: '2014 - 2016' },
    { school: 'Kendriya Vidyalaya, Malkangiri', degree: 'Matriculation (10th)', period: '2014' }
  ],
  contributions: [
    {
      title: 'Lazier',
      description: 'Android utility library focused on reducing boilerplate and speeding up repetitive development tasks.',
      tags: ['Open Source', 'Android'],
      image: lazier,
      url: 'https://github.com/blazebizz/lazier'
    },
    {
      title: 'Error Thrower',
      description: 'Simple Node server used to reproduce failures for testing and debugging workflows.',
      tags: ['Open Source', 'Node.js'],
      image: thrower,
      url: 'https://github.com/khanrajesh/error_thrower_throw'
    },
    {
      title: 'EcoCharge Hub',
      description: 'Ongoing EV charging platform work spanning Android, backend, and web surfaces.',
      tags: ['Android', 'Backend', 'Web'],
      image: charging,
      url: 'https://github.com/blazebizz/EvChargingAndroid'
    }
  ],
  contact: {
    email: 'khanrajesh7128@gmail.com',
    mobile: '+91-8260636334',
    socials: [
      { platform: 'Linkedin', url: 'https://www.linkedin.com/in/rajesh-khan-105635172/' },
      { platform: 'Instagram', url: 'https://www.instagram.com/rajesh_kha.n/' },
      { platform: 'Gitlab', url: 'https://gitlab.com/khanrajesh/' },
      { platform: 'Github', url: 'https://github.com/khanrajesh/' },
      { platform: 'Medium', url: 'https://medium.com/@khanrajesh7128/' }
    ]
  },
  navItems: [
    { id: 'home', label: 'Home' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'timeline', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'contributions', label: 'Contributions' },
    { id: 'connect', label: 'Connect' }
  ],
  hero: {
    welcome: 'Welcome to my Portfolio',
    greeting: "Hi! I'm Rajesh Khan",
    role: 'AI/ML Engineer | GenAI Builder | Cloud-Focused Developer'
  },
  ctas: {
    resume: 'Get My Resume',
    start: 'Enter Cosmos Pilot'
  }
};
