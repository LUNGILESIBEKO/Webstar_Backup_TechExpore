// Data/careerData.js
// Built-in CONTENT for the app: career tracks, quiz questions (with scoring
// weights), roadmap steps for every track, and mentors.
//
// Screens never contain this content. They read it through careerEngine.js,
// which prefers the live Firestore collections (career_tracks, quiz_questions,
// roadmap_steps, mentors) and only falls back to this file when Firestore is
// empty or offline. seedFirestore.js uploads this same data to Firestore.

const B = "backend-developer";
const F = "frontend-developer";
const D = "devops-engineer";
const A = "data-engineer";
const UX = "ux-ui-designer";
const CY = "cybersecurity-analyst";
const M = "mobile-developer";
const Q = "qa-engineer";
const DS = "data-scientist";
const PM = "product-manager";

export const TRACKS = [
  { id: B, title: "Backend Developer", order: 1 },
  { id: F, title: "Frontend Developer", order: 2 },
  { id: D, title: "DevOps Engineer", order: 3 },
  { id: A, title: "Data Engineer", order: 4 },
  { id: UX, title: "UX/UI Designer", order: 5 },
  { id: CY, title: "Cybersecurity Analyst", order: 6 },
  { id: M, title: "Mobile Developer", order: 7 },
  { id: Q, title: "QA / Test Engineer", order: 8 },
  { id: DS, title: "Data Scientist", order: 9 },
  { id: PM, title: "Product Manager", order: 10 },
];

// Each option carries `weights`: how many points it gives each track.
// The quiz result is calculated from these - nothing is hardcoded in Quiz.js.
// Every question now has one option per track, so all 10 careers have an
// equal, genuine chance of coming out on top - not just the original four.
export const QUIZ_QUESTIONS = [
  {
    id: "q1",
    order: 1,
    text: "What excites you most about technology?",
    options: [
      { text: "Building systems that scale to millions of users", weights: { [B]: 3, [D]: 1 } },
      { text: "Designing beautiful, intuitive interfaces", weights: { [F]: 3, [UX]: 1 } },
      { text: "Automating pipelines and infrastructure", weights: { [D]: 3, [B]: 1 } },
      { text: "Analysing data to find hidden insights", weights: { [A]: 3, [DS]: 1 } },
      { text: "Designing user flows and research-driven experiences", weights: { [UX]: 3, [F]: 1 } },
      { text: "Finding and fixing security vulnerabilities", weights: { [CY]: 3 } },
      { text: "Building apps people use every day on their phones", weights: { [M]: 3, [F]: 1 } },
      { text: "Making sure software works perfectly before it ships", weights: { [Q]: 3 } },
      { text: "Training models that can predict and make decisions", weights: { [DS]: 3, [A]: 1 } },
      { text: "Deciding what gets built next and why", weights: { [PM]: 3 } },
    ],
  },
  {
    id: "q2",
    order: 2,
    text: "When debugging a hard problem, you usually...",
    options: [
      { text: "Dig deep into logs and traces", weights: { [B]: 3, [D]: 1 } },
      { text: "Check the UI state and user flow", weights: { [F]: 3, [UX]: 1 } },
      { text: "Spin up a test environment and reproduce it", weights: { [D]: 3, [B]: 1 } },
      { text: "Visualise the data to spot the anomaly", weights: { [A]: 3, [DS]: 1 } },
      { text: "Sketch out the user journey to see where it breaks", weights: { [UX]: 3 } },
      { text: "Think like an attacker and look for exploits", weights: { [CY]: 3 } },
      { text: "Test on different devices and OS versions", weights: { [M]: 3, [Q]: 1 } },
      { text: "Write a detailed test case to reproduce it exactly", weights: { [Q]: 3 } },
      { text: "Check the model's assumptions and retrain with new data", weights: { [DS]: 3 } },
      { text: "Ask whether this even matters to the user", weights: { [PM]: 3 } },
    ],
  },
  {
    id: "q3",
    order: 3,
    text: "Which of these sounds like your ideal workday?",
    options: [
      { text: "Optimising APIs and database queries", weights: { [B]: 3, [A]: 1 } },
      { text: "Crafting pixel-perfect components and animations", weights: { [F]: 3 } },
      { text: "Writing Terraform configs and CI/CD pipelines", weights: { [D]: 3 } },
      { text: "Building dashboards and running A/B tests", weights: { [A]: 3, [F]: 1 } },
      { text: "Running usability tests and refining wireframes", weights: { [UX]: 3 } },
      { text: "Running penetration tests and hardening systems", weights: { [CY]: 3 } },
      { text: "Building native features for iOS or Android", weights: { [M]: 3 } },
      { text: "Writing automated test suites and catching regressions", weights: { [Q]: 3, [D]: 1 } },
      { text: "Exploring datasets and building predictive models", weights: { [DS]: 3, [A]: 1 } },
      { text: "Talking to users and writing product specs", weights: { [PM]: 3 } },
    ],
  },
  {
    id: "q4",
    order: 4,
    text: "Which course did you enjoy most at university?",
    options: [
      { text: "Databases, Algorithms, or Networking", weights: { [B]: 3, [D]: 1, [A]: 1 } },
      { text: "Human-Computer Interaction or Web Development", weights: { [F]: 3, [UX]: 1 } },
      { text: "Operating Systems or Cloud Computing", weights: { [D]: 3, [B]: 1 } },
      { text: "Statistics, Machine Learning, or Data Structures", weights: { [A]: 3, [DS]: 1 } },
      { text: "Design Thinking or Psychology", weights: { [UX]: 3 } },
      { text: "Information Security or Cryptography", weights: { [CY]: 3 } },
      { text: "Mobile App Development", weights: { [M]: 3 } },
      { text: "Software Testing or Quality Assurance", weights: { [Q]: 3 } },
      { text: "Machine Learning or Artificial Intelligence", weights: { [DS]: 3, [A]: 1 } },
      { text: "Business Strategy or Entrepreneurship", weights: { [PM]: 3 } },
    ],
  },
  {
    id: "q5",
    order: 5,
    text: "In a group project, your role tends to be...",
    options: [
      { text: "The one making the server and APIs work", weights: { [B]: 3 } },
      { text: "The one making it look and feel great", weights: { [F]: 3 } },
      { text: "The one setting up the repo, CI, and deployment", weights: { [D]: 3 } },
      { text: "The one analysing results and writing reports", weights: { [A]: 3 } },
      { text: "The one making sure it's easy and pleasant to use", weights: { [UX]: 3 } },
      { text: "The one worrying about what could go wrong securely", weights: { [CY]: 3 } },
      { text: "The one building the mobile version", weights: { [M]: 3 } },
      { text: "The one breaking things on purpose to find bugs", weights: { [Q]: 3 } },
      { text: "The one building the model that predicts the outcome", weights: { [DS]: 3 } },
      { text: "The one deciding what we're building and why", weights: { [PM]: 3 } },
    ],
  },
];

// One roadmap per career track. Step ids are unique across tracks so each
// student's progress is stored per step (users/{uid}.completedRoadmapSteps).
const step = (track, n, category, title, duration, description, resources) => ({
  id: `${track}-${n}`,
  track,
  order: n,
  category,
  title,
  duration,
  description,
  resources,
});

export const ROADMAP_STEPS = [
  // ---- Backend Developer ----
  step(B, 1, "Foundation", "Node.js & Express REST APIs", "4 Weeks",
    "Master JavaScript/TypeScript runtime, async execution, middleware, CLI tools, and RESTful routing.",
    [
      { label: "FreeCodeCamp Node.js Course", url: "https://www.youtube.com/watch?v=Oe421EPjeBE" },
      { label: "JWT Authentication Guide", url: "https://www.youtube.com/watch?v=f2EqECiTBL8" },
    ]),
  step(B, 2, "Databases", "SQL, PostgreSQL & Indexing", "3 Weeks",
    "Design relational schemas, write raw SQL queries, configure indexes, and optimize query execution plans.",
    [
      { label: "SQLBolt Interactive Tutorial", url: "https://sqlbolt.com/" },
      { label: "Use The Index, Luke!", url: "https://use-the-index-luke.com/" },
    ]),
  step(B, 3, "Portfolio", "CRUD APIs, Auth & Real Datasets", "4 Weeks",
    "Build 3 full backend projects with Role-Based Access Control (RBAC), Docker containers, and live database hosting.",
    [
      { label: "Roadmap.sh Backend Guide", url: "https://roadmap.sh/backend" },
      { label: "Backend Project Ideas", url: "https://www.freecodecamp.org/news/backend-web-development-project-ideas/" },
    ]),
  step(B, 4, "Cloud Certs", "AWS Solutions Architect Associate", "6 Weeks",
    "Learn cloud infrastructure: EC2, S3, RDS, Lambda, VPC networking, and IAM policies for production deployments.",
    [
      { label: "AWS SAA Official Exam Page", url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/" },
      { label: "GCP Associate Cloud Engineer", url: "https://cloud.google.com/learn/certification/cloud-engineer" },
    ]),
  step(B, 5, "Career & Jobs", "Internships & Remote Roles", "Ongoing",
    "Optimize GitHub profile, complete backend coding challenges, and apply to South African & global tech platforms.",
    [
      { label: "OfferZen South Africa", url: "https://www.offerzen.com/" },
      { label: "Wellfound Startup Jobs", url: "https://wellfound.com/" },
    ]),

  // ---- Frontend Developer ----
  step(F, 1, "Foundation", "HTML, CSS & Modern JavaScript", "4 Weeks",
    "Semantic HTML, responsive layouts with Flexbox and Grid, and the core of modern JavaScript (ES6+).",
    [
      { label: "MDN Learn Web Development", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development" },
      { label: "javascript.info", url: "https://javascript.info/" },
    ]),
  step(F, 2, "Frameworks", "React & Component Design", "4 Weeks",
    "Build reusable components, manage state and effects, and structure a real single-page application.",
    [
      { label: "React Official Learn Guide", url: "https://react.dev/learn" },
      { label: "Roadmap.sh Frontend Guide", url: "https://roadmap.sh/frontend" },
    ]),
  step(F, 3, "Core Skills", "TypeScript & Testing", "3 Weeks",
    "Add static types to your code and cover components with unit and integration tests.",
    [
      { label: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html" },
      { label: "Testing Library Docs", url: "https://testing-library.com/docs/" },
    ]),
  step(F, 4, "Portfolio", "Accessible, Fast Web Apps", "4 Weeks",
    "Ship 3 polished projects with accessibility, performance budgets and a deployed live demo.",
    [
      { label: "web.dev Learn", url: "https://web.dev/learn" },
      { label: "Frontend Mentor Challenges", url: "https://www.frontendmentor.io/" },
    ]),
  step(F, 5, "Career & Jobs", "Internships & Remote Roles", "Ongoing",
    "Polish your GitHub and portfolio site, then apply to South African & global product teams.",
    [
      { label: "OfferZen South Africa", url: "https://www.offerzen.com/" },
      { label: "Wellfound Startup Jobs", url: "https://wellfound.com/" },
    ]),

  // ---- DevOps Engineer ----
  step(D, 1, "Foundation", "Linux, Networking & Git", "4 Weeks",
    "Command line fluency, processes and permissions, TCP/IP and DNS basics, and a solid Git workflow.",
    [
      { label: "Linux Journey", url: "https://linuxjourney.com/" },
      { label: "Roadmap.sh DevOps Guide", url: "https://roadmap.sh/devops" },
    ]),
  step(D, 2, "Containers", "Docker & Kubernetes Basics", "4 Weeks",
    "Package services into containers and run them on a Kubernetes cluster.",
    [
      { label: "Docker Get Started", url: "https://docs.docker.com/get-started/" },
      { label: "Kubernetes Basics Tutorial", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/" },
    ]),
  step(D, 3, "Automation", "CI/CD with GitHub Actions", "3 Weeks",
    "Automate build, test and deploy pipelines for every push.",
    [
      { label: "GitHub Actions Docs", url: "https://docs.github.com/en/actions" },
    ]),
  step(D, 4, "Infrastructure", "Terraform & Cloud Fundamentals", "5 Weeks",
    "Describe cloud infrastructure as code and deploy it repeatably.",
    [
      { label: "Terraform Tutorials", url: "https://developer.hashicorp.com/terraform/tutorials" },
      { label: "Azure Fundamentals (AZ-900)", url: "https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/" },
    ]),
  step(D, 5, "Career & Jobs", "Monitoring, On-call & Job Hunt", "Ongoing",
    "Add metrics and alerting to a project, document it, and apply for DevOps and cloud roles.",
    [
      { label: "Grafana Docs", url: "https://grafana.com/docs/" },
      { label: "OfferZen South Africa", url: "https://www.offerzen.com/" },
    ]),

  // ---- Data Engineer ----
  step(A, 1, "Foundation", "Python & SQL for Data", "4 Weeks",
    "Write clean Python, then query and reshape data with joins, window functions and CTEs.",
    [
      { label: "Python Official Tutorial", url: "https://docs.python.org/3/tutorial/" },
      { label: "SQLBolt Interactive Tutorial", url: "https://sqlbolt.com/" },
    ]),
  step(A, 2, "Databases", "Data Modelling & Warehousing", "3 Weeks",
    "Design star schemas and dimensional models, and understand how warehouses differ from transactional databases.",
    [
      { label: "Data Engineering Zoomcamp", url: "https://github.com/DataTalksClub/data-engineering-zoomcamp" },
    ]),
  step(A, 3, "Core Skills", "ETL Pipelines & dbt", "4 Weeks",
    "Extract, transform and load data reliably, and manage transformations with dbt.",
    [
      { label: "dbt Documentation", url: "https://docs.getdbt.com/" },
      { label: "Data Engineering Zoomcamp", url: "https://github.com/DataTalksClub/data-engineering-zoomcamp" },
    ]),
  step(A, 4, "Advanced", "Spark & Cloud Data Platforms", "5 Weeks",
    "Process large datasets with Spark and run pipelines on a cloud data platform.",
    [
      { label: "Apache Spark Docs", url: "https://spark.apache.org/docs/latest/" },
    ]),
  step(A, 5, "Career & Jobs", "Portfolio Pipeline & Job Hunt", "Ongoing",
    "Build an end-to-end pipeline project and apply to South African & global data teams.",
    [
      { label: "OfferZen South Africa", url: "https://www.offerzen.com/" },
      { label: "Wellfound Startup Jobs", url: "https://wellfound.com/" },
    ]),

  // ---- UX/UI Designer ----
  step(UX, 1, "Foundation", "Design Principles & Figma", "4 Weeks",
    "Learn visual hierarchy, colour, typography and layout, and get fluent in Figma as your core design tool.",
    [
      { label: "Figma for Beginners", url: "https://www.figma.com/resources/learn-design/" },
      { label: "Laws of UX", url: "https://lawsofux.com/" },
    ]),
  step(UX, 2, "Research", "User Research & Wireframing", "3 Weeks",
    "Run interviews and usability tests, build personas, and translate findings into low-fidelity wireframes.",
    [
      { label: "Nielsen Norman Group Articles", url: "https://www.nngroup.com/articles/" },
      { label: "Interaction Design Foundation", url: "https://www.interaction-design.org/" },
    ]),
  step(UX, 3, "Core Skills", "Prototyping & Design Systems", "4 Weeks",
    "Build interactive prototypes and a reusable component/design system for consistent product experiences.",
    [
      { label: "Figma Prototyping Guide", url: "https://www.figma.com/resources/learn-design/prototyping/" },
    ]),
  step(UX, 4, "Advanced", "Usability Testing & Accessibility", "3 Weeks",
    "Run moderated usability tests and design for accessibility (WCAG) across devices and abilities.",
    [
      { label: "W3C Web Accessibility Initiative", url: "https://www.w3.org/WAI/fundamentals/" },
    ]),
  step(UX, 5, "Career & Jobs", "Portfolio & Job Hunt", "Ongoing",
    "Put together a case-study-driven portfolio and apply to South African & global product teams.",
    [
      { label: "OfferZen South Africa", url: "https://www.offerzen.com/" },
      { label: "Wellfound Startup Jobs", url: "https://wellfound.com/" },
    ]),

  // ---- Cybersecurity Analyst ----
  step(CY, 1, "Foundation", "Networking & Security Fundamentals", "4 Weeks",
    "Learn TCP/IP, firewalls, encryption basics and common attack types before going hands-on.",
    [
      { label: "TryHackMe Pre-Security Path", url: "https://tryhackme.com/path/outline/presecurity" },
      { label: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/" },
    ]),
  step(CY, 2, "Core Skills", "Ethical Hacking & Pentesting Basics", "4 Weeks",
    "Practise reconnaissance, scanning and exploitation safely in lab environments.",
    [
      { label: "TryHackMe", url: "https://tryhackme.com/" },
      { label: "Hack The Box", url: "https://www.hackthebox.com/" },
    ]),
  step(CY, 3, "Certifications", "CompTIA Security+ / CEH", "6 Weeks",
    "Study for an industry-recognised entry certification to validate your security fundamentals.",
    [
      { label: "CompTIA Security+ Overview", url: "https://www.comptia.org/certifications/security" },
    ]),
  step(CY, 4, "Hands-on", "Incident Response & SIEM Tools", "3 Weeks",
    "Learn how security teams detect, triage and respond to incidents using SIEM and monitoring tools.",
    [
      { label: "OWASP Incident Response Guide", url: "https://owasp.org/www-community/Incident_Response" },
    ]),
  step(CY, 5, "Career & Jobs", "Home Lab Portfolio & Job Hunt", "Ongoing",
    "Document a home-lab project or CTF write-ups, then apply for SOC analyst and junior security roles.",
    [
      { label: "OfferZen South Africa", url: "https://www.offerzen.com/" },
      { label: "Wellfound Startup Jobs", url: "https://wellfound.com/" },
    ]),

  // ---- Mobile Developer ----
  step(M, 1, "Foundation", "Mobile UI & Platform Basics", "4 Weeks",
    "Learn mobile design patterns, navigation and the basics of iOS (Swift) or Android (Kotlin) development.",
    [
      { label: "Apple Swift Tutorials", url: "https://developer.apple.com/tutorials/swiftui" },
      { label: "Android Developer Fundamentals", url: "https://developer.android.com/courses" },
    ]),
  step(M, 2, "Frameworks", "React Native or Flutter", "4 Weeks",
    "Build cross-platform apps from a single codebase using React Native or Flutter.",
    [
      { label: "React Native Docs", url: "https://reactnative.dev/docs/getting-started" },
      { label: "Flutter Documentation", url: "https://docs.flutter.dev/" },
    ]),
  step(M, 3, "Core Skills", "APIs, Storage & Offline Support", "3 Weeks",
    "Connect apps to REST APIs, persist data locally, and handle poor or no connectivity gracefully.",
    [
      { label: "Roadmap.sh Android Guide", url: "https://roadmap.sh/android" },
    ]),
  step(M, 4, "Portfolio", "Publish Apps to App Stores", "4 Weeks",
    "Ship 2-3 polished apps, handle app signing, and publish to the Play Store / App Store.",
    [
      { label: "Play Console Publishing Guide", url: "https://support.google.com/googleplay/android-developer/answer/9859152" },
      { label: "App Store Submission Guide", url: "https://developer.apple.com/app-store/submissions/" },
    ]),
  step(M, 5, "Career & Jobs", "Internships & Remote Roles", "Ongoing",
    "Polish your GitHub/portfolio with published apps, then apply to South African & global mobile teams.",
    [
      { label: "OfferZen South Africa", url: "https://www.offerzen.com/" },
      { label: "Wellfound Startup Jobs", url: "https://wellfound.com/" },
    ]),

  // ---- QA / Test Engineer ----
  step(Q, 1, "Foundation", "Manual Testing & Test Case Design", "3 Weeks",
    "Learn test case design, exploratory testing, bug reporting and the software testing lifecycle.",
    [
      { label: "Ministry of Testing - Foundations", url: "https://www.ministryoftesting.com/" },
    ]),
  step(Q, 2, "Automation", "Selenium/Playwright Test Automation", "4 Weeks",
    "Automate browser tests and build a maintainable test suite with Selenium or Playwright.",
    [
      { label: "Playwright Documentation", url: "https://playwright.dev/docs/intro" },
      { label: "Selenium Documentation", url: "https://www.selenium.dev/documentation/" },
    ]),
  step(Q, 3, "Core Skills", "API Testing & CI Integration", "3 Weeks",
    "Test REST APIs directly and wire automated tests into a CI/CD pipeline.",
    [
      { label: "Postman Learning Center", url: "https://learning.postman.com/" },
    ]),
  step(Q, 4, "Advanced", "Performance & Load Testing", "3 Weeks",
    "Measure how systems behave under load and spot bottlenecks before users do.",
    [
      { label: "k6 Load Testing Docs", url: "https://k6.io/docs/" },
    ]),
  step(Q, 5, "Career & Jobs", "Portfolio & Job Hunt", "Ongoing",
    "Document an automated test suite on GitHub and apply to QA and SDET roles.",
    [
      { label: "OfferZen South Africa", url: "https://www.offerzen.com/" },
      { label: "Wellfound Startup Jobs", url: "https://wellfound.com/" },
    ]),

  // ---- Data Scientist ----
  step(DS, 1, "Foundation", "Python, Stats & Pandas", "4 Weeks",
    "Build a solid base in Python, probability, statistics and data manipulation with Pandas.",
    [
      { label: "Kaggle Learn", url: "https://www.kaggle.com/learn" },
      { label: "Python Official Tutorial", url: "https://docs.python.org/3/tutorial/" },
    ]),
  step(DS, 2, "Core Skills", "Machine Learning Fundamentals", "5 Weeks",
    "Learn supervised and unsupervised learning, model evaluation and scikit-learn.",
    [
      { label: "scikit-learn User Guide", url: "https://scikit-learn.org/stable/user_guide.html" },
    ]),
  step(DS, 3, "Advanced", "Deep Learning & Model Deployment", "5 Weeks",
    "Train neural networks and learn how to package and deploy a model behind an API.",
    [
      { label: "PyTorch Tutorials", url: "https://pytorch.org/tutorials/" },
    ]),
  step(DS, 4, "Portfolio", "End-to-End ML Projects", "4 Weeks",
    "Ship 2-3 complete projects: data collection, modelling, evaluation, and a simple deployed demo.",
    [
      { label: "Kaggle Competitions", url: "https://www.kaggle.com/competitions" },
    ]),
  step(DS, 5, "Career & Jobs", "Portfolio & Job Hunt", "Ongoing",
    "Publish notebooks and projects on GitHub/Kaggle, then apply to South African & global data science teams.",
    [
      { label: "OfferZen South Africa", url: "https://www.offerzen.com/" },
      { label: "Wellfound Startup Jobs", url: "https://wellfound.com/" },
    ]),

  // ---- Product Manager ----
  step(PM, 1, "Foundation", "Product Thinking & Market Research", "3 Weeks",
    "Learn how to identify user problems, size opportunities and validate ideas before building.",
    [
      { label: "Mind the Product Articles", url: "https://www.mindtheproduct.com/category/learn/" },
    ]),
  step(PM, 2, "Core Skills", "Roadmapping & Prioritisation", "3 Weeks",
    "Learn prioritisation frameworks (RICE, MoSCoW) and how to build and defend a product roadmap.",
    [
      { label: "Product School Resources", url: "https://productschool.com/resources" },
    ]),
  step(PM, 3, "Execution", "Agile, Specs & Working With Engineers", "4 Weeks",
    "Write clear product specs, run sprint ceremonies, and collaborate effectively with design and engineering.",
    [
      { label: "Atlassian Agile Coach", url: "https://www.atlassian.com/agile" },
    ]),
  step(PM, 4, "Portfolio", "Case Studies & Product Teardown", "3 Weeks",
    "Write 2-3 product case studies or teardowns showing how you'd improve a real product.",
    [
      { label: "Product Teardown Examples", url: "https://www.mindtheproduct.com/category/learn/" },
    ]),
  step(PM, 5, "Career & Jobs", "Portfolio & Job Hunt", "Ongoing",
    "Package your case studies into a portfolio and apply for associate/junior PM roles.",
    [
      { label: "OfferZen South Africa", url: "https://www.offerzen.com/" },
      { label: "Wellfound Startup Jobs", url: "https://wellfound.com/" },
    ]),
];

export const MENTORS = [
  {
    id: "sipho-dlamini",
    name: "Sipho Dlamini",
    role: "Senior Backend Engineer",
    company: "Takealot",
    location: "Cape Town",
    tags: ["Python", "Microservices", "AWS"],
    bio: "8 years in backend engineering. Passionate about helping new grads navigate the industry.",
    available: true,
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format",
  },
  {
    id: "amahle-nkosi",
    name: "Amahle Nkosi",
    role: "DevOps Lead",
    company: "Standard Bank",
    location: "Johannesburg",
    tags: ["Kubernetes", "CI/CD", "Terraform"],
    bio: "Led DevOps transformation at multiple SA fintechs. Loves mentoring women in tech.",
    available: true,
    img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format",
  },
  {
    id: "lethabo-mokoena",
    name: "Lethabo Mokoena",
    role: "Cloud Architect",
    company: "Vodacom",
    location: "Midrand",
    tags: ["Azure", "Cloud Strategy", "Security"],
    bio: "Certified Azure Solutions Architect. Helping SA students break into cloud roles.",
    available: false,
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&auto=format",
  },
  {
    id: "kefilwe-tau",
    name: "Kefilwe Tau",
    role: "Data Engineer",
    company: "Discovery",
    location: "Sandton",
    tags: ["Spark", "dbt", "Snowflake"],
    bio: "5 years building data pipelines. Bridging the gap for CS graduates into data.",
    available: true,
    img: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=80&h=80&fit=crop&auto=format",
  },
  {
    id: "ruan-van-der-berg",
    name: "Ruan van der Berg",
    role: "Frontend Tech Lead",
    company: "Synthesis",
    location: "Cape Town",
    tags: ["React", "TypeScript", "Performance"],
    bio: "Building fast React apps for 7 years. Passionate about clean code and mentoring juniors.",
    available: true,
    img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&auto=format",
  },
];