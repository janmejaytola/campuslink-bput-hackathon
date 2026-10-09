import { NextRequest, NextResponse } from 'next/server';
import { shortlistService } from '@/lib/services/shortlistService';
import { ShortlistStatus } from '@/types/shortlist';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      jobId,
      candidateId,
      recruiterId,
      status,
      matchScoreSnapshot,
      eligible,
      reason,
      candidateName,
      candidateBranch,
      candidateBatch,
      candidateRegNo,
      jobTitle,
      company,
      strengthsSnapshot,
    } = body;

    if (!jobId || !candidateId || !recruiterId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields (jobId, candidateId, recruiterId, status).' },
        { status: 400 }
      );
    }

    const validStatuses: ShortlistStatus[] = ['NOT_REVIEWED', 'SHORTLISTED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Hard Eligibility Gate: Cannot shortlist an ineligible candidate
    if (status === 'SHORTLISTED' && !eligible) {
      return NextResponse.json(
        {
          error:
            'Eligibility Gate Violation: Only ELIGIBLE candidates can be shortlisted. This candidate did not meet one or more mandatory job criteria.',
        },
        { status: 403 }
      );
    }

    const record = await shortlistService.updateStatus({
      jobId,
      candidateId,
      recruiterId,
      status,
      matchScoreSnapshot: Number(matchScoreSnapshot) || 0,
      eligible: !!eligible,
      reason,
      candidateName,
      candidateBranch,
      candidateBatch,
      candidateRegNo,
      jobTitle,
      company,
      strengthsSnapshot,
    });

    return NextResponse.json({ success: true, record });
  } catch (err: unknown) {
    console.error('[Shortlist API POST Error]:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error processing shortlist.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');
    const studentId = searchParams.get('studentId');
    const recruiterId = searchParams.get('recruiterId');

    if (jobId) {
      const records = await shortlistService.getShortlistsForJob(jobId);
      return NextResponse.json({ success: true, records });
    }

    if (studentId) {
      const records = await shortlistService.getShortlistsForStudent(studentId);
      return NextResponse.json({ success: true, records });
    }

    if (recruiterId) {
      const list = await shortlistService.getShortlistsForRecruiter(recruiterId);
      return NextResponse.json({ success: true, list });
    }

    const all = await shortlistService.getAllShortlistsForOfficer();
    return NextResponse.json({ success: true, list: all });
  } catch (err: unknown) {
    console.error('[Shortlist API GET Error]:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to retrieve shortlist data.' },
      { status: 500 }
    );
  }
}
