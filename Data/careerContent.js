// Data/careerContent.js
// What the Explore screen (skills, certifications, jobs & salaries) and the Job
// Prep Hub show for EACH career track. The student's quiz result decides which
// block they see: top match = "backend-developer" -> TRACK_CONTENT["backend-developer"].
//
// NOTE: salaries, demand figures and certification costs are INDICATIVE
// estimates for South Africa (ZAR per year / approximate exam fees), not live
// market data. Check them against a current source (OfferZen, PayScale ZA,
// Glassdoor, the certification provider's site) before relying on them.

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

// Older code produced "qa-test-engineer" for the QA track; accept both.
export const TRACK_ALIASES = { "qa-test-engineer": Q };

/* ------------------------------- tiny helpers ------------------------------ */

const S = (name, badge, category, pct) => ({ name, badge, category, pct });

const C = (name, provider, level, cost, prep, category, url, tags) => ({
  name, provider, level, cost, prep, category, url, tags,
});

const fmt = (k) => (k >= 1000 ? `R${(k / 1000).toFixed(k % 1000 ? 1 : 0)}M` : `R${k}k`);
// minK / maxK / avgK are in thousands of rand per year
const J = (role, demand, yoy, minK, maxK, avgK) => ({
  role,
  demand,
  yoy,
  min: fmt(minK),
  max: fmt(maxK),
  avg: `${fmt(avgK)} / year`,
  fill: Math.round(((avgK - minK) / (maxK - minK)) * 100),
});

const T = (title, body) => ({ title, body });
const VH = "Very High Demand";
const H = "High Demand";
const ST = "Steady Demand";

/* -------------------------------- the content ------------------------------ */

export const TRACK_CONTENT = {
  [B]: {
    skills: [
      S("Python", "Rising", "Backend / Data", 94),
      S("SQL & Databases", "Steady", "Data layer", 90),
      S("REST & API Design", "Steady", "Backend", 88),
      S("Cloud Computing", "Rising", "Cloud / Infrastructure", 85),
      S("Node.js / Java / C#", "Steady", "Server languages", 78),
      S("Docker & Git", "Rising", "Tooling", 76),
    ],
    certs: [
      C("AWS Certified Developer – Associate", "Amazon Web Services", "Intermediate", "~R2 500", "2–4 months", "Backend", "https://aws.amazon.com/certification/certified-developer-associate/", ["Backend", "Cloud", "APIs"]),
      C("Microsoft Azure Developer Associate (AZ-204)", "Microsoft", "Intermediate", "~R2 500", "2–4 months", "Backend", "https://learn.microsoft.com/en-us/credentials/certifications/azure-developer/", ["Backend", "Azure", "C#"]),
      C("Microsoft Azure Fundamentals (AZ-900)", "Microsoft", "Beginner", "~R1 200", "3–6 weeks", "Cloud", "https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/", ["Cloud", "Beginner friendly"]),
      C("Python Institute PCAP", "Python Institute", "Intermediate", "~R3 000", "2–3 months", "Backend", "https://pythoninstitute.org/", ["Python", "Backend"]),
    ],
    jobs: [
      J("Backend Developer", H, "+18% YoY", 320, 850, 600),
      J("Software / Full-Stack Engineer", H, "+16% YoY", 300, 800, 560),
      J("API / Integration Developer", H, "+12% YoY", 280, 700, 480),
      J("Cloud Engineer", VH, "+31% YoY", 450, 1100, 775),
    ],
    prep: {
      cv: [
        T("Show systems you built, with numbers", "Write 'Built a REST API handling 50k requests a day, cutting response time by 40%' instead of 'worked on APIs'. Name the stack: Python, PostgreSQL, Docker."),
        T("Put 2–3 backend projects on GitHub", "An API with a real database, authentication and tests beats ten tutorial copies. Add a README that explains how to run it and what endpoints exist."),
        T("List databases and cloud by name", "Write PostgreSQL, MongoDB, AWS or Azure exactly as the job ad does. ATS filters match words literally."),
      ],
      interview: [
        T("Expect data and API questions", "Be ready to design a small API, explain SQL joins and indexes, and talk about REST status codes, authentication and error handling."),
        T("Practise live coding out loud", "Narrate your thinking while solving problems in your strongest language. Interviewers judge your process as much as your answer."),
        T("Be ready to explain a system you built", "Walk through one project end to end: why you chose the database, how it handles errors, and what you would change at 100× the traffic."),
      ],
      jobsearch: [
        T("Target banks, fintechs and software houses", "Backend roles are plentiful at banks, insurers, payment companies and consultancies in Johannesburg, Cape Town and Pretoria. Search 'Junior Backend' and 'Graduate Developer'."),
        T("Apply for graduate programmes early", "Many SA companies open graduate and learnership intakes in the second half of the year. Set reminders and apply in the first week."),
      ],
    },
  },

  [F]: {
    skills: [
      S("TypeScript", "Rising", "Frontend / Full-Stack", 90),
      S("React", "Steady", "Frontend", 89),
      S("HTML, CSS & Accessibility", "Steady", "Core web", 85),
      S("Responsive & Mobile-First Design", "Steady", "UI", 80),
      S("Testing (Jest / Playwright)", "Rising", "Quality", 70),
      S("Git & Web Performance", "Steady", "Tooling", 68),
    ],
    certs: [
      C("Meta Front-End Developer", "Meta (Coursera)", "Beginner", "~R950 / mo", "5–7 months", "Frontend", "https://www.coursera.org/professional-certificates/meta-front-end-developer", ["Frontend", "React", "Web Dev"]),
      C("freeCodeCamp Responsive Web Design", "freeCodeCamp", "Beginner", "Free", "2–3 months", "Frontend", "https://www.freecodecamp.org/learn", ["HTML", "CSS", "Free"]),
      C("The Odin Project (Full-Stack JavaScript)", "The Odin Project", "Beginner", "Free", "6–9 months", "Frontend", "https://www.theodinproject.com/", ["JavaScript", "React", "Free"]),
      C("Microsoft Azure Fundamentals (AZ-900)", "Microsoft", "Beginner", "~R1 200", "3–6 weeks", "Cloud", "https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/", ["Cloud", "Hosting"]),
    ],
    jobs: [
      J("Frontend Developer", H, "+15% YoY", 280, 720, 500),
      J("Full-Stack Developer", H, "+16% YoY", 300, 800, 560),
      J("UI Engineer", H, "+13% YoY", 300, 750, 520),
      J("Web Developer", ST, "+9% YoY", 220, 550, 380),
    ],
    prep: {
      cv: [
        T("Link live projects, not just code", "Hiring managers click your deployed sites first. Put 3 live links (Netlify, Vercel, GitHub Pages) at the top of your CV."),
        T("Show responsive and accessible work", "Mention mobile-first layouts, keyboard navigation and Lighthouse scores. These details set you apart from tutorial portfolios."),
        T("Name your framework and tools", "Write React, TypeScript, Tailwind, Git, Figma handoff exactly as listed in job ads."),
      ],
      interview: [
        T("Expect a take-home or live UI task", "You may be asked to build a small component or page. Keep it clean, accessible and readable, and explain your choices."),
        T("Know the browser basics", "Be ready for questions on the box model, flexbox/grid, event loop, closures, and how React re-renders."),
        T("Bring a project you can demo", "Be able to open your portfolio and walk through one interface: the design decisions, a bug you fixed and what you would improve."),
      ],
      jobsearch: [
        T("Build in public", "Post projects on GitHub, LinkedIn and Dev.to. Frontend recruiters search for visible portfolios."),
        T("Look at agencies and product teams", "Digital agencies, e-commerce companies and fintechs in SA all hire frontend developers. Search 'Junior Frontend', 'React Developer' and 'Web Developer'."),
      ],
    },
  },

  [D]: {
    skills: [
      S("Cloud Computing (AWS / Azure / GCP)", "Rising", "Cloud / Infrastructure", 93),
      S("Docker & Kubernetes", "Rising", "Containers", 90),
      S("CI/CD Pipelines", "Rising", "Automation", 87),
      S("Linux & Shell Scripting", "Steady", "Systems", 84),
      S("Infrastructure as Code (Terraform)", "Rising", "Automation", 80),
      S("Monitoring & Observability", "Steady", "Reliability", 70),
    ],
    certs: [
      C("AWS Certified Solutions Architect – Associate", "Amazon Web Services", "Intermediate", "~R2 500", "3–6 months", "Cloud", "https://aws.amazon.com/certification/certified-solutions-architect-associate/", ["Cloud", "DevOps"]),
      C("Certified Kubernetes Administrator (CKA)", "CNCF", "Advanced", "~R6 800", "2–3 months", "DevOps", "https://www.cncf.io/training/certification/cka/", ["Kubernetes", "DevOps"]),
      C("HashiCorp Terraform Associate", "HashiCorp", "Intermediate", "~R1 400", "1–2 months", "DevOps", "https://developer.hashicorp.com/certifications/infrastructure-automation", ["Terraform", "IaC"]),
      C("Google Associate Cloud Engineer", "Google Cloud", "Intermediate", "~R2 300", "2–4 months", "Cloud", "https://cloud.google.com/certification/cloud-engineer", ["Cloud", "DevOps"]),
    ],
    jobs: [
      J("DevOps Engineer", VH, "+27% YoY", 480, 950, 675),
      J("Cloud Engineer", VH, "+31% YoY", 450, 1100, 775),
      J("Site Reliability Engineer", H, "+20% YoY", 550, 1100, 800),
      J("Platform Engineer", H, "+19% YoY", 500, 1000, 720),
    ],
    prep: {
      cv: [
        T("Show automation you built", "'Cut deployment time from 2 hours to 10 minutes with a GitHub Actions pipeline' is stronger than listing tools."),
        T("Include a home-lab or cloud project", "Deploy an app with Docker on AWS or Azure using Terraform, then link the repo and a diagram."),
        T("List certifications near the top", "AWS, Azure or CKA badges are screened by recruiters and ATS before your project list is read."),
      ],
      interview: [
        T("Expect troubleshooting scenarios", "'A deployment failed in production, what do you check?' Practise a calm, step-by-step approach: logs, recent changes, rollback."),
        T("Know Linux, networking and containers", "Be ready on DNS, ports, permissions, how containers differ from VMs, and basic Kubernetes objects."),
        T("Explain a pipeline end to end", "Be able to describe build, test, deploy and monitor stages, and where you would add security checks."),
      ],
      jobsearch: [
        T("Search cloud and platform roles", "Try 'DevOps Engineer', 'Cloud Engineer', 'SRE' and 'Platform Engineer'. Banks, telcos and consultancies hire heavily."),
        T("Consider support or sysadmin as an entry route", "Many DevOps engineers started in IT support or system administration. Automate what you do there and move across."),
      ],
    },
  },

  [A]: {
    skills: [
      S("SQL (advanced)", "Steady", "Data", 94),
      S("Python for Data", "Rising", "Data engineering", 91),
      S("ETL / ELT Pipelines", "Rising", "Pipelines", 87),
      S("Cloud Data Platforms", "Rising", "Cloud", 84),
      S("Spark & Databricks", "Rising", "Big data", 76),
      S("Data Modelling & Warehousing", "Steady", "Architecture", 74),
    ],
    certs: [
      C("Google Professional Data Engineer", "Google Cloud", "Advanced", "~R4 000", "3–5 months", "Data", "https://cloud.google.com/certification/data-engineer", ["Data", "Cloud"]),
      C("Databricks Data Engineer Associate", "Databricks", "Intermediate", "~R3 000", "2–3 months", "Data", "https://www.databricks.com/learn/certification/data-engineer-associate", ["Spark", "Lakehouse"]),
      C("Azure Data Fundamentals (DP-900)", "Microsoft", "Beginner", "~R1 200", "3–5 weeks", "Data", "https://learn.microsoft.com/en-us/credentials/certifications/azure-data-fundamentals/", ["Data", "Beginner friendly"]),
      C("AWS Certified Solutions Architect – Associate", "Amazon Web Services", "Intermediate", "~R2 500", "3–6 months", "Cloud", "https://aws.amazon.com/certification/certified-solutions-architect-associate/", ["Cloud", "Data"]),
    ],
    jobs: [
      J("Data Engineer", VH, "+26% YoY", 400, 950, 650),
      J("Analytics Engineer", H, "+20% YoY", 380, 800, 570),
      J("BI Developer", H, "+12% YoY", 300, 700, 480),
      J("ETL Developer", H, "+9% YoY", 300, 650, 450),
    ],
    prep: {
      cv: [
        T("Describe data volume and impact", "'Built a pipeline processing 2M rows daily, cutting report time from 6 hours to 20 minutes' shows real scale."),
        T("Show one end-to-end pipeline project", "Ingest, clean, store and visualise data from a public source. Link the repo and a simple architecture diagram."),
        T("Name SQL, Python and the tools", "Write PostgreSQL, Python, Airflow, Spark, dbt, Azure Data Factory as listed in the ad."),
      ],
      interview: [
        T("Expect heavy SQL", "Practise joins, window functions, aggregations and query optimisation. Many interviews are mostly SQL."),
        T("Know ETL vs ELT and data modelling", "Be ready to explain star schemas, batch vs streaming and how you would handle bad or late data."),
        T("Talk about data quality", "Describe how you validate data, handle duplicates and alert on failures."),
      ],
      jobsearch: [
        T("Search banks, retail and telcos", "Large SA companies run big data platforms and hire data engineers. Search 'Data Engineer', 'BI Developer' and 'Analytics Engineer'."),
        T("Start from analyst roles if needed", "Moving from data analyst or BI into engineering is a common route. Show you can automate what you currently do by hand."),
      ],
    },
  },

  [UX]: {
    skills: [
      S("User Research & Interviews", "Rising", "Research", 88),
      S("Figma & Prototyping", "Steady", "Design tools", 92),
      S("Wireframing & Information Architecture", "Steady", "UX", 84),
      S("Visual & Interface Design", "Steady", "UI", 80),
      S("Usability Testing", "Steady", "Research", 76),
      S("Design Systems & Accessibility", "Rising", "UI", 72),
    ],
    certs: [
      C("Google UX Design Certificate", "Google (Coursera)", "Beginner", "~R950 / mo", "4–6 months", "Design", "https://www.coursera.org/professional-certificates/google-ux-design", ["UX", "Portfolio"]),
      C("Nielsen Norman Group UX Certification", "NN/g", "Intermediate", "~R25 000+", "Varies", "Design", "https://www.nngroup.com/ux-certification/", ["UX", "Research"]),
      C("Interaction Design Foundation courses", "IxDF", "Beginner", "~R3 000 / yr", "Self-paced", "Design", "https://www.interaction-design.org/", ["UI", "UX"]),
    ],
    jobs: [
      J("UX/UI Designer", H, "+13% YoY", 250, 650, 430),
      J("Product Designer", H, "+14% YoY", 350, 800, 560),
      J("UX Researcher", H, "+10% YoY", 300, 700, 480),
      J("Visual / Interaction Designer", ST, "+8% YoY", 250, 600, 400),
    ],
    prep: {
      cv: [
        T("Your portfolio is your CV", "Put your portfolio link first. Show 2–3 case studies, not 10 screens: problem, research, process, result."),
        T("Explain your decisions", "For each project write what you tried, what users said and what you changed because of it."),
        T("Quantify where you can", "'Redesigned checkout, task completion rose from 62% to 81% in testing' is stronger than 'improved UX'."),
      ],
      interview: [
        T("Prepare a portfolio walkthrough", "Be ready to present one case study in 10 minutes: your role, constraints, user insights and what you would do differently."),
        T("Expect a design challenge", "You may get a small brief to solve live or as a take-home. Show your thinking, not just the final screens."),
        T("Know how you work with developers", "Describe handoff, design systems and how you handle feedback when something can't be built as designed."),
      ],
      jobsearch: [
        T("Look at agencies and in-house teams", "Digital agencies, banks, retailers and startups hire designers. Search 'UX Designer', 'UI Designer' and 'Product Designer'."),
        T("Share your work publicly", "Post case studies on Behance, Dribbble and LinkedIn. Design hiring relies heavily on visible work."),
      ],
    },
  },

  [CY]: {
    skills: [
      S("Network & Systems Security", "Rising", "Security", 90),
      S("Security Monitoring (SIEM / SOC)", "Rising", "Blue team", 86),
      S("Linux & Networking Fundamentals", "Steady", "Foundations", 84),
      S("Risk, Compliance & POPIA", "Rising", "GRC", 78),
      S("Ethical Hacking Basics", "Rising", "Red team", 74),
      S("Cloud Security", "Rising", "Cloud", 72),
    ],
    certs: [
      C("CompTIA Security+", "CompTIA", "Beginner", "~R7 200", "2–3 months", "Security", "https://www.comptia.org/certifications/security", ["Cybersecurity", "Foundations"]),
      C("ISC2 Certified in Cybersecurity (CC)", "ISC2", "Beginner", "Low / free for some", "1–2 months", "Security", "https://www.isc2.org/certifications/cc", ["Entry level", "Security"]),
      C("Google Cybersecurity Certificate", "Google (Coursera)", "Beginner", "~R950 / mo", "4–6 months", "Security", "https://www.coursera.org/professional-certificates/google-cybersecurity", ["SOC", "Beginner friendly"]),
      C("Certified Ethical Hacker (CEH)", "EC-Council", "Advanced", "~R18 000+", "3–4 months", "Security", "https://www.eccouncil.org/train-certify/certified-ethical-hacker-ceh/", ["Pen testing", "Red team"]),
    ],
    jobs: [
      J("Security Analyst", VH, "+25% YoY", 350, 800, 550),
      J("SOC Analyst", VH, "+22% YoY", 280, 600, 420),
      J("Penetration Tester", H, "+20% YoY", 400, 950, 650),
      J("GRC / Compliance Analyst", H, "+15% YoY", 350, 750, 520),
    ],
    prep: {
      cv: [
        T("Show hands-on practice", "List TryHackMe, Hack The Box or home-lab work, with what you learned and the tools you used."),
        T("Put certifications up front", "Security+, CC or Google Cybersecurity are often used to screen entry-level applicants."),
        T("Mention compliance knowledge", "POPIA, ISO 27001 and risk assessment experience are valued in SA companies."),
      ],
      interview: [
        T("Expect scenario questions", "'You see unusual logins at 3am, what do you do?' Walk through detect, contain, investigate, report."),
        T("Know the fundamentals cold", "Be ready for the CIA triad, common attacks (phishing, SQL injection), encryption basics and how a firewall works."),
        T("Show you act ethically", "Interviewers look for integrity and discretion. Be clear about confidentiality and responsible disclosure."),
      ],
      jobsearch: [
        T("Banks and telcos hire security teams", "Large SA organisations run SOCs and compliance teams. Search 'SOC Analyst', 'Security Analyst' and 'Information Security'."),
        T("Start in IT support or networking", "Many security analysts move up from help desk or network roles. Add security tasks to your current work."),
      ],
    },
  },

  [M]: {
    skills: [
      S("Kotlin / Swift", "Steady", "Native mobile", 86),
      S("React Native / Flutter", "Rising", "Cross-platform", 88),
      S("Mobile UI & Navigation", "Steady", "UI", 82),
      S("REST APIs & Firebase", "Steady", "Backend for apps", 80),
      S("App Store Publishing", "Steady", "Delivery", 68),
      S("Mobile Testing & Performance", "Steady", "Quality", 66),
    ],
    certs: [
      C("Android Basics with Compose", "Google", "Beginner", "Free", "2–3 months", "Mobile", "https://developer.android.com/courses/android-basics-compose/course", ["Android", "Kotlin"]),
      C("Apple Swift & SwiftUI learning path", "Apple", "Beginner", "Free", "2–4 months", "Mobile", "https://developer.apple.com/learn/", ["iOS", "Swift"]),
      C("Flutter learning path", "Google", "Beginner", "Free", "2–3 months", "Mobile", "https://flutter.dev/learn", ["Flutter", "Cross-platform"]),
      C("Meta React Native Specialization", "Meta (Coursera)", "Intermediate", "~R950 / mo", "4–6 months", "Mobile", "https://www.coursera.org/specializations/meta-react-native", ["React Native"]),
    ],
    jobs: [
      J("Mobile Developer", H, "+14% YoY", 300, 800, 540),
      J("Android Developer", H, "+12% YoY", 300, 750, 520),
      J("iOS Developer", H, "+12% YoY", 320, 800, 560),
      J("React Native / Flutter Developer", H, "+16% YoY", 300, 750, 520),
    ],
    prep: {
      cv: [
        T("Link apps people can install", "Put Play Store or TestFlight links, or a short screen recording. A working app speaks louder than a skills list."),
        T("State platforms and languages", "Write Kotlin, Swift, React Native or Flutter plus any API and Firebase experience."),
        T("Show an app with real features", "Login, a database, push notifications or maps show you can build more than a to-do list."),
      ],
      interview: [
        T("Expect app-lifecycle and state questions", "Be ready to explain activities/view controllers, navigation, state management and how you handle offline use."),
        T("Know performance and battery basics", "Discuss lists, images, network calls and how you would keep the app fast on low-end phones common in SA."),
        T("Demo an app you built", "Be ready to walk through the code structure and a bug you solved."),
      ],
      jobsearch: [
        T("Look at banks, retail and delivery apps", "SA banks, retailers and fintechs all invest in mobile. Search 'Android Developer', 'iOS Developer' and 'Flutter Developer'."),
        T("Publish something", "A published app, even a small one, shows you can ship to the stores."),
      ],
    },
  },

  [Q]: {
    skills: [
      S("Test Planning & Test Cases", "Steady", "Manual testing", 86),
      S("Test Automation (Selenium / Playwright)", "Rising", "Automation", 90),
      S("API Testing (Postman)", "Rising", "Automation", 82),
      S("SQL & Basic Scripting", "Steady", "Foundations", 74),
      S("Agile / Scrum", "Steady", "Process", 72),
      S("CI/CD & Bug Tracking", "Steady", "Tooling", 68),
    ],
    certs: [
      C("ISTQB Certified Tester – Foundation Level", "ISTQB", "Beginner", "~R3 000", "1–2 months", "Testing", "https://www.istqb.org/certifications/certified-tester-foundation-level", ["Testing", "Foundations"]),
      C("Postman API Fundamentals", "Postman", "Beginner", "Free", "2–4 weeks", "Testing", "https://academy.postman.com/", ["API testing"]),
      C("Scrum.org Professional Scrum Master I", "Scrum.org", "Beginner", "~R3 000", "1–2 months", "Process", "https://www.scrum.org/assessments/professional-scrum-master-i-certification", ["Agile", "Scrum"]),
    ],
    jobs: [
      J("QA Engineer", H, "+10% YoY", 220, 550, 380),
      J("Test Automation Engineer", H, "+17% YoY", 320, 750, 520),
      J("SDET (Software Dev Engineer in Test)", H, "+16% YoY", 380, 850, 600),
      J("Performance Tester", ST, "+8% YoY", 320, 700, 500),
    ],
    prep: {
      cv: [
        T("Show defects found and prevented", "'Found 40+ defects before release, reducing production bugs by 30%' shows value better than 'tested software'."),
        T("List both manual and automation skills", "Name Selenium, Playwright, Postman, Jira and the languages you script in."),
        T("Add an automation project", "Automate tests for a public website or API and put the repo on GitHub with a clear README."),
      ],
      interview: [
        T("Expect 'how would you test this?'", "You may be given a login page or a lift. Cover happy paths, edge cases, errors, security and usability."),
        T("Explain a bug you reported", "Describe the steps to reproduce, expected vs actual result and how you worked with developers to fix it."),
        T("Know the testing basics", "Be ready on test levels, regression, smoke vs sanity, test case design and basic SQL."),
      ],
      jobsearch: [
        T("Search 'QA', 'Tester' and 'Automation'", "Banks, insurers and software houses in SA hire testers continuously, and many offer graduate programmes."),
        T("Move toward automation", "Automation and SDET roles pay more. Learn one language (Python, Java or JavaScript) and automate your day-to-day tests."),
      ],
    },
  },

  [DS]: {
    skills: [
      S("Python (pandas, NumPy, scikit-learn)", "Rising", "Data science", 95),
      S("Statistics & Probability", "Steady", "Foundations", 88),
      S("SQL & Data Analysis", "Steady", "Data", 86),
      S("Machine Learning", "Rising", "AI / ML", 90),
      S("Data Visualisation (Power BI / Tableau)", "Steady", "Analytics", 78),
      S("Communicating Insights", "Steady", "Soft skill", 74),
    ],
    certs: [
      C("IBM Data Science Professional Certificate", "IBM (Coursera)", "Beginner", "~R950 / mo", "5–8 months", "Data", "https://www.coursera.org/professional-certificates/ibm-data-science", ["Data science", "Python"]),
      C("Google Data Analytics Certificate", "Google (Coursera)", "Beginner", "~R950 / mo", "4–6 months", "Data", "https://www.coursera.org/professional-certificates/google-data-analytics", ["Analytics", "SQL"]),
      C("Azure Data Scientist Associate (DP-100)", "Microsoft", "Intermediate", "~R2 500", "2–4 months", "Data", "https://learn.microsoft.com/en-us/credentials/certifications/azure-data-scientist/", ["ML", "Azure"]),
    ],
    jobs: [
      J("Data Scientist", VH, "+24% YoY", 420, 1000, 720),
      J("Machine Learning Engineer", VH, "+28% YoY", 500, 1200, 830),
      J("Data Analyst", H, "+14% YoY", 250, 600, 420),
      J("BI / Insights Analyst", H, "+12% YoY", 280, 650, 450),
    ],
    prep: {
      cv: [
        T("Lead with a problem you solved", "'Built a model predicting churn with 84% accuracy, saving an estimated R200k a year' beats listing algorithms."),
        T("Link notebooks and projects", "Put 2–3 clean Jupyter or Kaggle projects on GitHub, each with a clear question, method and result."),
        T("Show you can explain results", "Add a dashboard or short write-up in plain English. Employers want insight, not only code."),
      ],
      interview: [
        T("Expect stats and ML fundamentals", "Be ready on overfitting, bias vs variance, train/test splits, evaluation metrics and when to use which model."),
        T("Practise SQL and Python", "Many data science interviews begin with SQL and a pandas exercise before the modelling questions."),
        T("Explain a project to a non-technical person", "Practise summarising the problem, method and business impact in two minutes."),
      ],
      jobsearch: [
        T("Start as a data analyst if needed", "Analyst roles are a common first step toward data science. Build up modelling skills on the side."),
        T("Look at banks, insurers and retail", "SA financial services and retailers run big analytics teams. Search 'Data Scientist', 'Data Analyst' and 'Machine Learning'."),
      ],
    },
  },

  [PM]: {
    skills: [
      S("Product Discovery & User Research", "Rising", "Product", 86),
      S("Roadmapping & Prioritisation", "Steady", "Strategy", 88),
      S("Agile / Scrum", "Steady", "Process", 84),
      S("Data & Metrics (analytics, SQL basics)", "Rising", "Analytics", 78),
      S("Stakeholder Communication", "Steady", "Soft skill", 90),
      S("Technical Literacy", "Steady", "Collaboration", 70),
    ],
    certs: [
      C("Google Project Management Certificate", "Google (Coursera)", "Beginner", "~R950 / mo", "4–6 months", "Product", "https://www.coursera.org/professional-certificates/google-project-management", ["Project mgmt", "Agile"]),
      C("Scrum.org Professional Scrum Master I", "Scrum.org", "Beginner", "~R3 000", "1–2 months", "Product", "https://www.scrum.org/assessments/professional-scrum-master-i-certification", ["Scrum", "Agile"]),
      C("PMI Certified Associate in Project Management (CAPM)", "PMI", "Beginner", "~R5 000", "2–3 months", "Product", "https://www.pmi.org/certifications/certified-associate-capm", ["Project mgmt"]),
    ],
    jobs: [
      J("Product Manager", H, "+12% YoY", 450, 1000, 700),
      J("Business Analyst", H, "+10% YoY", 300, 700, 480),
      J("Scrum Master / Delivery Manager", H, "+9% YoY", 350, 800, 560),
      J("Project Manager", ST, "+7% YoY", 350, 850, 580),
    ],
    prep: {
      cv: [
        T("Show outcomes, not tasks", "'Launched a feature that lifted sign-ups by 18%' shows product impact. List metrics you moved."),
        T("Describe how you prioritised", "Mention frameworks (RICE, MoSCoW) and how you balanced users, business and engineering effort."),
        T("Include a side project or case study", "Write up a product teardown or a small app you led. It proves product thinking when you have no title yet."),
      ],
      interview: [
        T("Expect product-sense questions", "'How would you improve this app?' Structure: user, problem, options, trade-offs, metric of success."),
        T("Prepare stakeholder stories", "Have examples of saying no, handling conflict between design and engineering, and managing a deadline."),
        T("Know how you use data", "Be ready to name the metrics you would track and how you would run a simple experiment."),
      ],
      jobsearch: [
        T("Move in from another tech role", "Many product managers start as business analysts, developers, designers or support leads. Take ownership of a feature."),
        T("Search associate and graduate PM roles", "Search 'Associate Product Manager', 'Business Analyst' and 'Product Owner' at SA banks, fintechs and software companies."),
      ],
    },
  },
};
