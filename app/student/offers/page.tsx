'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  Download,
  Building,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { PageHeader } from '@/components/common/PageHeader';
import { PS10Notice } from '@/components/common/PS10Notice';
import { DEMO_OFFERS } from '@/lib/demoData';

export default function StudentOffersPage() {
  const [offerStatus, setOfferStatus] = useState<string>(DEMO_OFFERS[0]?.status || 'Pending Review');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleAccept = () => {
    setOfferStatus('Accepted');
    setActionMessage('Offer acceptance registered and forwarded to BPUT Placement Cell.');
  };

  return (
    <AppLayoutShell role="student">
      <PageHeader
        title="Placement Offers & Release Letters"
        description="Official employment offers, compensation breakdown, and digital acceptance records"
        badge="1 Offer Received"
      />

      <div className="space-y-6">
        <PS10Notice
          moduleName="Offer Management & Acceptance Workflow"
          nextStepDetail="Foundation shell managing official institutional offer rolloffs and one-offer campus policy compliance."
        />

        {actionMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {actionMessage}
          </div>
        )}

        <div className="space-y-6">
          {DEMO_OFFERS.map((offer) => (
            <div
              key={offer.id}
              className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {offer.company}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">{offer.role}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded border ${
                      offerStatus === 'Accepted'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    Status: {offerStatus}
                  </span>
                </div>
              </div>

              {/* Offer Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-6">
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <span className="text-slate-400 block text-[11px] font-medium">Total Annual CTC</span>
                  <span className="font-extrabold text-teal-800 text-lg">{offer.ctc}</span>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <span className="text-slate-400 block text-[11px] font-medium">Base Compensation</span>
                  <span className="font-semibold text-slate-800 text-sm">{offer.baseSalary}</span>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <span className="text-slate-400 block text-[11px] font-medium">Joining Location</span>
                  <span className="font-semibold text-slate-800 text-sm">{offer.joiningLocation}</span>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <span className="text-slate-400 block text-[11px] font-medium">Acceptance Deadline</span>
                  <span className="font-semibold text-amber-700 text-sm">{offer.acceptanceDeadline}</span>
                </div>
              </div>

              {/* Document Reference & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <FileText className="h-4 w-4 text-teal-600 shrink-0" />
                  <span>Document ID: <strong className="text-slate-800">{offer.documentRef}</strong></span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download Official Letter
                  </button>

                  {offerStatus !== 'Accepted' ? (
                    <button
                      onClick={handleAccept}
                      className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-500 transition-colors shadow-xs"
                    >
                      Accept Offer
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold">
                      <CheckCircle2 className="h-4 w-4" />
                      Accepted & Logged
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayoutShell>
  );
}
