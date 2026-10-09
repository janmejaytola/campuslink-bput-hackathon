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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const guidance = response.text?.trim() || '';

    return NextResponse.json({
      success: true,
      guidance,
    });
  } catch (err: unknown) {
    console.error('[AI Career Goals Explain API Error]:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'AI career guidance temporarily unavailable.',
      },
      { status: 500 }
    );
  }
}
