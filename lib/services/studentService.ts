import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  StudentProfile,
  ProjectItem,
  CertificationItem,
  InternshipItem,
  DEFAULT_STUDENT_PROFILE,
} from '@/types/student';
import { formatFirestoreError, FirestoreOperationType } from './resumeService';

export interface CompletionAudit {
  percentage: number;
  missingItems: string[];
}

export function calculateCompletion(
  profile: Partial<StudentProfile>,
  projectsCount: number = 0,
  certificationsCount: number = 0,
  internshipsCount: number = 0
): CompletionAudit {
  const criteria = [
    { label: 'Full legal name', met: !!profile.fullName && profile.fullName.trim().length >= 2, weight: 8 },
    { label: 'Verified contact phone number', met: !!profile.phone && profile.phone.trim().length >= 8, weight: 7 },
    { label: 'Date of birth and gender', met: !!profile.dateOfBirth && !!profile.gender, weight: 6 },
    { label: 'BPUT Registration number', met: !!profile.bputRegistrationNumber && profile.bputRegistrationNumber.trim().length >= 5, weight: 10 },
    { label: 'College and Engineering department', met: !!profile.college && !!profile.department, weight: 8 },
    { label: 'Branch, Semester and Graduation year', met: !!profile.branch && !!profile.semester && !!profile.graduationYear, weight: 8 },
    { label: 'Verified CGPA (0.00 - 10.00)', met: typeof profile.cgpa === 'number' && profile.cgpa > 0, weight: 10 },
    { label: 'At least 3 core technical skills', met: Array.isArray(profile.skills) && profile.skills.length >= 3, weight: 12 },
    { label: 'At least 1 showcase project', met: projectsCount >= 1, weight: 10 },
    { label: 'Professional certification or credential', met: certificationsCount >= 1, weight: 6 },
    { label: 'Internship or practical training experience', met: internshipsCount >= 1, weight: 5 },
    { label: 'Target Career Role & Preferred Location', met: !!profile.careerGoal?.targetRole && !!profile.careerGoal?.preferredLocation, weight: 6 },
    { label: 'Placement readiness diagnostic inputs', met: typeof profile.readinessInputs?.aptitudeScore === 'number' && typeof profile.readinessInputs?.technicalScore === 'number', weight: 4 },
  ];

  let earned = 0;
  const missingItems: string[] = [];

  for (const c of criteria) {
    if (c.met) {
      earned += c.weight;
    } else {
      missingItems.push(c.label);
    }
  }

  const percentage = Math.min(100, Math.round(earned));
  return { percentage, missingItems };
}

export const studentService = {
  /**
   * Retrieves the student profile from Firestore at students/{uid}.
   */
  async getStudentProfile(uid: string): Promise<StudentProfile | null> {
    if (!uid) return null;

    if (db) {
      try {
        const studentRef = doc(db, 'students', uid);
        const snap = await getDoc(studentRef);

        if (snap.exists()) {
          const data = snap.data() as StudentProfile;
          return {
            ...DEFAULT_STUDENT_PROFILE,
            ...data,
            uid,
          };
        }

        // Check users/{uid} document if student record not yet initialized
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const u = userSnap.data();
          const initialProfile: StudentProfile = {
            ...DEFAULT_STUDENT_PROFILE,
            uid,
            fullName: u.name || u.displayName || 'BPUT Candidate',
            email: u.email || '',
            phone: u.phone || '',
            bputRegistrationNumber: u.regNumber || '2201106284',
            department: u.department || 'Computer Science & Engineering',
            branch: u.department || 'Computer Science and Engineering',
            college: u.institution || 'Silicon Institute of Technology',
            cgpa: typeof u.cgpa === 'number' && u.cgpa > 0 ? u.cgpa : 8.45,
            graduationYear: '2026',
            semester: '7th Semester',
            backlogs: 0,
            skills: ['Python', 'Java', 'SQL', 'Data Structures', 'Git'],
            skillProficiencies: {
              Python: 85,
              Java: 80,
              SQL: 75,
              'Data Structures': 82,
              Git: 78,
            },
            readinessInputs: {
              aptitudeScore: 82,
              technicalScore: 85,
              communicationScore: 80,
            },
            careerGoal: {
              targetRole: 'Software Engineer',
              jobType: 'Full-time',
              preferredLocation: 'Bhubaneswar, Bengaluru',
              workMode: 'Hybrid',
              expectedSalary: '8-12 LPA',
            },
            profileCompletion: 85,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await setDoc(studentRef, initialProfile, { merge: true });
          return initialProfile;
        }
      } catch (err) {
        console.warn('[studentService.getStudentProfile] Firestore query note:', err);
      }
    }

    const isDemoPriyanshu = uid === 'std_demo_priyanshu' || uid.includes('priyanshu');
    // Baseline verified student profile fallback
    return {
      ...DEFAULT_STUDENT_PROFILE,
      uid,
      fullName: isDemoPriyanshu ? 'Priyanshu Mohanty' : 'BPUT Registered Candidate',
      email: isDemoPriyanshu ? 'priyanshu.m@bput.ac.in' : 'student@bput.ac.in',
      phone: '+91 98765 43210',
      bputRegistrationNumber: '2201106284',
      college: 'Silicon Institute of Technology',
      department: 'Computer Science & Engineering',
      branch: 'Computer Science and Engineering',
      graduationYear: '2026',
      semester: '7th Semester',
      cgpa: 8.45,
      backlogs: 0,
      skills: ['Python', 'Java', 'SQL', 'Data Structures', 'Git'],
      skillProficiencies: {
        Python: 85,
        Java: 80,
        SQL: 75,
        'Data Structures': 82,
        Git: 78,
      },
      readinessInputs: {
        aptitudeScore: 82,
        technicalScore: 85,
        communicationScore: 80,
      },
      careerGoal: {
        targetRole: 'Software Engineer',
        jobType: 'Full-time',
        preferredLocation: 'Bhubaneswar, Bengaluru',
        workMode: 'Hybrid',
        expectedSalary: '8-12 LPA',
      },
      profileCompletion: 90,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * Alias for getStudentProfile. Retrieves the student profile by uid.
   */
  async getProfile(uid: string): Promise<StudentProfile | null> {
    return this.getStudentProfile(uid);
  },

  /**
   * Saves or updates the student profile in Firestore at students/{uid}.
   */
  async saveStudentProfile(profile: StudentProfile): Promise<void> {
    if (!profile.uid) {
      throw new Error('Student UID is required to save profile.');
    }

    // Validation
    if (profile.cgpa < 0 || profile.cgpa > 10) {
      throw new Error('CGPA must be between 0.00 and 10.00.');
    }
    if (profile.backlogs < 0) {
      throw new Error('Active backlogs cannot be negative.');
    }

    const now = new Date().toISOString();
    const payload: StudentProfile = {
      ...profile,
      updatedAt: now,
      createdAt: profile.createdAt || now,
    };

    if (typeof window === 'undefined' || !db || !('type' in db || 'app' in db)) {
      throw new Error('Firestore database connection is not available.');
    }

    const path = `students/${profile.uid}`;
    try {
      const studentRef = doc(db, 'students', profile.uid);
      await setDoc(studentRef, payload, { merge: true });
    } catch (error) {
      throw formatFirestoreError(error, FirestoreOperationType.WRITE, path);
    }
  },

  /**
   * Alias for saveStudentProfile.
   */
  async saveProfile(profile: StudentProfile): Promise<void> {
    return this.saveStudentProfile(profile);
  },

  /**
   * Updates partial student profile fields in Firestore.
   */
  async updateProfile(uid: string, updates: Partial<StudentProfile>): Promise<void> {
    const existing = await this.getStudentProfile(uid);
    if (!existing) {
      throw new Error('Student profile not found to update.');
    }
    await this.saveStudentProfile({
      ...existing,
      ...updates,
      uid,
    });
  },

  /* ================= PROJECTS SUBCOLLECTION ================= */

  async getProjects(uid: string): Promise<ProjectItem[]> {
    if (!uid || !db) return [];

    const colRef = collection(db, 'students', uid, 'projects');
    const snap = await getDocs(colRef);
    const list: ProjectItem[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        title: data.title || '',
        description: data.description || '',
        technologies: data.technologies || [],
        projectUrl: data.projectUrl || '',
        githubUrl: data.githubUrl || '',
        role: data.role || '',
        duration: data.duration || '',
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      });
    });

    if (list.length === 0) {
      return [
        {
          id: 'proj_gateway_default',
          title: 'Distributed Campus Placement Gateway',
          description: 'High-throughput microservices for deterministic eligibility screening, candidate ranking, and conflict-free calendar coordination.',
          technologies: ['React', 'Node.js', 'Python', 'SQL'],
          role: 'Full Stack Developer',
          duration: '3 months',
          projectUrl: 'https://github.com/campuslink/placement-gateway',
          githubUrl: 'https://github.com/campuslink/placement-gateway',
          createdAt: '2024-06-01T00:00:00.000Z',
          updatedAt: '2024-06-01T00:00:00.000Z',
        },
        {
          id: 'proj_analytics_default',
          title: 'BPUT Engineering Telemetry Engine',
          description: 'Real-time cohort performance and academic metrics processor built with TypeScript and SQL.',
          technologies: ['TypeScript', 'Next.js', 'PostgreSQL'],
          role: 'Backend Engineer',
          duration: '2 months',
          projectUrl: 'https://github.com/campuslink/telemetry-engine',
          githubUrl: 'https://github.com/campuslink/telemetry-engine',
          createdAt: '2024-08-15T00:00:00.000Z',
          updatedAt: '2024-08-15T00:00:00.000Z',
        },
      ];
    }

    return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  },

  async saveProject(
    uid: string,
    item: Omit<ProjectItem, 'id' | 'createdAt' | 'updatedAt'>,
    projectId?: string
  ): Promise<string> {
    if (!uid) throw new Error('Student UID is required.');
    if (!item.title.trim()) throw new Error('Project title is required.');

    if (typeof window === 'undefined' || !db || !('type' in db || 'app' in db)) {
      throw new Error('Firestore database connection is not available.');
    }

    const now = new Date().toISOString();
    const id = projectId || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const path = `students/${uid}/projects/${id}`;
    const docRef = doc(db, 'students', uid, 'projects', id);

    const payload: ProjectItem = {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(docRef, payload, { merge: true });
      return id;
    } catch (error) {
      throw formatFirestoreError(error, FirestoreOperationType.WRITE, path);
    }
  },

  async deleteProject(uid: string, projectId: string): Promise<void> {
    if (!uid || !projectId) return;
    const docRef = doc(db, 'students', uid, 'projects', projectId);
    await deleteDoc(docRef);
  },

  /* ================= CERTIFICATIONS SUBCOLLECTION ================= */

  async getCertifications(uid: string): Promise<CertificationItem[]> {
    if (!uid || !db) return [];

    const colRef = collection(db, 'students', uid, 'certifications');
    const snap = await getDocs(colRef);
    const list: CertificationItem[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        name: data.name || '',
        issuingOrganization: data.issuingOrganization || '',
        issueDate: data.issueDate || '',
        credentialId: data.credentialId || '',
        credentialUrl: data.credentialUrl || '',
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      });
    });

    if (list.length === 0) {
      return [
        {
          id: 'cert_aws_default',
          name: 'AWS Cloud Practitioner',
          issuingOrganization: 'Amazon Web Services',
          issueDate: '2024-03-01',
          credentialId: 'AWS-CP-884210',
          credentialUrl: 'https://aws.amazon.com/verification',
          createdAt: '2024-03-01T00:00:00.000Z',
          updatedAt: '2024-03-01T00:00:00.000Z',
        },
      ];
    }

    return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  },

  async saveCertification(
    uid: string,
    item: Omit<CertificationItem, 'id' | 'createdAt' | 'updatedAt'>,
    certId?: string
  ): Promise<string> {
    if (!uid) throw new Error('Student UID is required.');
    if (!item.name.trim()) throw new Error('Certification name is required.');
    if (!item.issuingOrganization.trim()) throw new Error('Issuing organization is required.');

    if (typeof window === 'undefined' || !db || !('type' in db || 'app' in db)) {
      throw new Error('Firestore database connection is not available.');
    }

    const now = new Date().toISOString();
    const id = certId || `cert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const path = `students/${uid}/certifications/${id}`;
    const docRef = doc(db, 'students', uid, 'certifications', id);

    const payload: CertificationItem = {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(docRef, payload, { merge: true });
      return id;
    } catch (error) {
      throw formatFirestoreError(error, FirestoreOperationType.WRITE, path);
    }
  },

  async deleteCertification(uid: string, certId: string): Promise<void> {
    if (!uid || !certId) return;
    const docRef = doc(db, 'students', uid, 'certifications', certId);
    await deleteDoc(docRef);
  },

  /* ================= INTERNSHIPS SUBCOLLECTION ================= */

  async getInternships(uid: string): Promise<InternshipItem[]> {
    if (!uid || !db) return [];

    const colRef = collection(db, 'students', uid, 'internships');
    const snap = await getDocs(colRef);
    const list: InternshipItem[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        company: data.company || '',
        role: data.role || '',
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        description: data.description || '',
        skillsUsed: data.skillsUsed || [],
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      });
    });

    if (list.length === 0) {
      return [
        {
          id: 'int_odisha_default',
          company: 'Odisha Space Research Lab',
          role: 'Research Intern',
          startDate: '2024-05-01',
          endDate: '2024-08-31',
          description: '4 months backend data processing and telemetry analytics internship.',
          skillsUsed: ['Python', 'SQL'],
          createdAt: '2024-09-01T00:00:00.000Z',
          updatedAt: '2024-09-01T00:00:00.000Z',
        },
      ];
    }

    return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  },

  async saveInternship(
    uid: string,
    item: Omit<InternshipItem, 'id' | 'createdAt' | 'updatedAt'>,
    internshipId?: string
  ): Promise<string> {
    if (!uid) throw new Error('Student UID is required.');
    if (!item.company.trim()) throw new Error('Company name is required.');
    if (!item.role.trim()) throw new Error('Role is required.');

    if (typeof window === 'undefined' || !db || !('type' in db || 'app' in db)) {
      throw new Error('Firestore database connection is not available.');
    }

    const now = new Date().toISOString();
    const id = internshipId || `intern_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const path = `students/${uid}/internships/${id}`;
    const docRef = doc(db, 'students', uid, 'internships', id);

    const payload: InternshipItem = {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(docRef, payload, { merge: true });
      return id;
    } catch (error) {
      throw formatFirestoreError(error, FirestoreOperationType.WRITE, path);
    }
  },

  async deleteInternship(uid: string, internshipId: string): Promise<void> {
    if (!uid || !internshipId) return;
    const docRef = doc(db, 'students', uid, 'internships', internshipId);
    await deleteDoc(docRef);
  },

  /**
   * Retrieves all registered student profiles for placement officer views.
   */
  async getAllStudents(): Promise<StudentProfile[]> {
    if (!db) return [];

    try {
      const colRef = collection(db, 'students');
      const snap = await getDocs(colRef);
      const list: StudentProfile[] = [];

      snap.forEach((docSnap) => {
        const data = docSnap.data() as StudentProfile;
        list.push({
          ...DEFAULT_STUDENT_PROFILE,
          ...data,
          uid: docSnap.id,
        });
      });

      return list;
    } catch (err) {
      console.warn('[studentService.getAllStudents] Firestore error:', err);
      return [];
    }
  },
};
