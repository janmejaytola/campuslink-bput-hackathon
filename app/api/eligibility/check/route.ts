import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { RecruiterJob } from '@/types/job';
import { StudentProfile, CertificationItem, InternshipItem } from '@/types/student';
import { evaluateEligibility } from '@/lib/services/eligibilityEngine';
import { runAllEligibilityTests } from '@/lib/services/eligibilityTestCases';

/**
 * GET /api/eligibility/check
 * If ?testSuite=true is passed, executes the 16 deterministic engine test cases.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const runTests = url.searchParams.get('testSuite') === 'true';

  if (runTests) {
    const testResults = runAllEligibilityTests();
    return NextResponse.json({
      status: 'SUCCESS',
      suite: '16 Deterministic Student Eligibility Engine Test Cases',
      executedAt: new Date().toISOString(),
      ...testResults,
    });
  }

  return NextResponse.json(
    {
      message: 'CAMPUSLINK Deterministic Student Eligibility API',
      usage: 'POST JSON with { jobId, studentId } or { student, job, certifications, internships }',
      testSuiteEndpoint: 'GET /api/eligibility/check?testSuite=true',
    },
    { status: 200 }
  );
}

/**
 * POST /api/eligibility/check
 * Deterministically evaluates whether a student satisfies explicit job requirements.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Direct object payload execution (useful for standalone unit testing)
    if (body.student && body.job) {
      const evaluation = evaluateEligibility({
        student: body.student as Partial<StudentProfile>,
        job: body.job as Partial<RecruiterJob>,
        certifications: (body.certifications || []) as CertificationItem[],
        internships: (body.internships || []) as InternshipItem[],
        evaluatedBy: body.callerUid || 'API_DIRECT',
      });

      return NextResponse.json({
        success: true,
        evaluation,
      });
    }

    // 2. Database ID based execution
    const { jobId, studentId, callerUid, callerRole } = body;

    if (!jobId || !studentId) {
      return NextResponse.json(
        {
          error: 'Missing required parameters: both jobId and studentId are required.',
        },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Firestore database is unavailable.' },
        { status: 500 }
      );
    }

    // Fetch student profile
    const studentDoc = await getDoc(doc(db, 'students', studentId));
    if (!studentDoc.exists()) {
      return NextResponse.json(
        { error: `Student profile not found for ID: ${studentId}` },
        { status: 404 }
      );
    }
    const student = { uid: studentDoc.id, ...studentDoc.data() } as StudentProfile;

    // Fetch certifications
    const certsSnap = await getDocs(collection(db, 'students', studentId, 'certifications'));
    const certifications: CertificationItem[] = [];
    certsSnap.forEach((d) => certifications.push({ id: d.id, ...d.data() } as CertificationItem));

    // Fetch internships
    const internsSnap = await getDocs(collection(db, 'students', studentId, 'internships'));
    const internships: InternshipItem[] = [];
    internsSnap.forEach((d) => internships.push({ id: d.id, ...d.data() } as InternshipItem));

    // Fetch job
    const jobDoc = await getDoc(doc(db, 'jobs', jobId));
    if (!jobDoc.exists()) {
      return NextResponse.json(
        { error: `Job posting not found for ID: ${jobId}` },
        { status: 404 }
      );
    }
    const job = { id: jobDoc.id, ...jobDoc.data() } as RecruiterJob;

    // Evaluate deterministically
    const evaluation = evaluateEligibility({
      student,
      job,
      certifications,
      internships,
      evaluatedBy: callerUid ? `${callerRole || 'USER'}:${callerUid}` : 'API_ROUTE',
    });

    // Cache evaluation in Firestore under students/{studentId}/eligibility/{jobId}
    try {
      await setDoc(doc(db, 'students', studentId, 'eligibility', jobId), evaluation, {
        merge: true,
      });
    } catch (saveErr) {
      console.warn('[API Eligibility] Could not cache to Firestore:', saveErr);
    }

    return NextResponse.json({
      success: true,
      evaluation,
    });
  } catch (error: unknown) {
    console.error('[API Eligibility Error]:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
