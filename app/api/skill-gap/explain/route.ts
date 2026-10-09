import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are the official CAMPUSLINK AI Skill Gap Intelligence Advisor for BPUT engineering placements.
Summarize the supplied deterministic skill gap results into a concise, constructive 2-3 sentence advisory summary.
Guidelines:
- Do NOT modify, recalculate, or contradict the supplied coverage, skill levels, required levels, or priority rankings.
- Do NOT invent skills, certifications, or requirements not present in the data.
- State their strongest technical area and clearly identify their highest-priority skill to focus on for their target role.
- Keep the tone encouraging, professional, and practical.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetRole, coverage, strongSkills, biggestOpportunities } = body;

    const oppsText = (biggestOpportunities || [])
      .map(
        (o: { skill: string; priority: string; gap: number }) =>
          `${o.skill} (${o.priority} priority, gap of ${o.gap} pts)`
      )
      .join(', ');

    const prompt = `Candidate Skill Gap Profile:
- Target Role: ${targetRole || 'Software Engineer'}
- Target-Role Skill Coverage: ${coverage}%
- Strong Skills: ${(strongSkills || []).join(', ') || 'Foundational competencies'}
- Highest Priority Improvement Areas: ${oppsText || 'No critical gaps detected'}

Please synthesize a concise 2-3 sentence advisor commentary analyzing where their target-role preparation stands and what single preparation action will yield the highest interview impact.`;

    let summary = '';
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
        summary = response.text?.trim() || '';
      } catch (geminiErr) {
        console.warn('[Gemini 3.8 Flash skill gap explain call note]:', geminiErr);
      }
    }

    if (!summary) {
      modelUsed = 'deterministic-institutional-engine';
      const topSkill = (strongSkills || [])[0] || 'foundational core programming';
      const firstOpportunity = (biggestOpportunities || [])[0];
      const gapDetail = firstOpportunity ? `${firstOpportunity.skill} (${firstOpportunity.priority} priority, ${firstOpportunity.gap} pt gap)` : 'system design';
      summary = `With ${coverage}% verified coverage for ${targetRole || 'Software Engineer'}, your strongest competency is in ${topSkill}. Your primary focus should be closing the gap in ${gapDetail} through structured problem solving and applied implementations before upcoming drive technical rounds.`;
    }

    return NextResponse.json({
      success: true,
      summary,
      modelUsed,
    });
  } catch (err: unknown) {
    console.error('[AI Skill Gap Explain API Error]:', err);
    return NextResponse.json(
      {
        success: true,
        summary: 'Your skill gap coverage is evaluated against institutional benchmarks. Prioritize high-weight technical competencies and system fundamentals to maximize interview readiness.',
        modelUsed: 'deterministic-institutional-fallback',
      },
      { status: 200 }
    );
  }
}
