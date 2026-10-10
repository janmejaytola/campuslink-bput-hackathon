import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import {
  validateResumeFileMeta,
  extractReadableTextFromBuffer,
  parseAndValidateGeminiResumeResponse,
  mapExtractedResumeToProfileUpdates,
} from './resumeExtractionUtils';
import { POST as extractResumePost } from '@/app/api/resume/extract/route';
import { formatFirestoreError, FirestoreOperationType, resumeService } from './resumeService';

/**
 * Generates a minimal valid PDF 1.4 binary buffer containing the specified text.
 * If text is empty, creates a valid blank PDF page with no text stream.
 */
function createMinimalPdfBuffer(text: string): Buffer {
  const escaped = text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const streamContent = text
    ? `BT\n/F1 12 Tf\n72 720 Td\n(${escaped}) Tj\nET`
    : '';
  const streamLength = Buffer.byteLength(streamContent, 'utf8');

  const objects = [
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`,
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`,
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n`,
    `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`,
    `5 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += obj;
  }

  const xrefStart = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(pdf, 'utf8');
}

/**
 * Generates a minimal uncompressed ZIP archive buffer (sufficient for valid .docx structure with word/document.xml).
 */
function createMinimalDocxBuffer(paragraphs: string[]): Buffer {
  const xmlBody = paragraphs
    .map((p) => `<w:p><w:r><w:t>${p}</w:t></w:r></w:p>`)
    .join('');
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>${xmlBody}</w:body>
</w:document>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const files = [
    { name: '[Content_Types].xml', data: Buffer.from(contentTypesXml, 'utf8') },
    { name: '_rels/.rels', data: Buffer.from(relsXml, 'utf8') },
    { name: 'word/document.xml', data: Buffer.from(documentXml, 'utf8') },
  ];

  function crc32(buf: Buffer): number {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  const localHeaders: Buffer[] = [];
  const centralHeaders: Buffer[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBuf = Buffer.from(file.name, 'utf8');
    const crc = crc32(file.data);
    const size = file.data.length;

    const localHeader = Buffer.alloc(30 + nameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(size, 18);
    localHeader.writeUInt32LE(size, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);
    nameBuf.copy(localHeader, 30);

    localHeaders.push(localHeader, file.data);

    const centralHeader = Buffer.alloc(46 + nameBuf.length);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(size, 20);
    centralHeader.writeUInt32LE(size, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    nameBuf.copy(centralHeader, 46);

    centralHeaders.push(centralHeader);
    offset += localHeader.length + size;
  }

  const centralDirSize = centralHeaders.reduce((acc, b) => acc + b.length, 0);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralDirSize, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localHeaders, ...centralHeaders, eocd]);
}

async function runTests() {
  let passed = 0;

  // Test 1: File validation (PDF, DOCX, unsupported, empty, oversize)
  {
    const okPdf = validateResumeFileMeta('resume.pdf', 'application/pdf', 120 * 1024);
    assert.equal(okPdf.valid, true);
    assert.equal(okPdf.isPdf, true);

    const okDocx = validateResumeFileMeta(
      'candidate_cv.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      200 * 1024
    );
    assert.equal(okDocx.valid, true);
    assert.equal(okDocx.isDocx, true);

    const emptyRes = validateResumeFileMeta('empty.pdf', 'application/pdf', 0);
    assert.equal(emptyRes.valid, false);
    assert.match(emptyRes.error || '', /empty/i);

    const oversizeRes = validateResumeFileMeta('large.pdf', 'application/pdf', 6 * 1024 * 1024);
    assert.equal(oversizeRes.valid, false);
    assert.match(oversizeRes.error || '', /5 MB/i);

    const badFormat = validateResumeFileMeta('image.png', 'image/png', 1024);
    assert.equal(badFormat.valid, false);
    assert.match(badFormat.error || '', /Unsupported file format/i);

    passed++;
    console.log('✓ Test 1 passed: File metadata & size validation');
  }

  // Test 2: Real PDF text extraction
  {
    const pdfBuf = createMinimalPdfBuffer('Ananya Sharma BPUT CSE 2026 CGPA 8.92 Python TypeScript');
    const extracted = await extractReadableTextFromBuffer(pdfBuf, {
      isPdf: true,
      isDocx: false,
      fileName: 'ananya_resume.pdf',
    });
    assert.match(extracted, /Ananya Sharma/);
    assert.match(extracted, /CGPA 8\.92/);
    passed++;
    console.log('✓ Test 2 passed: Real PDF text extraction via unpdf');
  }

  // Test 3: Empty / scanned PDF with no text throws clear error (no invented data)
  {
    const emptyPdfBuf = createMinimalPdfBuffer('');
    await assert.rejects(
      async () => {
        await extractReadableTextFromBuffer(emptyPdfBuf, {
          isPdf: true,
          isDocx: false,
          fileName: 'scanned_blank.pdf',
        });
      },
      /No readable text could be extracted from this PDF file/i
    );
    passed++;
    console.log('✓ Test 3 passed: Empty/scanned PDF rejected with clear error');
  }

  // Test 4: Real DOCX text extraction via mammoth
  {
    const docxBuf = createMinimalDocxBuffer([
      'Rohan Das',
      'Email: rohan.das@bput.ac.in',
      'Skills: Java, Spring Boot, PostgreSQL',
    ]);
    const extracted = await extractReadableTextFromBuffer(docxBuf, {
      isPdf: false,
      isDocx: true,
      fileName: 'rohan.docx',
    });
    assert.match(extracted, /Rohan Das/);
    assert.match(extracted, /Spring Boot/);
    passed++;
    console.log('✓ Test 4 passed: Real DOCX text extraction via mammoth');
  }

  // Test 5: Empty DOCX with no text throws clear error
  {
    const emptyDocxBuf = createMinimalDocxBuffer(['   ']);
    await assert.rejects(
      async () => {
        await extractReadableTextFromBuffer(emptyDocxBuf, {
          isPdf: false,
          isDocx: true,
          fileName: 'empty.docx',
        });
      },
      /No readable text could be extracted from this DOCX file/i
    );
    passed++;
    console.log('✓ Test 5 passed: Empty DOCX rejected with clear error');
  }

  // Test 6: Malformed model output & Markdown fences handling
  {
    const fencedJson = `\`\`\`json
{
  "fullName": "  Subham Patnaik ",
  "email": "subham.p@bput.ac.in",
  "phone": null,
  "education": [
    {
      "institution": "OUTR Bhubaneswar",
      "degree": "B.Tech",
      "branch": "CSE",
      "graduationYear": 2026,
      "cgpa": "8.75 / 10"
    }
  ],
  "skills": ["React", "TypeScript", "react", "  "],
  "projects": [
    {
      "title": "Smart Grid Telemetry",
      "description": "IoT monitoring dashboard",
      "technologies": ["TypeScript", "MQTT"]
    },
    {
      "title": "   "
    }
  ]
}
\`\`\``;

    const parsed = parseAndValidateGeminiResumeResponse(fencedJson);
    assert.equal(parsed.fullName, 'Subham Patnaik');
    assert.equal(parsed.email, 'subham.p@bput.ac.in');
    assert.equal(parsed.phone, null);
    assert.equal(parsed.education.length, 1);
    assert.equal(parsed.education[0].graduationYear, '2026');
    assert.equal(parsed.education[0].cgpa, 8.75);
    assert.deepEqual(parsed.skills, ['React', 'TypeScript']);
    assert.equal(parsed.projects.length, 1);
    assert.equal(parsed.projects[0].title, 'Smart Grid Telemetry');
    assert.deepEqual(parsed.certifications, []);
    assert.deepEqual(parsed.internships, []);

    await assert.rejects(
      async () => parseAndValidateGeminiResumeResponse('Not valid JSON at all'),
      /Invalid JSON structure/i
    );

    await assert.rejects(
      async () =>
        parseAndValidateGeminiResumeResponse(
          JSON.stringify({
            fullName: null,
            email: null,
            phone: null,
            education: [],
            skills: [],
            projects: [],
            certifications: [],
            internships: [],
            experience: [],
            achievements: [],
            careerKeywords: [],
          })
        ),
      /No recognizable resume fields/i
    );

    passed++;
    console.log('✓ Test 6 passed: Markdown fences, missing fields, and malformed JSON validation');
  }

  // Test 7: Mapping extracted fields to StudentProfile & subcollections without duplication or invention
  {
    const extracted = parseAndValidateGeminiResumeResponse(
      JSON.stringify({
        fullName: 'Ananya Sharma',
        email: 'ananya@bput.ac.in',
        phone: '+91 9123456789',
        education: [
          {
            institution: 'VSSUT Burla',
            degree: 'B.Tech',
            branch: 'Information Technology',
            graduationYear: '2026',
            cgpa: 9.1,
          },
        ],
        skills: ['Python', 'Docker', 'Kubernetes'],
        projects: [
          {
            title: 'Existing Project',
            description: 'Should not duplicate',
            technologies: ['Python'],
            projectUrl: null,
            githubUrl: null,
          },
          {
            title: 'New Cloud Scheduler',
            description: 'Distributed scheduler',
            technologies: ['Go', 'Kubernetes'],
            projectUrl: 'https://example.com',
            githubUrl: 'https://github.com/example/scheduler',
          },
        ],
        certifications: [
          {
            name: 'CKA',
            issuingOrganization: 'CNCF',
            issueDate: '2025-05',
            credentialId: 'CKA-123',
            credentialUrl: null,
          },
        ],
        internships: [],
        experience: [
          {
            company: 'TechCorp',
            role: 'SDE Intern',
            startDate: '2025-05',
            endDate: '2025-07',
            description: 'Built microservices',
          },
        ],
        achievements: ['Smart India Hackathon Finalist'],
        careerKeywords: ['Cloud Engineer'],
      })
    );

    const mapped = mapExtractedResumeToProfileUpdates(
      'uid_test_1',
      extracted,
      null,
      [
        {
          id: 'p1',
          title: 'existing project',
          description: 'Already saved',
          technologies: ['Python'],
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01',
        },
      ],
      [],
      []
    );

    assert.equal(mapped.updatedProfile.fullName, 'Ananya Sharma');
    assert.equal(mapped.updatedProfile.college, 'VSSUT Burla');
    assert.equal(mapped.updatedProfile.branch, 'Information Technology');
    assert.equal(mapped.updatedProfile.cgpa, 9.1);
    assert.deepEqual(mapped.updatedProfile.skills, ['Python', 'Docker', 'Kubernetes']);
    assert.equal(mapped.projectsToSave.length, 1);
    assert.equal(mapped.projectsToSave[0].title, 'New Cloud Scheduler');
    assert.equal(mapped.certificationsToSave.length, 1);
    assert.equal(mapped.certificationsToSave[0].name, 'CKA');
    assert.equal(mapped.internshipsToSave.length, 1);
    assert.equal(mapped.internshipsToSave[0].company, 'TechCorp');

    passed++;
    console.log('✓ Test 7 passed: Profile and subcollection mapping & deduplication');
  }

  // Test 8: API Route error handling (missing payload, unreadable PDF, missing API key)
  {
    // 8a: Missing file payload -> 400
    const reqEmpty = new NextRequest('http://localhost:3000/api/resume/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const resEmpty = await extractResumePost(reqEmpty);
    assert.equal(resEmpty.status, 400);
    const jsonEmpty = await resEmpty.json();
    assert.equal(jsonEmpty.success, false);

    // 8b: Blank PDF -> 422 Unprocessable Entity (not fake success)
    const blankPdfBase64 = createMinimalPdfBuffer('').toString('base64');
    const reqBlankPdf = new NextRequest('http://localhost:3000/api/resume/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileBase64: blankPdfBase64,
        fileName: 'blank_scan.pdf',
        fileType: 'application/pdf',
      }),
    });
    const resBlankPdf = await extractResumePost(reqBlankPdf);
    assert.equal(resBlankPdf.status, 422);
    const jsonBlankPdf = await resBlankPdf.json();
    assert.equal(jsonBlankPdf.success, false);
    assert.match(jsonBlankPdf.error, /No readable text could be extracted/i);

    // 8c: Missing GEMINI_API_KEY -> 503 Service Unavailable (not fake fallback data)
    const prevKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    try {
      const validPdfBase64 = createMinimalPdfBuffer(
        'Candidate Name: Siddharth Mohanty, BPUT CSE, CGPA: 8.6, Skills: Java, SQL'
      ).toString('base64');
      const reqNoKey = new NextRequest('http://localhost:3000/api/resume/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: validPdfBase64,
          fileName: 'siddharth.pdf',
          fileType: 'application/pdf',
        }),
      });
      const resNoKey = await extractResumePost(reqNoKey);
      assert.equal(resNoKey.status, 503);
      const jsonNoKey = await resNoKey.json();
      assert.equal(jsonNoKey.success, false);
      assert.match(jsonNoKey.error, /GEMINI_API_KEY/i);
    } finally {
      if (prevKey !== undefined) {
        process.env.GEMINI_API_KEY = prevKey;
      }
    }

    passed++;
    console.log('✓ Test 8 passed: API route error handling (400, 422, 503 without fake data)');
  }

  // Test 9: Persistence failure handling & FirestoreErrorInfo formatting
  {
    const permErr = formatFirestoreError(
      new Error('FirebaseError: Missing or insufficient permissions.'),
      FirestoreOperationType.WRITE,
      'resumes/uid_123/files/res_1'
    );
    const parsedErr = JSON.parse(permErr.message);
    assert.equal(parsedErr.operationType, 'write');
    assert.equal(parsedErr.path, 'resumes/uid_123/files/res_1');
    assert.match(parsedErr.error, /Missing or insufficient permissions/);

    await assert.rejects(
      async () => {
        await resumeService.saveResumeRecord({
          id: '',
          uid: '',
          fileName: 'test.pdf',
          fileType: 'application/pdf',
          fileSize: 100,
          storagePath: '',
          downloadURL: '',
          uploadedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          extractionStatus: 'processing',
        });
      },
      /Valid UID and Resume ID are required/i
    );

    passed++;
    console.log('✓ Test 9 passed: Persistence failure & Firestore permission error formatting');
  }

  console.log(`\nAll ${passed}/9 resume extraction test suites passed!`);
}

runTests().catch((err) => {
  console.error('Resume extraction test suite failed:', err);
  process.exit(1);
});
