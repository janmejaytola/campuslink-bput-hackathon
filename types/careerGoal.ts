export interface SalaryPreference {
  minimum?: number;
  maximum?: number;
  openToMarketRange?: boolean;
}

export interface CareerGoal {
  targetRole: string;
  alternativeRoles?: string[];
  jobTypes?: string[];
  workModes?: string[];
  preferredLocations?: string[];
  salaryPreference?: SalaryPreference;
  interests?: string[];
  industries?: string[];
  customRole?: string;
  customInterests?: string[];
  updatedAt?: string;

  // Legacy compatibility fields
  jobType?: string;
  preferredLocation?: string;
  workMode?: string;
  expectedSalary?: string;
}

export const TARGET_ROLE_OPTIONS = [
  'Software Engineer',
  'Data Analyst',
  'Data Scientist',
  'Web Developer',
  'Full Stack Developer',
  'Cloud Engineer',
  'AI/ML Engineer',
  'DevOps Engineer',
  'Cybersecurity Engineer',
  'Database Administrator',
  'Business Analyst',
  'Other',
];

export const JOB_TYPE_OPTIONS = [
  'Full-time',
  'Internship',
  'Part-time',
  'Contract',
];

export const WORK_MODE_OPTIONS = [
  'On-site',
  'Hybrid',
  'Remote',
];

export const LOCATION_OPTIONS = [
  'Bhubaneswar',
  'Bengaluru',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Mumbai',
  'Delhi NCR',
  'Kolkata',
  'Anywhere in India',
  'Remote',
];

export const CAREER_INTERESTS_OPTIONS = [
  'Artificial Intelligence',
  'Machine Learning',
  'Web Development',
  'Mobile Development',
  'Cloud Computing',
  'Cybersecurity',
  'Data Analytics',
  'Data Science',
  'DevOps',
  'Blockchain',
  'Database Systems',
  'Software Engineering',
  'UI/UX',
];

export const INDUSTRY_OPTIONS = [
  'IT Services',
  'Product Companies',
  'FinTech',
  'HealthTech',
  'EdTech',
  'E-commerce',
  'SaaS',
  'Government / Public Sector',
  'Consulting',
  'Banking',
  'Manufacturing',
  'Telecom',
  'Other',
];

export const ROLE_FOCUS_AREAS: Record<string, string[]> = {
  'Software Engineer': [
    'Data Structures & Algorithms',
    'Object-Oriented Programming (Java/C++)',
    'Relational Databases & SQL',
    'Git Version Control & Code Hygiene',
    'System Design Fundamentals',
  ],
  'Data Analyst': [
    'Advanced SQL Queries & Joins',
    'Spreadsheet Modeling & Excel Analytics',
    'Python for Data Manipulation (Pandas)',
    'Business Intelligence (Power BI / Tableau)',
    'Descriptive & Inferential Statistics',
  ],
  'Data Scientist': [
    'Python & Scientific Libraries (NumPy, Scikit-Learn)',
    'Supervised & Unsupervised Machine Learning',
    'Probability, Statistics & Linear Algebra',
    'Feature Engineering & Data Preprocessing',
    'Model Evaluation & Metrics',
  ],
  'Web Developer': [
    'Modern JavaScript (ES6+) & TypeScript',
    'Responsive Layouts (Tailwind CSS, HTML5)',
    'Component Architecture (React / Next.js)',
    'RESTful API Integration & Client State',
    'Web Performance & Accessibility Standards',
  ],
  'Full Stack Developer': [
    'Frontend SPA Frameworks (React, Next.js)',
    'Server Runtime & APIs (Node.js, Express)',
    'Database Schema Design (PostgreSQL / MongoDB)',
    'Authentication, JWT & Security Best Practices',
    'Full Stack Deployment & CI/CD Pipelines',
  ],
  'Cloud Engineer': [
    'Linux System Administration & Shell Scripting',
    'Cloud Providers & Architecture (AWS / GCP / Azure)',
    'Containerization with Docker',
    'Computer Networking & VPC Configuration',
    'Infrastructure Automation & Terraform Basics',
  ],
  'AI/ML Engineer': [
    'Python & Deep Learning Frameworks (PyTorch / TensorFlow)',
    'Transformer Architectures & Generative AI',
    'High-Performance Model Fine-tuning',
    'MLOps, Model Registry & Pipeline Deployment',
    'Data Vectorization & Vector Databases',
  ],
};
