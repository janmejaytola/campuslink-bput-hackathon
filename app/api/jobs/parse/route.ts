import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import mammoth from 'mammoth';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are the official CAMPUSLINK Recruiter Job Description Parser for BPUT engineering placement drives.
Extract only information explicitly present in the provided job description.
Do not infer missing salary, CGPA, branches, graduation years, certifications, experience, openings, location, deadlines or skills.
If information is not present, return null, empty array, or empty string as appropriate.
Do not create requirements based on general knowledge.
Do not decide whether any student is eligible.
Do not rank students.
Do not shortlist students.
This system only converts an existing JD into structured job requirements.

Work Mode must be normalized to: "ON_SITE", "HYBRID", "REMOTE", or "".
Employment Type must be normalized to: "FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT", or "".

For required skills vs preferred skills:
If a skill is listed as required/mandatory, put it in requiredSkills.
If a skill is listed as preferred/nice-to-have/bonus, put it in preferredSkills.
Set requiredLevel and preferredLevel as realistic benchmark values (0-100) only if indicated, otherwise provide a reasonable baseline (e.g. 70 for required, 50 for preferred).

Return valid JSON adhering strictly to the required schema.`;

const JSON_PROMPT = `Extract the structured job requirements from this job description. Return valid JSON matching this schema:
{
  "title": string,
  "company": string,
  "description": string,
  "location": string,
  "workMode": "ON_SITE" | "HYBRID" | "REMOTE" | "",
  "employmentType": "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT" | "",
  "salaryMin": number | null,
  "salaryMax": number | null,
  "openings": number | null,
  "applicationDeadline": string | null,
  "driveDate": string | null,
  "eligibility": {
    "minCgpa": number | null,
    "maxBacklogs": number | null,
    "graduationYears": string[],
    "branches": string[],
    "colleges": string[],
    "minExperienceMonths": number,
    "requiredCertifications": string[]
  },
  "requiredSkills": [
    {
      "name": string,
      "requiredLevel": number
    }
  ],
  "preferredSkills": [
    {
      "name": string,
      "preferredLevel": number
    }
  ]
}`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No JD document was provided for parsing.' },
        { status: 400 }
      );
    }

    // Size limit validation (5 MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds maximum 5 MB limit.' },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    const isDocx =
      fileName.endsWith('.docx') ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const isPdf = fileName.endsWith('.pdf') || file.type === 'application/pdf';

    if (!isDocx && !isPdf) {
      return NextResponse.json(
        { success: false, error: 'Unsupported file type. Please upload a PDF or DOCX file.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let parsedResultText = '';

    if (isDocx) {
      // Extract text with mammoth
      const extraction = await mammoth.extractRawText({ buffer });
      const docxText = extraction.value || '';

      if (!docxText.trim()) {
        return NextResponse.json(
          { success: false, error: 'Unable to extract text from the provided DOCX document.' },
          { status: 422 }
        );
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          { role: 'user', parts: [{ text: `${JSON_PROMPT}\n\nJob Description Text:\n${docxText}` }] },
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
        },
      });

      parsedResultText = response.text || '';
    } else {
      // PDF processing via Gemini inline base64
      const base64Data = buffer.toString('base64');

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: 'application/pdf',
                  data: base64Data,
                },
              },
              { text: JSON_PROMPT },
            ],
          },
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
        },
      });

      parsedResultText = response.text || '';
    }

    if (!parsedResultText.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "We couldn't reliably parse this JD. Please review the document or create the job manually.",
        },
        { status: 422 }
      );
    }

    // Safe JSON parsing with markdown cleanup
    let cleanJson = parsedResultText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let parsedData;
    try {
      parsedData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('[Gemini JD JSON Parse Error]:', parseError, cleanJson);
      return NextResponse.json(
        {
          success: false,
          error: "We couldn't reliably parse this JD. Please review the document or create the job manually.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
      rawFileName: file.name,
      fileSize: file.size,
    });
  } catch (err: unknown) {
    console.error('[JD Parser Endpoint Error]:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Server error while parsing job description document.',
      },
      { status: 500 }
    );
  }
}
