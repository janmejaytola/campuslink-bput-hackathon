import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are the official CAMPUSLINK AI Career Strategy Advisor for BPUT engineering placements.
Provide a concise, constructive 2-3 sentence personalized career strategy guidance based strictly on the student's declared goals and existing placement metrics.
Guidelines:
- Do NOT alter, recalculate, or question the readiness score or skill-gap coverage.
- Do NOT guarantee salary, hiring outcomes, or placement eligibility.
- Highlight how their selected target role and alternative roles align with their interests and current technical strengths.
- Recommend 1 concrete preparation priority (such as a specific project type or prioritized competency) to maximize readiness for upcoming campus recruitment.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      targetRole,
      alternativeRoles,
      interests,
      readinessScore,
      readinessLevel,
      skillCoverage,
      criticalGaps,
      declaredSkills,
    } = body;

    const prompt = `Candidate Career Trajectory:
- Primary Target Role: ${targetRole || 'Software Engineer'}
- Alternative Roles: ${(alternativeRoles || []).join(', ') || 'None specified'}
- Areas of Interest: ${(interests || []).join(', ') || 'General Engineering'}
- Placement Readiness Score: ${readinessScore || 0}/100 (${readinessLevel || 'Developing'})
- Target-Role Skill Coverage: ${skillCoverage ?? 0}%
- Critical Skill Gaps: ${criticalGaps || 0}
- Current Declared Skills: ${(declaredSkills || []).slice(0, 8).join(', ') || 'Foundational competencies'}

Please provide a concise 2-3 sentence advisory strategic summary synthesizing their placement direction and highest-impact preparation action.`;

    let guidance = '';
    let modelUsed = 'gemini-3.8-flash';

    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
          },
        });
        guidance = response.text?.trim() || '';
      } catch (geminiErr) {
        console.warn('[Gemini 3.8 Flash career goals explain call note]:', geminiErr);
      }
    }

    if (!guidance) {
      modelUsed = 'deterministic-institutional-engine';
      const declaredSummary = (declaredSkills || []).slice(0, 3).join(', ') || 'core engineering foundations';
      guidance = `Targeting ${targetRole || 'Software Engineering'} with a ${readinessScore || 0}/100 readiness score (${readinessLevel || 'Developing'}) establishes a clear operational focus for upcoming BPUT placement drives. Prioritize closing the ${criticalGaps || 0} identified competency gaps—especially in system design and data structures—while reinforcing your strengths in ${declaredSummary}. Building one end-to-end deployed capstone project in your target domain will significantly boost your recruiter shortlist conversion.`;
    }

    return NextResponse.json({
      success: true,
      guidance,
      modelUsed,
    });
  } catch (err: unknown) {
    console.error('[AI Career Goals Explain API Error]:', err);
    return NextResponse.json(
      {
        success: true,
        guidance: 'Consistent targeted practice on core algorithmic data structures, database querying, and domain project deployments will optimize your campus placement trajectory across upcoming engineering drives.',
        modelUsed: 'deterministic-institutional-fallback',
      },
      { status: 200 }
    );
  }
}
