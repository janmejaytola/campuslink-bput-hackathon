'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  CheckCircle2,
  Clock,
  Plus,
  FileText,
  Download,
  AlertCircle,
  TrendingUp,
  Building,
  UserCheck,
  X,
  Search,
  Filter,
  ShieldCheck,
  ChevronRight,
  DollarSign,
  Briefcase,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PS10Notice } from '@/components/common/PS10Notice';
import { useAuth } from '@/context/AuthContext';

interface OfferItem {
  id: string;
  candidate: string;
  reg: string;
  branch: string;
  role: string;
  ctc: string;
  ctcNumber: number;
  date: string;
  status: 'Pending Review' | 'Accepted' | 'Declined';
  doc: string;
  joiningDate: string;
  location: string;
}

const INITIAL_OFFERS: OfferItem[] = [
  {
    id: 'OFF-TCS-2026-01',
    candidate: 'Priyanshu Mohanty',
    reg: '2201106284',
    branch: 'CSE',
    role: 'Digital Software Engineer',
    ctc: '₹9.20 LPA',
    ctcNumber: 9.2,
    date: '2026-10-02',
    status: 'Pending Review',
    doc: 'BPUT-TCS-OFFER-2026-8821.pdf',
    joiningDate: '2026-07-01',
    location: 'Bengaluru / Bhubaneswar',
  },
  {
    id: 'OFF-TCS-2026-02',
    candidate: 'Priyanka Das',
    reg: '2201106190',
    branch: 'IT',
    role: 'Digital Software Engineer',
    ctc: '₹9.20 LPA',
    ctcNumber: 9.2,
    date: '2026-09-30',
    status: 'Accepted',
    doc: 'BPUT-TCS-OFFER-2026-8819.pdf',
    joiningDate: '2026-07-01',
    location: 'Bengaluru',
  },
  {
    id: 'OFF-TCS-2026-03',
    candidate: 'Sneha Nayak',
    reg: '2201106405',
    branch: 'CSE',
    role: 'Associate Cloud Engineer',
    ctc: '₹7.50 LPA',
    ctcNumber: 7.5,
    date: '2026-09-29',
    status: 'Accepted',
    doc: 'BPUT-TCS-OFFER-2026-8815.pdf',
    joiningDate: '2026-08-01',
    location: 'Hyderabad',
  },
  {
    id: 'OFF-TCS-2026-04',
    candidate: 'Aarav Mohapatra',
    reg: '2201106012',
    branch: 'ECE',
    role: 'Embedded Firmware Specialist',
    ctc: '₹8.50 LPA',
    ctcNumber: 8.5,
    date: '2026-10-01',
    status: 'Accepted',
    doc: 'BPUT-TCS-OFFER-2026-8824.pdf',
    joiningDate: '2026-07-15',
    location: 'Pune',
  },
];

export default function RecruiterOffersPage() {
  const { currentUser } = useAuth();
  const [offers, setOffers] = useState<OfferItem[]>(INITIAL_OFFERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [candidateReg, setCandidateReg] = useState('2201106312');
  const [candidateBranch, setCandidateBranch] = useState('CSE');
  const [offerRole, setOfferRole] = useState('Digital Software Engineer');
  const [offerCtc, setOfferCtc] = useState('₹9.20 LPA');
  const [offerLocation, setOfferLocation] = useState('Bengaluru');
  const [joiningDate, setJoiningDate] = useState('2026-07-01');
  const [notification, setNotification] = useState<string | null>(null);

  const filteredOffers = offers.filter((o) => {
    const matchesSearch =
      o.candidate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.reg.includes(searchTerm) ||
      o.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleGenerateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim()) return;

    const newOffer: OfferItem = {
      id: `OFF-${currentUser?.company ? currentUser.company.substring(0, 3).toUpperCase() : 'REC'}-2026-0${
        offers.length + 1
      }`,
      candidate: candidateName.trim(),
      reg: candidateReg.trim(),
      branch: candidateBranch,
      role: offerRole,
      ctc: offerCtc,
      ctcNumber: parseFloat(offerCtc.replace(/[^0-9.]/g, '')) || 8.5,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending Review',
      doc: `BPUT-OFFER-2026-${Math.floor(1000 + Math.random() * 9000)}.pdf`,
      joiningDate,
      location: offerLocation,
    };

    setOffers([newOffer, ...offers]);
    setShowModal(false);
    setCandidateName('');
    setNotification(`Formal offer letter generated for ${newOffer.candidate} (${newOffer.ctc}).`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleUpdateStatus = (offerId: string, newStatus: 'Accepted' | 'Declined') => {
    setOffers(
      offers.map((o) => (o.id === offerId ? { ...o, status: newStatus } : o))
    );
    setNotification(`Offer ${offerId} marked as ${newStatus}.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const totalOffers = offers.length;
  const acceptedOffers = offers.filter((o) => o.status === 'Accepted').length;
  const pendingOffers = offers.filter((o) => o.status === 'Pending Review').length;
  const acceptanceRate = totalOffers > 0 ? Math.round((acceptedOffers / totalOffers) * 100) : 0;

  return (
    <ProtectedRoute allowedRole="RECRUITER">
      <AppLayoutShell role="recruiter">
        <PageHeader
          title="Offer Letter Issuance & Acceptance Registry"
          description="Issue formal campus placement offers, manage compensation packages (CTC), and track institutional acceptance telemetry in compliance with BPUT placement guidelines."
          badge="BPUT Offer Registry"
        >
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Roll Out New Offer</span>
          </button>
        </PageHeader>

        <div className="space-y-6">
          <PS10Notice
            moduleName="Formal Offer Governance & Verification"
            nextStepDetail="Every rolled-out offer is assigned an institutional hash verified by BPUT Central Placement Office."
          />

          {notification && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs font-semibold text-emerald-900 flex items-center gap-2.5 shadow-2xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{notification}</span>
            </div>
          )}

          {/* Offer Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Offers Rolled Out
              </span>
              <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
                {totalOffers}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Campus requisitions 2026</p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Accepted by Students
              </span>
              <p className="text-2xl font-black text-emerald-950 mt-1 font-mono">
                {acceptedOffers}
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">
                {acceptanceRate}% Conversion Rate
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Pending Acceptance
              </span>
              <p className="text-2xl font-black text-amber-950 mt-1 font-mono">
                {pendingOffers}
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5 font-medium">Candidate decision window open</p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Median Package (CTC)
              </span>
              <p className="text-2xl font-black text-teal-900 mt-1 font-mono">₹9.20 LPA</p>
              <p className="text-[11px] text-teal-700 mt-0.5 font-medium">Standard BPUT Tier-1</p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by candidate name, roll number, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-hidden transition-all shadow-2xs"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-xs text-slate-500 font-semibold">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Declined">Declined</option>
                </select>
              </div>
            </div>
          </div>

          {/* Offers Table */}
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px] font-bold">
                  <tr>
                    <th className="py-3.5 px-5">Offer ID</th>
                    <th className="py-3.5 px-5">Candidate Name</th>
                    <th className="py-3.5 px-5">Designation</th>
                    <th className="py-3.5 px-5">Compensation (CTC)</th>
                    <th className="py-3.5 px-5">Issued Date</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOffers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-500">
                        <Award className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-700 text-xs">No offer records match current filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOffers.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-5 font-mono font-semibold text-slate-700">
                          {o.id}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="font-bold text-slate-900 block">{o.candidate}</span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            Roll #{o.reg} · {o.branch}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-semibold text-slate-800">
                          {o.role}
                          <span className="block text-[11px] text-slate-400 font-normal">
                            Loc: {o.location}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="font-mono font-black text-slate-900 text-sm">
                            {o.ctc}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-600">
                          {o.date}
                        </td>
                        <td className="py-3.5 px-5">
                          <StatusBadge
                            status={o.status}
                            variant={
                              o.status === 'Accepted'
                                ? 'success'
                                : o.status === 'Pending Review'
                                ? 'warning'
                                : 'danger'
                            }
                          />
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {o.status === 'Pending Review' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(o.id, 'Accepted')}
                                className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs"
                              >
                                Mark Accepted
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setNotification(`Downloading official signed letter: ${o.doc}`);
                                setTimeout(() => setNotification(null), 3000);
                              }}
                              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
                              title="Download Offer PDF"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Roll Out Offer Modal */}
        {showModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="rollout-offer-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto"
            onClick={() => setShowModal(false)}
          >
            <div
              className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 md:p-8 shadow-2xl space-y-5 text-slate-900 my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 id="rollout-offer-title" className="text-xl font-black text-slate-900">
                    Roll Out Placement Offer
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Generate an official university offer letter with compensation breakdown
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleGenerateOffer} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Candidate Full Name *
                  </label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="e.g. Debashis Panda"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 font-medium text-slate-900 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      BPUT Registration Roll *
                    </label>
                    <input
                      type="text"
                      value={candidateReg}
                      onChange={(e) => setCandidateReg(e.target.value)}
                      placeholder="2201106284"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 font-medium text-slate-900 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Engineering Discipline *
                    </label>
                    <select
                      value={candidateBranch}
                      onChange={(e) => setCandidateBranch(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 font-medium text-slate-900 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                    >
                      <option value="CSE">CSE</option>
                      <option value="IT">IT</option>
                      <option value="ECE">ECE</option>
                      <option value="EE">EE</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Role / Designation *
                    </label>
                    <input
                      type="text"
                      value={offerRole}
                      onChange={(e) => setOfferRole(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 font-medium text-slate-900 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Compensation Package (CTC) *
                    </label>
                    <input
                      type="text"
                      value={offerCtc}
                      onChange={(e) => setOfferCtc(e.target.value)}
                      placeholder="₹9.20 LPA"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 font-medium text-slate-900 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Work Location *
                    </label>
                    <input
                      type="text"
                      value={offerLocation}
                      onChange={(e) => setOfferLocation(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 font-medium text-slate-900 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Tentative Date of Joining *
                    </label>
                    <input
                      type="date"
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 font-medium text-slate-900 focus:border-teal-500 focus:outline-hidden shadow-2xs"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-xs"
                  >
                    Generate & Dispatch Offer Letter
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AppLayoutShell>
    </ProtectedRoute>
  );
}
