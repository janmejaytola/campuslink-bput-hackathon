import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are the official CAMPUSLINK AI Placement Intelligence Advisor for BPUT engineering placement coordination.
Generate a concise, constructive 2-3 sentence personalized advisory summary for this candidate.
Guidelines:
- Do NOT alter, recalculate, or contradict the supplied readiness score or factor scores.
- Do NOT invent unearned certifications, achievements, or project experience.
- Provide targeted, encouraging guidance addressing their top improvement area for their target career role.
- Keep tone professional, objective, and encouraging. Never label candidates negatively.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { score, level, factorScores, targetRole, strengths, improvementAreas, recommendations } = body;

    const prompt = `Candidate Placement Readiness Profile:
- Target Role: ${targetRole || 'Software Engineer'}
- Overall Deterministic Readiness Score: ${score} / 100 (${level})
- Academic Performance: ${factorScores?.academic}/100
- Technical Skills: ${factorScores?.technical}/100
- Projects: ${factorScores?.projects}/100
- Assessments (Aptitude & Tech): ${factorScores?.assessments}/100
- Communication: ${factorScores?.communication}/100
- Experience & Internships: ${factorScores?.experience}/100
- Certifications: ${factorScores?.certifications}/100
- Key Strengths: ${(strengths || []).join(', ') || 'Consistent academic performance'}
- Priority Improvement Areas: ${(improvementAreas || []).join(', ') || 'Practical experience'}
- Recommended Action: ${(recommendations || []).join('; ') || 'Continue targeted practice'}

Please provide a concise 2-3 sentence advisory explanation analyzing where they stand and the highest-impact action they should take next for their target role.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const explanation = response.text?.trim() || '';

    return NextResponse.json({
      success: true,
      explanation,
    });
  } catch (err: unknown) {
    console.error('[AI Readiness Explanation API Error]:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'AI explanation service temporarily unavailable.',
      },
      { status: 500 }
    );
  }
}
