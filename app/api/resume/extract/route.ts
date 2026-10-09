import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import mammoth from 'mammoth';
import { ExtractedResumeData } from '@/types/resume';

// Initialize Gemini SDK with server-side API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const EXTRACTION_SYSTEM_INSTRUCTION = `You are the official CAMPUSLINK Resume Extraction Engine for Biju Patnaik University of Technology (BPUT) placement coordination.
Extract only information explicitly present in the supplied resume.
Return valid JSON matching the required schema.
Do not invent or infer missing information.
Normalize obvious formatting differences but preserve the original meaning.
If a field is not present, return null or an empty array.
Never invent a CGPA, company, certification, skill, date, or qualification that is not supported by the resume.

Required JSON Structure:
{
  "fullName": string or null,
  "email": string or null,
  "phone": string or null,
  "education": [
    {
      "institution": string or null,
      "degree": string or null,
      "branch": string or null,
      "graduationYear": string or null,
      "cgpa": number or string or null
    }
  ],
  "skills": string[],
  "projects": [
    {
      "title": string,
      "description": string or null,
      "technologies": string[],
      "projectUrl": string or null,
      "githubUrl": string or null
    }
  ],
  "certifications": [
    {
      "name": string,
      "issuingOrganization": string or null,
      "issueDate": string or null,
      "credentialId": string or null,
      "credentialUrl": string or null
    }
  ],
  "internships": [
    {
      "company": string,
      "role": string,
      "startDate": string or null,
      "endDate": string or null,
      "description": string or null,
      "skills": string[]
    }
  ],
  "experience": [
    {
      "company": string,
      "role": string,
      "startDate": string or null,
      "endDate": string or null,
      "description": string or null
    }
  ],
  "achievements": string[],
  "careerKeywords": string[]
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileBase64, fileType, fileName } = body;

    if (!fileBase64) {
      return NextResponse.json(
        { error: 'No resume document binary provided.' },
        { status: 400 }
      );
    }

    const isDocx =
      fileType?.includes('wordprocessingml') ||
      fileType?.includes('docx') ||
      fileName?.toLowerCase().endsWith('.docx');

    let contentsPayload: Array<
      | string
      | {
          inlineData: {
            mimeType: string;
            data: string;
          };
        }
    > = [];

    if (isDocx) {
      // Extract readable text from DOCX using mammoth
      const buffer = Buffer.from(fileBase64, 'base64');
      const textResult = await mammoth.extractRawText({ buffer });
      const rawText = textResult.value || '';

      if (!rawText.trim()) {
        return NextResponse.json(
          { error: 'Unable to extract readable text from this DOCX file. Please upload a PDF or text-based document.' },
          { status: 422 }
        );
      }

      contentsPayload = [
        `Here is the extracted text from the student resume (${fileName}):\n\n${rawText}\n\nPlease extract structured resume information strictly according to the schema instructions.`,
      ];
    } else {
      // PDF document natively ingested by Gemini multimodal vision/document model
      contentsPayload = [
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: fileBase64,
          },
        },
        `Extract structured career and placement information from this student resume (${fileName}) strictly according to the schema.`,
      ];
    }

    // Call Gemini 3.8 Flash model
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contentsPayload,
      config: {
        systemInstruction: EXTRACTION_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    if (!responseText.trim()) {
      return NextResponse.json(
        { error: 'AI extraction completed without output. Please try again.' },
        { status: 500 }
      );
    }

    let parsedData: ExtractedResumeData;
    try {
      parsedData = JSON.parse(responseText) as ExtractedResumeData;
    } catch (parseErr) {
      console.error('[Resume Extraction JSON Parse Error]:', parseErr, responseText);
      // Clean potential markdown blocks
      const cleanJson = responseText.replace(/```json\s*|```/g, '').trim();
      parsedData = JSON.parse(cleanJson) as ExtractedResumeData;
    }

    // Ensure all arrays exist
    const sanitizedData: ExtractedResumeData = {
      fullName: parsedData.fullName || null,
      email: parsedData.email || null,
      phone: parsedData.phone || null,
      education: Array.isArray(parsedData.education) ? parsedData.education : [],
      skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
      projects: Array.isArray(parsedData.projects) ? parsedData.projects : [],
      certifications: Array.isArray(parsedData.certifications) ? parsedData.certifications : [],
      internships: Array.isArray(parsedData.internships) ? parsedData.internships : [],
      experience: Array.isArray(parsedData.experience) ? parsedData.experience : [],
      achievements: Array.isArray(parsedData.achievements) ? parsedData.achievements : [],
      careerKeywords: Array.isArray(parsedData.careerKeywords) ? parsedData.careerKeywords : [],
    };

    return NextResponse.json({
      success: true,
      data: sanitizedData,
      modelUsed: 'gemini-3.8-flash',
    });
  } catch (err: unknown) {
    console.error('[AI Resume Extraction API Error]:', err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'AI extraction failed. Please check your document and try again.',
      },
      { status: 500 }
    );
  }
}
