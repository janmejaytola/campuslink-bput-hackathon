'use client';

import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Plus,
  FileText,
  Download,
  AlertCircle,
} from 'lucide-react';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PS10Notice } from '@/components/common/PS10Notice';

const DEMO_RECRUITER_OFFERS = [
  {
    id: 'OFF-TCS-2026-01',
    candidate: 'Aarav Mohapatra',
    reg: '2201106284',
    branch: 'CSE',
    role: 'Digital Software Engineer',
    ctc: '₹9.20 LPA',
    date: '2026-10-02',
    status: 'Pending Review',
    doc: 'BPUT-TCS-OFFER-2026-8821.pdf',
  },
  {
    id: 'OFF-TCS-2026-02',
    candidate: 'Priyanka Das',
    reg: '2201106190',
    branch: 'IT',
    role: 'Digital Software Engineer',
    ctc: '₹9.20 LPA',
    date: '2026-09-30',
    status: 'Accepted',
    doc: 'BPUT-TCS-OFFER-2026-8819.pdf',
  },
  {
    id: 'OFF-TCS-2026-03',
    candidate: 'Sneha Nayak',
    reg: '2201106405',
    branch: 'CSE',
    role: 'Associate Cloud Engineer',
    ctc: '₹7.50 LPA',
    date: '2026-09-29',
    status: 'Accepted',
    doc: 'BPUT-TCS-OFFER-2026-8815.pdf',
  },
];

export default function RecruiterOffersPage() {
  const [offers, setOffers] = useState(DEMO_RECRUITER_OFFERS);
  const [showModal, setShowModal] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [offerCtc, setOfferCtc] = useState('₹9.20 LPA');

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (candidateName) {
      setOffers([
        {
          id: `OFF-TCS-2026-0${offers.length + 1}`,
          candidate: candidateName,
          reg: '2201106312',
          branch: 'ECE',
          role: 'Digital Software Engineer',
          ctc: offerCtc,
          date: '2026-10-03',
          status: 'Pending Review',
          doc: `BPUT-TCS-OFFER-2026-${Math.floor(1000 + Math.random() * 9000)}.pdf`,
        },
        ...offers,
      ]);
      setShowModal(false);
      setCandidateName('');
    }
  };

  return (
    <AppLayoutShell role="recruiter">
      <PageHeader
        title="Official Employment Offers & Rollout"
        description="Release digital campus offers, monitor candidate acceptances, and synchronize with BPUT placement records"
        badge="Offer Ledger"
      >
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-500 transition-colors shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Generate Candidate Offer Letter
        </button>
      </PageHeader>

      <div className="space-y-6">
        <PS10Notice
          moduleName="Recruiter Offer Ledger & Acceptance Synchronization"
          nextStepDetail="Active digital offer records, acceptance states, and university one-offer policy compliance."
        />

        {/* Modal for Generating Offer */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Generate Digital Offer Letter
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Will be dispatched to candidate student portal and BPUT placement records.
              </p>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Candidate Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohan Tripathy"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Annual Compensation (CTC)
                  </label>
                  <input
                    type="text"
                    required
                    value={offerCtc}
                    onChange={(e) => setOfferCtc(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-500"
                  >
                    Issue Offer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Offers Table */}
        <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Released Offers ({offers.length})</h3>
            <span className="text-xs text-slate-500">2 Accepted · 1 Pending Review</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200/80 text-slate-600 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-5">Offer ID</th>
                  <th className="py-3 px-5">Candidate</th>
                  <th className="py-3 px-5">Branch</th>
                  <th className="py-3 px-5">Role</th>
                  <th className="py-3 px-5">CTC Package</th>
                  <th className="py-3 px-5">Released Date</th>
                  <th className="py-3 px-5">Acceptance Status</th>
                  <th className="py-3 px-5 text-right">Letter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {offers.map((off) => (
                  <tr key={off.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-slate-700">{off.id}</td>
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-slate-900 block">{off.candidate}</span>
                      <span className="text-[11px] text-slate-500">Reg {off.reg}</span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">{off.branch}</td>
                    <td className="py-3.5 px-5 font-medium text-slate-800">{off.role}</td>
                    <td className="py-3.5 px-5 font-bold text-teal-800">{off.ctc}</td>
                    <td className="py-3.5 px-5 text-slate-500">{off.date}</td>
                    <td className="py-3.5 px-5">
                      <StatusBadge
                        status={off.status}
                        variant={off.status === 'Accepted' ? 'success' : 'warning'}
                      />
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        type="button"
                        className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayoutShell>
  );
}
