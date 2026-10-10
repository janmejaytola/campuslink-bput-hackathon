import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import {
  validateResumeFileMeta,
  extractReadableTextFromBuffer,
  parseAndValidateGeminiResumeResponse,
} from '@/lib/services/resumeExtractionUtils';

const EXTRACTION_SYSTEM_INSTRUCTION = `You are the official CAMPUSLINK Resume Extraction Engine for Biju Patnaik University of Technology (BPUT) placement coordination.
Extract ONLY information explicitly present in the supplied resume text.
Return valid JSON matching the required schema.
Do NOT invent, guess, or infer missing information.
Normalize obvious formatting differences (such as trimming whitespace) while preserving the original meaning.
If a field is not present in the resume, return null for scalar fields or an empty array [] for list fields.
Never invent a CGPA, university, company, certification, skill, date, project, or qualification that is not supported by the resume.`;

const RESUME_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    fullName: {
      type: Type.STRING,
      nullable: true,
      description: 'Candidate full name if explicitly stated in the resume, otherwise null.',
    },
    email: {
      type: Type.STRING,
      nullable: true,
      description: 'Candidate email address if explicitly present, otherwise null.',
    },
    phone: {
      type: Type.STRING,
      nullable: true,
      description: 'Candidate phone number if explicitly present, otherwise null.',
    },
    education: {
      type: Type.ARRAY,
      description: 'Educational qualifications listed in the resume.',
      items: {
        type: Type.OBJECT,
        properties: {
          institution: { type: Type.STRING, nullable: true },
          degree: { type: Type.STRING, nullable: true },
          branch: { type: Type.STRING, nullable: true },
          graduationYear: { type: Type.STRING, nullable: true },
          cgpa: { type: Type.NUMBER, nullable: true },
        },
      },
    },
    skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Technical and professional skills explicitly listed in the resume.',
    },
    projects: {
      type: Type.ARRAY,
      description: 'Academic or personal projects explicitly described in the resume.',
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING, nullable: true },
          technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
          projectUrl: { type: Type.STRING, nullable: true },
          githubUrl: { type: Type.STRING, nullable: true },
        },
        required: ['title'],
      },
    },
    certifications: {
      type: Type.ARRAY,
      description: 'Certifications and credentials explicitly listed in the resume.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          issuingOrganization: { type: Type.STRING, nullable: true },
          issueDate: { type: Type.STRING, nullable: true },
          credentialId: { type: Type.STRING, nullable: true },
          credentialUrl: { type: Type.STRING, nullable: true },
        },
        required: ['name'],
      },
    },
    internships: {
      type: Type.ARRAY,
      description: 'Internships and industrial training explicitly listed in the resume.',
      items: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING },
          role: { type: Type.STRING },
          startDate: { type: Type.STRING, nullable: true },
          endDate: { type: Type.STRING, nullable: true },
          description: { type: Type.STRING, nullable: true },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['company', 'role'],
      },
    },
    experience: {
      type: Type.ARRAY,
      description: 'Full-time or part-time work experience explicitly listed in the resume.',
      items: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING },
          role: { type: Type.STRING },
          startDate: { type: Type.STRING, nullable: true },
          endDate: { type: Type.STRING, nullable: true },
          description: { type: Type.STRING, nullable: true },
        },
        required: ['company', 'role'],
      },
    },
    achievements: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Awards, honors, or competitive achievements explicitly mentioned.',
    },
    careerKeywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Role titles or domain keywords explicitly supported by the resume.',
    },
  },
  required: [
    'education',
    'skills',
    'projects',
    'certifications',
    'internships',
    'experience',
    'achievements',
    'careerKeywords',
  ],
};

export async function POST(req: NextRequest) {
  try {
    let buffer: Buffer | null = null;
    let fileName = '';
    let fileType = '';
    let fileSizeBytes = 0;

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No resume file was provided in the multipart upload.' },
          { status: 400 }
        );
      }
      fileName = file.name;
      fileType = file.type;
      fileSizeBytes = file.size;
      const arrayBuf = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuf);
    } else {
      let body: Record<string, unknown>;
      try {
        body = (await req.json()) as Record<string, unknown>;
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid JSON request payload.' },
          { status: 400 }
        );
      }

      const fileBase64 = typeof body.fileBase64 === 'string' ? body.fileBase64.trim() : '';
      fileName = typeof body.fileName === 'string' ? body.fileName.trim() : '';
      fileType = typeof body.fileType === 'string' ? body.fileType.trim() : '';

      if (!fileBase64) {
        return NextResponse.json(
          { success: false, error: 'No resume document binary was provided for extraction.' },
          { status: 400 }
        );
      }

      // Strip optional data URI prefix if present
      const cleanBase64 = fileBase64.includes(',')
        ? fileBase64.split(',')[1] || ''
        : fileBase64;

      try {
        buffer = Buffer.from(cleanBase64, 'base64');
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid base64 encoding for the uploaded resume.' },
          { status: 400 }
        );
      }
      fileSizeBytes = buffer.length;
    }

    // 1. Validate file type and size (PDF or DOCX, <= 5 MB)
    const validation = validateResumeFileMeta(fileName, fileType, fileSizeBytes);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Invalid resume file.' },
        { status: 400 }
      );
    }

    // 2. Extract readable text reliably from PDF or DOCX before calling Gemini
    let extractedDocumentText = '';
    try {
      extractedDocumentText = await extractReadableTextFromBuffer(buffer!, {
        isPdf: validation.isPdf,
        isDocx: validation.isDocx,
        fileName,
      });
    } catch (docErr: unknown) {
      const msg =
        docErr instanceof Error
          ? docErr.message
          : 'Unable to extract readable text from this resume document.';
      return NextResponse.json({ success: false, error: msg }, { status: 422 });
    }

    // 3. Verify server-side Gemini API key configuration
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Server Gemini API configuration is missing (GEMINI_API_KEY is not set). Unable to run AI resume extraction.',
        },
        { status: 503 }
      );
    }

    // 4. Call configured Gemini model (gemini-3.8-flash) from server-side code only
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const promptText = `Extract the structured resume fields from the following resume document (${fileName || 'resume'}).\nOnly include facts explicitly stated in the text below:\n\n--- BEGIN RESUME TEXT ---\n${extractedDocumentText}\n--- END RESUME TEXT ---`;

    let rawModelOutput = '';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptText,
        config: {
          systemInstruction: EXTRACTION_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: RESUME_RESPONSE_SCHEMA,
          temperature: 0.1,
        },
      });
      rawModelOutput = response.text || '';
    } catch (geminiErr: unknown) {
      console.error('[Gemini 3.8 Flash Resume Extraction API Error]:', geminiErr);
      const rawMessage =
        geminiErr instanceof Error ? geminiErr.message : String(geminiErr);
      return NextResponse.json(
        {
          success: false,
          error: `Gemini AI extraction request failed: ${rawMessage}`,
        },
        { status: 502 }
      );
    }

    // 5. Parse and validate the model response safely without inventing values
    try {
      const validatedData = parseAndValidateGeminiResumeResponse(rawModelOutput);
      return NextResponse.json({
        success: true,
        data: validatedData,
        modelUsed: 'gemini-3.8-flash',
        extractedTextLength: extractedDocumentText.length,
      });
    } catch (validationErr: unknown) {
      console.error('[Resume Extraction Validation Error]:', validationErr, rawModelOutput);
      const validationMsg =
        validationErr instanceof Error
          ? validationErr.message
          : 'The AI model returned an invalid or empty extraction result.';
      return NextResponse.json(
        {
          success: false,
          error: validationMsg,
        },
        { status: 422 }
      );
    }
  } catch (err: unknown) {
    console.error('[AI Resume Extraction Unhandled Error]:', err);
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : 'An unexpected server error occurred during resume extraction.',
      },
      { status: 500 }
    );
  }
}
