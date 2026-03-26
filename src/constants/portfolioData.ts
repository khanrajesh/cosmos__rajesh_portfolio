export const PORTFOLIO_DATA = {
  name: "Rajesh Khan",
  title: "Android Developer",
  location: "Currently working at UST",
  experienceSummary: "4+ years of experience in software development",
  summary: "Strong focus on exceptional applications and seamless customer experiences. Solid understanding of Data Structures, Algorithms, SOLID Principles, Design Patterns, and Clean Architecture.",
  stats: [
    { label: "Years Experience", value: "4+" },
    { label: "Projects Completed", value: "15+" },
    { label: "Tech Stack", value: "Full-Stack" },
    { label: "Open Source", value: "Active" }
  ],
  skills: [
    { category: "Android Development", items: ["Java", "Kotlin", "React Native"], icon: "smartphone" },
    { category: "iOS Development", items: ["Xcode", "Swift"], icon: "apple" },
    { category: "Web Development", items: ["React.js", "JavaScript"], icon: "globe" },
    { category: "Backend Development", items: ["Ktor", "Django", "Flask"], icon: "server" },
    { category: "ML & AI Deployment", items: ["R", "Python"], icon: "brain" },
    { category: "Database Management", items: ["Firebase", "SQL", "MongoDB"], icon: "database" }
  ],
  projects: [
    {
      title: "Jewel Vault",
      status: "In Progress",
      description: "A secure jewelry management platform to track inventory, valuation details, customer history, and issue/return workflows with an easy dashboard.",
      tags: ["Kotlin", "Compose", "REST API", "Firebase"],
      image: "https://picsum.photos/seed/jewel/800/600"
    },
    {
      title: "ToolDetection",
      status: "Completed",
      description: "Tool Detection & Monitoring software focused on visual detection, tracking, and real-time monitoring support for industrial workflows.",
      tags: ["Python", "Django", "Computer Vision", "Monitoring"],
      image: "https://picsum.photos/seed/tool/800/600"
    },
    {
      title: "Vision Gesture Command System",
      status: "Completed",
      description: "A gesture-driven interaction system that interprets hand movements and maps them to app actions for touch-free control and faster accessibility.",
      tags: ["Python", "OpenCV", "MediaPipe", "ML"],
      image: "https://picsum.photos/seed/vision/800/600"
    }
  ],
  experience: [
    { company: "UST", role: "Software Engineer", period: "Current", description: "Leading Android development initiatives and implementing clean architecture." },
    { company: "IServeU Technology", role: "Software Engineer", period: "Previous Role", description: "Developed scalable fintech solutions and mobile applications." },
    { company: "Intealth Technology Pvt Ltd", role: "Software Engineer Trainee", period: "Trainee", description: "Focused on healthcare analytics and system optimization." },
    { company: "Silver Phoenix Pvt Ltd", role: "Software Engineer Intern", period: "Intern", description: "Assisted in web development and software testing." },
    { company: "Skill Afford", role: "Data Science & Analyst Intern", period: "Intern", description: "Analyzed complex datasets and built predictive models." },
    { company: "Bhadani's Quantity Surveying Institute", role: "Jr. Quantity Surveyor cum Corporate Trainer", period: "Early Career", description: "Managed quantity surveying and conducted technical training." }
  ],
  education: [
    { school: "GIET University, Gunupur", degree: "B.Tech (Civil Engineering)", period: "2016 - 2020" },
    { school: "Govt. Jr Science College Malkangiri", degree: "Higher Secondary (+2)", period: "2014 - 2016" },
    { school: "Kendriya Vidyalaya Malkangiri", degree: "Matriculation (10th)", period: "2014" }
  ],
  contributions: [
    { title: "Lazier", description: "A utility library for lazy developers to automate repetitive tasks.", tags: ["Open Source", "Automation"] },
    { title: "Error Thrower", description: "A robust error handling and reporting tool for Android apps.", tags: ["Library", "Debugging"] }
  ],
  contact: {
    email: "khanrajesh7128@gmail.com",
    mobile: "+91-8260636334",
    socials: [
      { platform: "Github", url: "https://github.com/rajeshkhan" },
      { platform: "Linkedin", url: "https://linkedin.com/in/rajeshkhan" }
    ]
  },
  navItems: [
    { id: "home", label: "Home" },
    { id: "skills", label: "Skills" },
    { id: "projects", label: "Projects" },
    { id: "timeline", label: "Experience" },
    { id: "education", label: "Education" },
    { id: "contributions", label: "Contributions" },
    { id: "connect", label: "Connect" }
  ],
  hero: {
    welcome: "Welcome to my Portfolio",
    greeting: "Hi! I'm Rajesh Khan",
    role: "Android Developer"
  },
  ctas: {
    resume: "Get My Resume",
    start: "Enter Cosmos Pilot"
  }
};
