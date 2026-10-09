'use client';

import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  ArrowRight,
  Search,
  Filter,
  ShieldCheck,
  Award,
  Users,
  X,
  FileCheck,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PS10Notice } from '@/components/common/PS10Notice';
import { DEMO_JOBS } from '@/lib/demoData';

interface DriveItem {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  packageCTC: string;
  minCGPA: number;
  branches: string[];
  batch: string;
  status: string;
  deadline: string;
  rolesDescription: string;
  applicantsCount: number;
  shortlistedCount: number;
  offersCount: number;
  rounds: string[];
}

export default function OfficerDrivesPage() {
  const [drives, setDrives] = useState<DriveItem[]>(DEMO_JOBS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [inspectDrive, setInspectDrive] = useState<DriveItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // New drive form state
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [packageCTC, setPackageCTC] = useState('₹8.50 - 12.00 LPA');
  const [minCGPA, setMinCGPA] = useState('7.0');
  const [deadline, setDeadline] = useState('2026-11-15');
  const [selectedBranches, setSelectedBranches] = useState<string[]>(['CSE', 'IT']);
  const [roundsText, setRoundsText] = useState('Online Assessment, Technical Interview, HR Round');

  const filteredDrives = drives.filter((d) => {
    const matchesSearch =
      d.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleBranch = (b: string) => {
    if (selectedBranches.includes(b)) {
      setSelectedBranches(selectedBranches.filter((x) => x !== b));
    } else {
      setSelectedBranches([...selectedBranches, b]);
    }
  };

  const handleRegisterDrive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !title.trim()) return;

    const newDrive: DriveItem = {
      id: `drive_${Date.now()}`,
      company: company.trim(),
      title: title.trim(),
      location: 'Bhubaneswar / Hybrid',
      type: 'Full-time',
      packageCTC,
      minCGPA: parseFloat(minCGPA) || 7.0,
      branches: selectedBranches.length > 0 ? selectedBranches : ['CSE', 'IT'],
      batch: '2026 Graduating',
      status: 'Active',
      deadline,
      rolesDescription: `Official BPUT campus recruitment drive for ${title.trim()} at ${company.trim()}.`,
      applicantsCount: 0,
      shortlistedCount: 0,
      offersCount: 0,
      rounds: roundsText.split(',').map((r) => r.trim()).filter(Boolean),
    };

    setDrives([newDrive, ...drives]);
    setShowRegisterModal(false);
    setCompany('');
    setTitle('');
    setNotification(`Successfully registered campus drive for ${newDrive.company}. Drive slot locked.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const toggleDriveStatus = (id: string) => {
    setDrives((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const nextStatus = d.status === 'Active' ? 'Completed' : 'Active';
          setNotification(`Updated ${d.company} drive status to ${nextStatus}.`);
          setTimeout(() => setNotification(null), 3000);
          return { ...d, status: nextStatus };
        }
        return d;
      })
    );
  };

  return (
    <ProtectedRoute allowedRole="PLACEMENT_OFFICER">
      <AppLayoutShell role="officer">
      <PageHeader
        title="Placement Drives Coordination & Governance"
        description="Official approval, slot allocation, and monitoring of visiting corporate recruitment drives"
        badge="Drive Orchestration"
      >
        <button
          type="button"
          onClick={() => setShowRegisterModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Register Campus Drive</span>
        </button>
      </PageHeader>

      <div className="space-y-6">
        <PS10Notice
          moduleName="Campus Drive Lifecycle Governance"
          nextStepDetail="Active drive approval workflows, eligibility lock-in, and multi-stage recruiter tracking."
        />

        {notification && (
          <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-xs font-bold text-teal-800 flex items-center gap-2 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Search & Filter Strip */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search visiting company or recruitment profile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-teal-600 focus:outline-hidden shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-semibold text-slate-700 focus:border-teal-600 focus:outline-hidden shadow-2xs"
            >
              <option value="ALL">All Statuses ({drives.length})</option>
              <option value="Active">Active Drives</option>
              <option value="Upcoming">Upcoming Drives</option>
              <option value="Completed">Completed Drives</option>
            </select>
          </div>
        </div>

        {/* Drives Grid */}
        <div className="space-y-4">
          {filteredDrives.map((drive) => (
            <div
              key={drive.id}
              className="rounded-2xl border border-slate-200/90 bg-white p-5 md:p-6 shadow-xs hover:border-teal-200 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-extrabold text-slate-900">{drive.company}</h3>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        drive.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {drive.status === 'Active' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />}
                      {drive.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{drive.title} · {drive.location}</p>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="rounded-xl bg-teal-50 border border-teal-200/80 px-3 py-1 text-xs font-mono font-bold text-teal-800">
                    {drive.packageCTC}
                  </span>
                  <button
                    type="button"
                    onClick={() => setInspectDrive(drive)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                  >
                    Inspect
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleDriveStatus(drive.id)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                  >
                    {drive.status === 'Active' ? 'Mark Completed' : 'Activate'}
                  </button>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Candidate Pool</span>
                  <span className="font-extrabold text-slate-900 text-sm font-mono">{drive.applicantsCount} Enrolled</span>
                </div>
                <div className="rounded-xl bg-teal-50/50 p-3 border border-teal-100">
                  <span className="text-teal-800 block text-[10px] font-bold uppercase tracking-wider">Shortlisted</span>
                  <span className="font-extrabold text-teal-950 text-sm font-mono">{drive.shortlistedCount} Selected</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Eligibility Cutoff</span>
                  <span className="font-bold text-slate-800 text-xs">Min {drive.minCGPA} CGPA ({drive.branches.join(', ')})</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Target Deadline</span>
                  <span className="font-bold text-slate-800 text-xs">{drive.deadline}</span>
                </div>
              </div>

              {/* Evaluation Flow */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 pt-1">
                <span className="font-bold text-slate-700 mr-1 text-[11px]">Evaluation Rounds:</span>
                {drive.rounds.map((round, i) => (
                  <span
                    key={i}
                    className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200/70"
                  >
                    {i + 1}. {round}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Register New Campus Drive Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Register Visiting Campus Drive
                </h3>
                <p className="text-xs text-slate-500">Official placement cell accreditation & schedule lockdown</p>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterDrive} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Infosys Limited"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-teal-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Role Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Systems Engineer Specialist"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-teal-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Annual CTC Package
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹9.50 LPA"
                    value={packageCTC}
                    onChange={(e) => setPackageCTC(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-teal-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Minimum CGPA Cutoff
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="5.0"
                    max="10.0"
                    required
                    value={minCGPA}
                    onChange={(e) => setMinCGPA(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-teal-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Eligible Disciplines (BPUT Batch 2026)
                </label>
                <div className="flex flex-wrap gap-2">
                  {['CSE', 'IT', 'ECE', 'EE', 'Mechanical', 'Civil'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => toggleBranch(b)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        selectedBranches.includes(b)
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Evaluation Stages (Comma Separated)
                </label>
                <input
                  type="text"
                  required
                  value={roundsText}
                  onChange={(e) => setRoundsText(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-teal-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white hover:bg-teal-500 shadow-xs cursor-pointer"
                >
                  Authorize Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Drive Modal */}
      {inspectDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                  Drive Dossier & Accreditation
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                  {inspectDrive.company} — {inspectDrive.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectDrive(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">{inspectDrive.rolesDescription}</p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase">Compensation</span>
                  <p className="font-extrabold text-teal-800 font-mono text-sm">{inspectDrive.packageCTC}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase">Cutoff Criteria</span>
                  <p className="font-bold text-slate-800">Min CGPA {inspectDrive.minCGPA}</p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1.5">
                <span className="text-slate-400 text-[10px] font-bold uppercase">Target Disciplines</span>
                <div className="flex flex-wrap gap-1.5">
                  {inspectDrive.branches.map((b) => (
                    <span key={b} className="rounded bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInspectDrive(null)}
                className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-500 shadow-xs cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayoutShell>
    </ProtectedRoute>
  );
}
