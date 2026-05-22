const portfolioData = {
    "hero": {
        "name": "Venkatesh Krishnan",
        "title": "AI Product Manager",
        "subtitle": "AI Product Manager | AI Strategy & Platform Architecture",
    },
    "settings": {
        "ui_version": "v0.5"
    },
    "about": {
        "summary": "Senior AI Product Manager & AI Strategist with 8+ years of technical leadership and architectural expertise driving end-to-end product strategy, GTM execution, and business impact for enterprise AI/ML solutions. Proven track record of aligning product vision with deep technical intuition to deploy low-latency, cost-optimized AI systems that solve complex business friction and accelerate user growth.",
        "stats": [
            { "label": "Years Experience", "value": 8.9, "suffix": "+" },
            { "label": "AI Products Designed", "value": 5, "suffix": "" },
            { "label": "Tech Stacks Mastered", "value": 12, "suffix": "+" }
        ]
    },
    "experience": [
        {
            "role": "Senior Engineering Lead & AI Product Owner",
            "company": "Persistent Systems",
            "date": "Oct '24 – Present",
            "points": [
                "Product Strategy & Launch: Led the product strategy, cross-functional engineering, and global rollout of an AI-driven Voice-Input (Speech-to-Text) feature, reducing field engineer documentation friction, cutting time-on-task by 3x, and boosting daily report completion rates by 15%.",
                "Global Rollout & Compliance: Designed the internationalization (i18n) and localization roadmap across US, Europe, Asia, and LATAM, resolving accent variability (yielding a 92% StT accuracy rate) and regional data compliance constraints.",
                "Stakeholder & Adoption Management: Partnered with Product Operations and Customer Success to design training programs and manage change resistance, driving user adoption of voice-assisted capture over legacy manual entry workflows (converting 80% of active users within 90 days)."
            ]
        },
        {
            "role": "Solution Architect & Technical Product Lead",
            "company": "NSR Technologies",
            "date": "Apr '23 – Oct '23",
            "points": [
                "Feature Product Management: Led product definition, PRD creation, and execution as de-facto Product Manager for a Bluetooth-enabled inventory tracking workflow, streamlining stock management across enterprise retail platforms.",
                "Roadmap Prioritization: Collaborated with the CTO and SVP of Product to align technical integration paths with the product roadmap, evaluating trade-offs to build a proprietary lightweight architecture, reducing dependence on high-cost third-party libraries and accelerating time-to-market by 2 months.",
                "Lifecycle Ownership: Owned the end-to-end product lifecycle from customer discovery and PRD creation through cross-functional engineering delivery and deployment."
            ]
        },
        {
            "role": "Lead Software Engineer & Technical PM Lead",
            "company": "Utthunga Technologies",
            "date": "Nov '22 – Mar '23",
            "points": [
                "Product Roadmap Direction: Directed the cross-platform mobile product roadmap (.NET MAUI) for an IoT-enabled motor health tool, optimizing time-to-market for a Fortune 500 client.",
                "Platform Standardization: Standardized platform architecture by productizing a unified Drive Control Library, accelerating feature development velocity and reducing engineering duplication by 30%.",
                "Data-Driven Decisions: Conducted usability and performance metrics analysis, delivering data-driven strategic options that guided the client's executive leadership in mobile roadmap prioritization."
            ]
        },
        {
            "role": "Senior Consultant & Technical Advisory",
            "company": "Neudesic Technologies",
            "date": "Mar '22 – Nov '22",
            "points": [
                "Technical consulting and engineering implementation for enterprise clients, evaluating product integration strategies."
            ]
        },
        {
            "role": "Senior Technology Consultant & Feature Owner",
            "company": "Saviant Consulting",
            "date": "May '18 – Jul '21",
            "points": [
                "Service Booking Platform (Middle East Conglomerate): Defined customer journey maps and checkout funnels for a ground-up rebuild of a legacy service booking platform, optimizing service discovery and increasing booking conversion.",
                "US Grocery Operations (Mobile Product): Rebuilt a legacy web order system into a modern mobile application, defining real-time order visibility and push notification alerts to reduce fulfillment errors and boost customer satisfaction."
            ]
        },
        {
            "role": "Senior Software Engineer",
            "company": "Affluent Global Services",
            "date": "Nov '17 – May '18",
            "points": [
                "Microsoft Engagement: Worked as an Onsite vendor consultant for the Microsoft Global Delivery Team, developing specialized B2B modules using Xamarin.Android. Managed delivery milestones and B2B requirements.",
                "Module Delivery: Delivered high-performance mobile modules for enterprise clients, ensuring strict adherence to Microsoft's coding guidelines."
            ]
        },
        {
            "role": "Senior Software Engineer",
            "company": "Silfra Technologies",
            "date": "Jun '17 – Oct '17",
            "points": [
                "IoT Product Development: Spearheaded the development of the 'Silfra Aqua Meter' native Android application, translating real-time water tracking IoT hardware streams into user-facing dashboard features.",
                "Cloud Integration: Implemented NoSQL architecture using Google Firebase to handle real-time data streams from IoT devices."
            ]
        },
        {
            "role": "Software Developer",
            "company": "Channel Bridge Software Labs",
            "date": "Jun '15 – Jun '17",
            "points": [
                "Fintech Innovation: Integrated Optical Character Recognition (OCR) technology into a payment processing application to automate data entry, reducing transaction friction. Managed app store deployment lifecycles.",
                "App Lifecycle: Managed the complete mobile application lifecycle from development to testing and distribution on the Google Play Store."
            ]
        }
    ],
    "projects": [
        {
            "title": "Voice of Customer (VoC) Intelligence",
            "domain": "Sentiment Analysis / CX",
            "problem": "Reliance on survey data masked 'Silent Churn', risking $7.5M/yr. Used customer discovery and RICE prioritization to design real-time sentiment alerts.",
            "solution": "Productized a CX platform utilizing a fine-tuned NLP model. Selected a custom-hosted small model over general LLM APIs to cut inference costs by 90%, keep latency under 50ms, and automate CRM action workflows.",
            "metrics": "Projected $750k annual revenue retention and projected reduction in churn detection time from 14 days to <24 hours.",
            "link": "https://github.com/volcano619/voc-sentiment-analytics"
        },
        {
            "title": "Workforce Agility Engine",
            "domain": "Recommender Systems / HR Tech",
            "problem": "High external recruitment costs and slow time-to-staff (3-6 months) causing resource bottlenecks. Led customer discovery with HR heads to align recommendations with mobility policies.",
            "solution": "Designed a hybrid recommender system (Collaborative Filtering + Knowledge Graph) resolving the 'cold-start' problem. Implemented model explainability and bias-audit frameworks to ensure compliance.",
            "metrics": "Projecting ~$565k savings per restructuring event and a 70% reduction in time-to-staff.",
            "link": "https://github.com/volcano619/career-learning-recommender"
        },
        {
            "title": "Automated Support System",
            "domain": "RAG / Enterprise IT",
            "problem": "Seasonal L1 ticket surges (30k/mo) overwhelmed IT staff ($20/ticket). Conducted a Build vs. Buy analysis comparing commercial SaaS chatbots vs. an in-house build.",
            "solution": "Architected a Tier-0 RAG Assistant using a quantized local LLM to guarantee 100% FERPA data privacy and eliminate token costs. Designed fallback UX loops to handle hallucinations.",
            "metrics": "Projected to automate 5,000 L1 tickets/mo at 85% lower cost ($2/ticket), saving $1.08M annually.",
            "link": "https://github.com/volcano619/ai-support-rag-system"
        },
        {
            "title": "Hybrid Energy Demand Forecasting",
            "domain": "Time-Series Forecasting / Utilities",
            "problem": "Grid operators face $20B+ in losses due to forecast errors. Collaborated with operators to establish trust in AI, defining explainability as a core product requirement.",
            "solution": "Designed a Hybrid forecasting engine combining LSTM (accuracy) with Prophet (explainability). Custom-designed the loss function to penalize under-forecasting 10x more to prevent blackouts.",
            "metrics": "Modeled a 50% reduction in forecast error; projected $28M annual grid savings.",
            "link": "https://github.com/volcano619/energy-demand-forecaster"
        },
        {
            "title": "Industrial Visual Inspection System",
            "domain": "Computer Vision / Manufacturing",
            "problem": "Manual inspection had an 80% accuracy ceiling, risking high-cost recalls ($5M+ risk). Managed release process via shadow deployment on live production cameras.",
            "solution": "Deployed an Edge-AI CV system optimized via TensorRT for low latency. Tuned model threshold for High Recall (>99%) to minimize missed defect escapes, backed by an operator quick-verification workflow.",
            "metrics": "Modeled a 50x increase in throughput and 95% reduction in missed defects (2.7x Year-1 ROI).",
            "link": "https://github.com/volcano619/manufacturing-defect-detector"
        }
    ],
    "training": [
        {
            "title": "Director-Level AI PM Strategic Analysis",
            "score": "9.7/10 Elite",
            "focus": "Portfolio Management, People Leadership, Executive Presence & Crisis Comm",
            "summary": "Detailed strategic analysis of fintech portfolio reallocation, crisis leadership during AI model failure, and executive stakeholder alignment.",
            "link": "https://github.com/volcano619/AIProductDirectorArtifact/tree/main"
        },
        {
            "title": "AI Product Manager Operational Analysis",
            "score": "9.5/10 Senior PM",
            "focus": "Product Strategy, Stakeholder Navigation, Systems Design, LLM Cost-Benefit",
            "summary": "Comprehensive analysis of strategic trade-off management, cost-benefit support automation, and product vision for GenAI agents.",
            "link": "https://github.com/volcano619/ProductManagerArtifact/tree/main"
        }
    ],
    "skills": {
        "Product Leadership": ["Product Strategy & Vision", "Roadmap Prioritization (RICE)", "Go-To-Market (GTM) Strategy", "User Journey Mapping", "PRD Writing", "Build vs. Buy Analysis", "Cross-Functional Team Leadership"],
        "AI/ML Platform Strategy": ["LLM Fine-Tuning & RAG", "MLOps Lifecycle", "Model Evaluation Metrics (Precision/Recall/F1/MAPE)", "AI Ethics & Bias Audits", "Natural Language Processing (NLP)", "Computer Vision", "Time-Series Forecasting"],
        "Technical Core": ["System Architecture", "Cloud Platforms (Azure/GCP)", "Edge AI Optimization", "Microservices", "API Integrations", "Python", "SQL", "Google Firebase"]
    },
    "education": [
        { "degree": "M.S. Business Analytics", "school": "University of Colorado Boulder", "year": "2026-2027" },
        { "degree": "PGCert AI & ML", "school": "UT Austin / Great Learning", "year": "2023" },
        { "degree": "B.Tech. / BE", "school": "Vishwakarma Inst. of Info Tech", "year": "2015" }
    ],
    "certifications": [
        "Build, Train and Deploy ML Models with Keras on Google Cloud (Official Google Cloud Cert.)",
        "Natural Language Processing on Google Cloud (Official Google Cloud Cert.)",
        "Integrate Vertex AI Search and Conversation into Voice and Chat Apps (Official Google Cloud Cert.)",
        "Text Prompt Engineering Techniques Skill (Official Google Cloud Cert.)",
        "Machine Learning Operations (MLOps) with Vertex AI: Manage Features (Official Google Cloud Cert.)",
        "Machine Learning Operations (MLOps): Getting Started (Official Google Cloud Cert.)",
        "Production Machine Learning Systems (Official Google Cloud Cert.)",
        "Recommendation Systems on Google Cloud (Official Google Cloud Cert.)",
        "Agile PM 301 - Mastering Agile Project Management",
        "Complete Agile Scrum Management + Kanban"
    ],
    "volunteering": [
        {
            "role": "Super Moderator (Beta Team)",
            "org": "Xiaomi MIUI Official Forum (Beijing, China)",
            "date": "Oct '14 – Mar '16",
            "points": [
                "Community Product Leadership: Led the Beta Testing Team, prioritizing 500+ bug reports for developers. Acted as a strategic bridge between the user community and engineering, directly influencing feature stability and UX improvements.",
                "Team Management: Recruited and managed a volunteer moderation team; facilitated conflict resolution and ensured adherence to forum policies for a global user base.",
                "Recognition: Awarded 'Best Super Moderator of the Year 2015' for outstanding contribution to community health and product quality."
            ]
        },
        {
            "role": "Research Engineering Intern",
            "org": "Tata Institute of Fundamental Research (TIFR)",
            "date": "May '13 – May '14",
            "points": [
                "Scientific Instrumentation: Optimized a Multi-Channel High Voltage Data Acquisition System for cosmic ray research. Enhanced PCB reliability to withstand high-altitude environmental variations.",
                "Data Protocol Analysis: Analyzed and improved the communication protocol for data transfer between the high-voltage system and logging apparatus, ensuring data integrity for critical scientific experiments."
            ]
        },
        {
            "role": "Engineering Lead (Final Year Research)",
            "org": "University of Pune",
            "date": "May '14 – May '15",
            "points": [
                "System Architecture: Architected a TCP/IP-based control system for a Two Dish Solar Interferometer. Replaced a legacy control system with a modern Raspberry Pi + Motor Driver solution.",
                "Hardware Design: Engineered a production-ready PCB with SMD components to handle higher output currents, significantly improving the system's operational efficiency and tracking accuracy."
            ]
        }
    ],
    "social": {
        "linkedin": "https://www.linkedin.com/in/venkatesh-krishnan-35353535v/",
        "github": "https://github.com/volcano619",
        "email": "mailto:svenkatesh0635@gmail.com",
        "phone": "tel:+919922436937"
    }
};

if (typeof window !== 'undefined') {
    window.portfolioData = portfolioData;
}
