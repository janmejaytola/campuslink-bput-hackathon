import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { RecruiterJob } from '@/types/job';
import { StudentProfile, ProjectItem, CertificationItem, InternshipItem } from '@/types/student';
import { EligibilityEvaluation } from '@/types/eligibility';
import { CandidateMatchResult, RankedCandidate } from '@/types/matching';
import { calculateMatchScore, rankEligibleCandidates } from './matchingEngine';
import { evaluateEligibility } from './eligibilityEngine';
import { studentService } from './studentService';
import { jobService } from './jobService';

/**
 * Standard Synthetic Demo Candidate Pool used for testing and offline development
 * across BPUT Engineering disciplines (Batch 2026).
 */
export const SYNTHETIC_DEMO_CANDIDATE_POOL: Array<{
  student: StudentProfile;
  projects: ProjectItem[];
  certifications: CertificationItem[];
  internships: InternshipItem[];
}> = [
  {
    student: {
      uid: 'std_priyanshu_mohanty',
      fullName: 'Priyanshu Mohanty',
      email: 'priyanshu.m@bput.ac.in',
      phone: '+91 98765 43210',
      dateOfBirth: '2004-05-14',
      gender: 'Male',
      bputRegistrationNumber: '2201090123',
      college: 'Silicon Institute of Technology, Bhubaneswar',
      department: 'Computer Science & Engineering',
      branch: 'Computer Science and Engineering',
      semester: '7th Semester',
      graduationYear: '2026',
      cgpa: 8.85,
      backlogs: 0,
      skills: ['Python', 'SQL', 'Data Structures', 'Java', 'Git', 'AWS'],
      skillProficiencies: {
        Python: 92,
        SQL: 88,
        'Data Structures': 85,
        Java: 80,
        Git: 84,
        AWS: 78,
      },
      careerGoal: {
        targetRole: 'Software Engineer',
        preferredLocation: 'Bengaluru, Bhubaneswar, Hyderabad',
        workMode: 'Hybrid',
      },
      readinessInputs: { aptitudeScore: 88, technicalScore: 92, communicationScore: 85 },
      profileCompletion: 95,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    projects: [
      {
        id: 'proj_p1',
        title: 'Microservices Payment Gateway Integration',
        description: 'Developed scalable Python backend REST services and SQL database transaction pooling.',
        technologies: ['Python', 'SQL', 'PostgreSQL', 'Docker'],
        role: 'Lead Backend Developer',
        createdAt: '2025-11-01T00:00:00Z',
        updatedAt: '2025-11-01T00:00:00Z',
      },
    ],
    certifications: [
      {
        id: 'cert_p1',
        name: 'AWS Certified Cloud Practitioner',
        issuingOrganization: 'Amazon Web Services',
        issueDate: '2025-10-15',
        createdAt: '2025-10-15T00:00:00Z',
        updatedAt: '2025-10-15T00:00:00Z',
      },
    ],
    internships: [
      {
        id: 'intern_p1',
        company: 'Fintech Nexus Labs',
        role: 'Software Development Intern',
        startDate: '2025-05-01',
        endDate: '2025-08-31',
        description: 'Built high-throughput payment microservices in Python and SQL.',
        skillsUsed: ['Python', 'SQL', 'Git'],
        createdAt: '2025-09-01T00:00:00Z',
        updatedAt: '2025-09-01T00:00:00Z',
      },
    ],
  },
  {
    student: {
      uid: 'std_aarav_mohapatra',
      fullName: 'Aarav Mohapatra',
      email: 'aarav.m@bput.ac.in',
      phone: '+91 98765 11111',
      dateOfBirth: '2004-03-22',
      gender: 'Male',
      bputRegistrationNumber: '2201106284',
      college: 'College of Engineering & Technology (OUTR)',
      department: 'Computer Science & Engineering',
      branch: 'Computer Science and Engineering',
      semester: '7th Semester',
      graduationYear: '2026',
      cgpa: 8.82,
      backlogs: 0,
      skills: ['Python', 'Java', 'SQL', 'React', 'Docker'],
      skillProficiencies: {
        Python: 86,
        Java: 84,
        SQL: 80,
        React: 75,
        Docker: 70,
      },
      careerGoal: {
        targetRole: 'Software Engineer',
        preferredLocation: 'Bengaluru, Pune',
        workMode: 'Hybrid',
      },
      readinessInputs: { aptitudeScore: 84, technicalScore: 85, communicationScore: 82 },
      profileCompletion: 90,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    projects: [
      {
        id: 'proj_a1',
        title: 'Distributed Log Processing Pipeline',
        description: 'Engineered Python asynchronous consumer service with SQL persistent store.',
        technologies: ['Python', 'SQL', 'Docker'],
        role: 'Backend Engineer',
        createdAt: '2025-12-01T00:00:00Z',
        updatedAt: '2025-12-01T00:00:00Z',
      },
    ],
    certifications: [],
    internships: [
      {
        id: 'intern_a1',
        company: 'Tata Consultancy Services',
        role: 'Systems Intern',
        startDate: '2025-06-01',
        endDate: '2025-08-01',
        description: 'Built enterprise workflow backend modules.',
        skillsUsed: ['Python', 'SQL'],
        createdAt: '2025-08-15T00:00:00Z',
        updatedAt: '2025-08-15T00:00:00Z',
      },
    ],
  },
  {
    student: {
      uid: 'std_priyanka_das',
      fullName: 'Priyanka Das',
      email: 'priyanka.d@bput.ac.in',
      phone: '+91 98765 22222',
      dateOfBirth: '2004-08-19',
      gender: 'Female',
      bputRegistrationNumber: '2201106190',
      college: 'Silicon Institute of Technology, Bhubaneswar',
      department: 'Information Technology',
      branch: 'Information Technology',
      semester: '7th Semester',
      graduationYear: '2026',
      cgpa: 9.15,
      backlogs: 0,
      skills: ['Python', 'SQL', 'Data Structures', 'Machine Learning', 'AWS'],
      skillProficiencies: {
        Python: 90,
        SQL: 85,
        'Data Structures': 88,
        'Machine Learning': 85,
        AWS: 82,
      },
      careerGoal: {
        targetRole: 'Data Analyst',
        alternativeRoles: ['Software Engineer'],
        preferredLocation: 'Bengaluru, Hyderabad',
        workMode: 'Hybrid',
      },
      readinessInputs: { aptitudeScore: 92, technicalScore: 90, communicationScore: 94 },
      profileCompletion: 92,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    projects: [
      {
        id: 'proj_pd1',
        title: 'BPUT Academic Performance Predictor',
        description: 'Data analytics model analyzing semester examination trends using Python and SQL.',
        technologies: ['Python', 'SQL', 'Pandas', 'Scikit-learn'],
        role: 'Data Analyst',
        createdAt: '2025-10-10T00:00:00Z',
        updatedAt: '2025-10-10T00:00:00Z',
      },
    ],
    certifications: [
      {
        id: 'cert_pd1',
        name: 'AWS Certified Solutions Architect Associate',
        issuingOrganization: 'Amazon Web Services',
        issueDate: '2025-09-01',
        createdAt: '2025-09-01T00:00:00Z',
        updatedAt: '2025-09-01T00:00:00Z',
      },
    ],
    internships: [
      {
        id: 'intern_pd1',
        company: 'Deloitte USI',
        role: 'Data Analytics Intern',
        startDate: '2025-05-15',
        endDate: '2025-07-31',
        description: 'Analyzed enterprise metrics and automated SQL data ingestion pipelines.',
        skillsUsed: ['Python', 'SQL', 'AWS'],
        createdAt: '2025-08-01T00:00:00Z',
        updatedAt: '2025-08-01T00:00:00Z',
      },
    ],
  },
  {
    student: {
      uid: 'std_rohan_tripathy',
      fullName: 'Rohan Tripathy',
      email: 'rohan.t@bput.ac.in',
      phone: '+91 98765 33333',
      dateOfBirth: '2003-12-10',
      gender: 'Male',
      bputRegistrationNumber: '2201106312',
      college: 'C.V. Raman Global University, Bhubaneswar',
      department: 'Electronics & Communication',
      branch: 'Electronics & Communication Engineering',
      semester: '7th Semester',
      graduationYear: '2026',
      cgpa: 7.94,
      backlogs: 0,
      skills: ['Python', 'C++', 'Git', 'Data Structures'],
      skillProficiencies: {
        Python: 75,
        'C++': 80,
        SQL: 50,
        'Data Structures': 70,
        Git: 70,
      },
      careerGoal: {
        targetRole: 'Software Engineer',
        preferredLocation: 'Bhubaneswar, Bengaluru',
        workMode: 'On-site',
      },
      readinessInputs: { aptitudeScore: 76, technicalScore: 78, communicationScore: 75 },
      profileCompletion: 80,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    projects: [
      {
        id: 'proj_r1',
        title: 'IoT Telemetry Gateway',
        description: 'Embedded Linux gateway forwarding sensor packets via Python sockets.',
        technologies: ['Python', 'C++', 'Linux'],
        role: 'Firmware Developer',
        createdAt: '2025-09-01T00:00:00Z',
        updatedAt: '2025-09-01T00:00:00Z',
      },
    ],
    certifications: [],
    internships: [],
  },
  {
    student: {
      uid: 'std_sneha_nayak',
      fullName: 'Sneha Nayak',
      email: 'sneha.n@bput.ac.in',
      phone: '+91 98765 44444',
      dateOfBirth: '2004-04-12',
      gender: 'Female',
      bputRegistrationNumber: '2201106405',
      college: 'Silicon Institute of Technology, Bhubaneswar',
      department: 'Computer Science & Engineering',
      branch: 'Computer Science and Engineering',
      semester: '7th Semester',
      graduationYear: '2026',
      cgpa: 8.45,
      backlogs: 0,
      skills: ['Python', 'SQL', 'Java', 'Data Structures', 'Spring Boot'],
      skillProficiencies: {
        Python: 80,
        SQL: 78,
        Java: 85,
        'Data Structures': 80,
        'Spring Boot': 75,
      },
      careerGoal: {
        targetRole: 'Full Stack Developer',
        alternativeRoles: ['Software Engineer'],
        preferredLocation: 'Bengaluru, Hyderabad',
        workMode: 'Hybrid',
      },
      readinessInputs: { aptitudeScore: 81, technicalScore: 83, communicationScore: 80 },
      profileCompletion: 88,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    projects: [
      {
        id: 'proj_s1',
        title: 'Campus Placement Portal API',
        description: 'Microservices architecture with Spring Boot, Python scripts, and PostgreSQL.',
        technologies: ['Java', 'Spring Boot', 'Python', 'SQL'],
        role: 'Full Stack Developer',
        createdAt: '2025-11-15T00:00:00Z',
        updatedAt: '2025-11-15T00:00:00Z',
      },
    ],
    certifications: [],
    internships: [
      {
        id: 'intern_s1',
        company: 'Infocity Tech Labs',
        role: 'Full Stack Intern',
        startDate: '2025-06-01',
        endDate: '2025-08-15',
        description: 'Full stack development with Spring and Python services.',
        skillsUsed: ['Java', 'Python', 'SQL'],
        createdAt: '2025-08-20T00:00:00Z',
        updatedAt: '2025-08-20T00:00:00Z',
      },
    ],
  },
  {
    // Deliberate Ineligible Candidate: CGPA 6.40 (below common 7.0 / 7.5 cutoffs) with high skill levels
    student: {
      uid: 'std_ineligible_gated',
      fullName: 'Vikramaditya Samal',
      email: 'vikram.s@bput.ac.in',
      phone: '+91 98765 55555',
      dateOfBirth: '2003-11-05',
      gender: 'Male',
      bputRegistrationNumber: '2201106999',
      college: 'Indira Gandhi Institute of Technology (IGIT), Sarang',
      department: 'Mechanical Engineering',
      branch: 'Mechanical Engineering', // Fails CS/IT branch filter
      semester: '7th Semester',
      graduationYear: '2026',
      cgpa: 6.4, // Fails 7.0 cutoff
      backlogs: 2, // Fails 0 backlog rule
      skills: ['Python', 'SQL', 'Data Structures', 'Linux'],
      skillProficiencies: {
        Python: 95,
        SQL: 90,
        'Data Structures': 90,
        Linux: 85,
      },
      careerGoal: {
        targetRole: 'Software Engineer',
        preferredLocation: 'Bengaluru',
        workMode: 'Hybrid',
      },
      readinessInputs: { aptitudeScore: 70, technicalScore: 92, communicationScore: 68 },
      profileCompletion: 85,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    projects: [
      {
        id: 'proj_v1',
        title: 'Automated Trading Engine',
        description: 'High-frequency algorithmic trading system in Python and SQL.',
        technologies: ['Python', 'SQL', 'PostgreSQL'],
        role: 'Backend Architect',
        createdAt: '2025-10-01T00:00:00Z',
        updatedAt: '2025-10-01T00:00:00Z',
      },
    ],
    certifications: [],
    internships: [],
  },
];

export const matchingService = {
  /**
   * Evaluates match score for a single candidate against a job position.
   * Runs Eligibility Engine first, enforcing the ELIGIBILITY GATE.
   */
  evaluateCandidate(params: {
    student: Partial<StudentProfile>;
    job: Partial<RecruiterJob>;
    projects?: ProjectItem[];
    certifications?: CertificationItem[];
    internships?: InternshipItem[];
  }): CandidateMatchResult {
    const { student, job, projects = [], certifications = [], internships = [] } = params;

    // 1. Evaluate mandatory eligibility
    const eligibilityResult = evaluateEligibility({
      student,
      job,
      certifications,
      internships,
    });

    // 2. Compute deterministic match score
    return calculateMatchScore({
      student,
      job,
      eligibilityResult,
      projects,
      certifications,
      internships,
    });
  },

  /**
   * Retrieves and ranks all candidate matches for a recruiter's job position.
   * Only includes verified eligible candidates in the final ranked shortlist.
   */
  async getJobMatches(jobId: string): Promise<{
    job: RecruiterJob | null;
    rankedEligible: RankedCandidate[];
    ineligibleGated: CandidateMatchResult[];
    totalEvaluated: number;
    averageScore: number;
    topScore: number;
    highMatchCount: number;
    isSyntheticPool: boolean;
  }> {
    const job = await jobService.getJobById(jobId);
    if (!job) {
      throw new Error(`Job position '${jobId}' not found.`);
    }

    // Determine candidate pool: load from synthetic demo dataset
    const candidatePool = SYNTHETIC_DEMO_CANDIDATE_POOL;

    const allEvaluated: CandidateMatchResult[] = [];

    for (const cand of candidatePool) {
      const match = this.evaluateCandidate({
        student: cand.student,
        job,
        projects: cand.projects,
        certifications: cand.certifications,
        internships: cand.internships,
      });
      allEvaluated.push(match);
    }

    // Deterministically rank eligible candidates
    const rankedEligible = rankEligibleCandidates(allEvaluated);
    const ineligibleGated = allEvaluated.filter((c) => !c.eligible || !c.rankingEligible);

    const eligibleScores = rankedEligible.map((c) => c.score);
    const averageScore = eligibleScores.length > 0
      ? Math.round((eligibleScores.reduce((a, b) => a + b, 0) / eligibleScores.length) * 10) / 10
      : 0;
    const topScore = eligibleScores.length > 0 ? Math.max(...eligibleScores) : 0;
    const highMatchCount = rankedEligible.filter((c) => c.score >= 80).length;

    return {
      job,
      rankedEligible,
      ineligibleGated,
      totalEvaluated: allEvaluated.length,
      averageScore,
      topScore,
      highMatchCount,
      isSyntheticPool: true,
    };
  },

  /**
   * Retrieves job match evaluations for a student against all OPEN campus openings.
   */
  async getStudentMatches(studentUid: string): Promise<CandidateMatchResult[]> {
    if (!studentUid) return [];

    // Load student profile & dossier
    let student = await studentService.getStudentProfile(studentUid);
    let projects: ProjectItem[] = [];
    let certs: CertificationItem[] = [];
    let internships: InternshipItem[] = [];

    if (student) {
      [projects, certs, internships] = await Promise.all([
        studentService.getProjects(studentUid),
        studentService.getCertifications(studentUid),
        studentService.getInternships(studentUid),
      ]);
    } else {
      // Fallback: Use baseline student if student profile has not yet been filled
      student = SYNTHETIC_DEMO_CANDIDATE_POOL[0].student;
      projects = SYNTHETIC_DEMO_CANDIDATE_POOL[0].projects;
      certs = SYNTHETIC_DEMO_CANDIDATE_POOL[0].certifications;
      internships = SYNTHETIC_DEMO_CANDIDATE_POOL[0].internships;
    }

    // Load OPEN jobs from Firestore
    let openJobs = await jobService.getOpenJobs();

    // Fallback: If no open jobs in Firestore yet, provide baseline benchmark jobs
    if (openJobs.length === 0) {
      openJobs = [
        {
          id: 'job_benchmark_tcs',
          recruiterId: 'rec_tcs',
          title: 'Digital Software Engineer (Full Stack)',
          company: 'Tata Consultancy Services',
          description: 'Responsible for modern enterprise microservices, cloud deployments, and resilient backend architectures with Python and SQL.',
          location: 'Bhubaneswar / Hyderabad / Pune',
          workMode: 'HYBRID',
          employmentType: 'FULL_TIME',
          status: 'OPEN',
          salaryMin: 9.0,
          salaryMax: 11.5,
          openings: 25,
          applicationDeadline: '2026-10-30',
          eligibility: {
            minCgpa: 7.5,
            maxBacklogs: 0,
            graduationYears: ['2026'],
            branches: ['Computer Science and Engineering', 'Information Technology', 'Electronics & Communication Engineering'],
            minExperienceMonths: 0,
            requiredCertifications: [],
          },
          requiredSkills: [
            { name: 'Python', requiredLevel: 80 },
            { name: 'SQL', requiredLevel: 70 },
          ],
          preferredSkills: [
            { name: 'AWS', preferredLevel: 60 },
            { name: 'Docker', preferredLevel: 50 },
          ],
          jdSource: 'MANUAL',
          aiParsed: false,
          createdAt: '2026-09-01T00:00:00Z',
          updatedAt: '2026-09-01T00:00:00Z',
        },
        {
          id: 'job_benchmark_deloitte',
          recruiterId: 'rec_deloitte',
          title: 'Associate Cloud Consultant',
          company: 'Deloitte USI',
          description: 'Design, develop, and automate enterprise migration to cloud environments with infrastructure-as-code and cloud foundations.',
          location: 'Bengaluru / Hyderabad',
          workMode: 'HYBRID',
          employmentType: 'FULL_TIME',
          status: 'OPEN',
          salaryMin: 8.6,
          salaryMax: 9.2,
          openings: 15,
          applicationDeadline: '2026-10-25',
          eligibility: {
            minCgpa: 7.0,
            maxBacklogs: 0,
            graduationYears: ['2026'],
            branches: ['Computer Science and Engineering', 'Information Technology', 'Electronics & Communication Engineering'],
            minExperienceMonths: 0,
            requiredCertifications: [],
          },
          requiredSkills: [
            { name: 'Python', requiredLevel: 75 },
            { name: 'SQL', requiredLevel: 65 },
          ],
          preferredSkills: [
            { name: 'AWS', preferredLevel: 70 },
          ],
          jdSource: 'MANUAL',
          aiParsed: false,
          createdAt: '2026-09-01T00:00:00Z',
          updatedAt: '2026-09-01T00:00:00Z',
        },
      ];
    }

    const matches: CandidateMatchResult[] = [];
    for (const job of openJobs) {
      const match = this.evaluateCandidate({
        student,
        job,
        projects,
        certifications: certs,
        internships,
      });
      matches.push(match);
    }

    // Sort: Eligible first, then descending match score
    matches.sort((a, b) => {
      if (a.eligible !== b.eligible) {
        return a.eligible ? -1 : 1;
      }
      return b.score - a.score;
    });

    return matches;
  },

  /**
   * Caches a match result to Firestore at students/{studentId}/jobMatches/{jobId}.
   */
  async cacheMatchResult(match: CandidateMatchResult): Promise<void> {
    if (!match.studentId || !match.jobId || typeof window === 'undefined' || !db) return;

    try {
      const docRef = doc(db, 'students', match.studentId, 'jobMatches', match.jobId);
      await setDoc(docRef, match, { merge: true });
    } catch (err) {
      console.warn('[Cache match result warning]:', err);
    }
  },
};
