'use client';

import React from 'react';
import {
  FolderLock,
  FileText,
  Download,
  UploadCloud,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { PageHeader } from '@/components/common/PageHeader';
import { PS10Notice } from '@/components/common/PS10Notice';

const DOCUMENTS = [
  {
    name: 'BPUT Cumulative Grade Sheet (Sem 1-6)',
    size: '1.4 MB',
    date: '2026-08-15',
    verified: true,
    category: 'Academic Record',
  },
  {
    name: 'Class 12th Board Examination Certificate',
    size: '820 KB',
    date: '2022-06-20',
    verified: true,
    category: 'Secondary Education',
  },
  {
    name: 'Class 10th Matriculation Marksheet',
    size: '640 KB',
    date: '2020-05-18',
    verified: true,
    category: 'Secondary Education',
  },
  {
    name: 'College Institutional Identity Card',
    size: '410 KB',
    date: '2022-09-01',
    verified: true,
    category: 'Identity Proof',
  },
  {
    name: 'Active Placement Resume (v3.2 ATS-Compliant)',
    size: '248 KB',
    date: '2026-09-28',
    verified: true,
    category: 'Curriculum Vitae',
  },
];

export default function StudentDocumentsPage() {
  return (
    <ProtectedRoute allowedRole="STUDENT">
      <AppLayoutShell role="student">
      <PageHeader
        title="Verified Academic Credentials & Document Vault"
        description="Institutional repository of certified transcripts, grade cards, and identity documents"
        badge="Locker Verified"
      >
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-500 transition-colors shadow-xs"
        >
          <UploadCloud className="h-3.5 w-3.5" />
          Upload Document
        </button>
      </PageHeader>

      <div className="space-y-6">
        <PS10Notice
          moduleName="Secure Institutional Document Locker"
          nextStepDetail="Active credential verification, cryptographic integrity, and background check readiness."
        />

        {/* Document Table */}
        <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-slate-100 p-5 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Stored Credentials ({DOCUMENTS.length})</h3>
            <span className="text-xs text-slate-500">All documents encrypted and verified</span>
          </div>

          <div className="divide-y divide-slate-100">
            {DOCUMENTS.map((doc, idx) => (
              <div key={idx} className="p-4 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{doc.name}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>{doc.category}</span>
                      <span>·</span>
                      <span>{doc.size}</span>
                      <span>·</span>
                      <span>Uploaded {doc.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    Verified
                  </span>
                  <button
                    type="button"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    title="Download Copy"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayoutShell>
    </ProtectedRoute>
  );
}
