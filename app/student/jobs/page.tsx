'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Building,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PS10Notice } from '@/components/common/PS10Notice';
import { DEMO_JOBS } from '@/lib/demoData';
import { useAuth } from '@/context/AuthContext';
import { jobService } from '@/lib/services/jobService';

export default function StudentJobsPage() {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedJobs, setAppliedJobs] = useState<string[]>(['job_101', 'job_102', 'job_103']);
  const [modalJob, setModalJob] = useState<string | null>(null);
  const [allJobs, setAllJobs] = useState(DEMO_JOBS);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const live = await jobService.getOpenJobs();
        if (active && live.length > 0) {
          const liveMapped = live.map((j) => ({
            id: j.id,
            title: j.title,
            company: j.company,
            location: j.location,
            type: j.employmentType === 'INTERNSHIP' ? ('Internship' as const) : ('Full-time' as const),
            packageCTC: j.salaryMin && j.salaryMax ? `₹${(j.salaryMin / 100000).toFixed(1)} - ${(j.salaryMax / 100000).toFixed(1)} LPA` : '₹7.0 - 10.0 LPA',
            minCGPA: j.eligibility?.minCgpa || 7.0,
            branches: j.eligibility?.branches?.length ? j.eligibility.branches : ['CSE', 'IT', 'ECE'],
            batch: '2026 Graduating',
            status: 'Active' as const,
            deadline: j.applicationDeadline || '2026-11-30',
            rolesDescription: j.description,
            applicantsCount: 0,
            shortlistedCount: 0,
            offersCount: 0,
            rounds: ['Online Assessment', 'Technical Round', 'HR'],
          }));
          const existingIds = new Set(liveMapped.map((l) => l.id));
          const combined = [...liveMapped, ...DEMO_JOBS.filter((dj) => !existingIds.has(dj.id))];
          setAllJobs(combined);
        }
      } catch (e) {
        // Fallback to demo jobs
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filteredJobs = allJobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApply = (jobId: string) => {
    if (!appliedJobs.includes(jobId)) {
      setAppliedJobs([...appliedJobs, jobId]);
      setModalJob(jobId);
    }
  };

  return (
    <ProtectedRoute allowedRole="STUDENT">
      <AppLayoutShell role="student">
      <PageHeader
        title="Campus Placement Drives & Openings"
        description="Official recruitment drives approved by BPUT Central Placement Cell for Batch of 2026"
        badge="Active Drives"
      >
        <Link
          href="/student/applications"
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-500 transition-colors shadow-xs"
        >
          View My Applications ({appliedJobs.length})
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </PageHeader>

      <div className="space-y-6">
        <PS10Notice
          moduleName="Placement Drive Catalog & Deterministic Eligibility"
          nextStepDetail="Active recruitment opportunities synchronized with rule-based academic qualification criteria."
        />

        {modalJob && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Application successfully submitted! Eligibility verified against BPUT dossier.</span>
            </div>
            <button
              onClick={() => setModalJob(null)}
              className="text-xs text-emerald-700 hover:text-emerald-900 underline font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by company, role title, or tech stack..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 focus:border-teal-500 focus:outline-hidden shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Batch: 2026 Graduating</span>
          </div>
        </div>

        {/* Job Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredJobs.map((job) => {
            const isApplied = appliedJobs.includes(job.id);
            const userCGPA = currentUser?.cgpa || 8.82;
            const isEligible = userCGPA >= job.minCGPA;

            return (
              <div
                key={job.id}
                className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-slate-300 transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {job.company}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">{job.title}</h3>
                    </div>
                    <span className="rounded-md bg-teal-50 border border-teal-200 px-2 py-0.5 text-xs font-bold text-teal-800 shrink-0">
                      {job.packageCTC}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                    {job.rolesDescription}
                  </p>

                  {/* Criteria & Badges */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        Deadline: {job.deadline}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500">
                        Branches: <strong className="text-slate-700">{job.branches.join(', ')}</strong>
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Min CGPA: <strong className="text-slate-700">{job.minCGPA}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer / Eligibility & CTA */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs">
                    {isEligible ? (
                      <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Eligible (CGPA {userCGPA} ≥ {job.minCGPA})
                      </span>
                    ) : (
                      <span className="text-amber-700 font-medium inline-flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        CGPA threshold not met
                      </span>
                    )}
                  </div>

                  {isApplied ? (
                    <span className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">
                      Applied ✓
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApply(job.id)}
                      disabled={!isEligible}
                      className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white transition-colors ${
                        isEligible
                          ? 'bg-teal-600 hover:bg-teal-500 shadow-xs'
                          : 'bg-slate-300 cursor-not-allowed text-slate-500'
                      }`}
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayoutShell>
    </ProtectedRoute>
  );
}
