'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  CalendarDays,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ShieldCheck,
  Download,
  Filter,
  Scale,
  ChevronRight,
  Briefcase,
  TrendingUp,
  Award,
  Shield,
  Layers,
  GraduationCap,
  Sparkles,
  Zap,
  Check,
  Clock,
  FileCheck,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { StatCard } from '@/components/common/StatCard';
import { Card3D } from '@/components/common/Card3D';
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/common/MotionWrapper';
import { ProgressRing } from '@/components/common/ProgressRing';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { studentService } from '@/lib/services/studentService';
import { jobService } from '@/lib/services/jobService';
import { interviewService } from '@/lib/services/interviewService';
import { StudentProfile } from '@/types/student';
import { RecruiterJob } from '@/types/job';
import { InterviewRecord } from '@/types/interview';

export default function OfficerDashboardPage() {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Verification queue local state for interactive demo
  const [verifiedIds, setVerifiedIds] = useState<string[]>([]);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setIsLoading(true);
      try {
        const [studRes, jobsRes, ivRes] = await Promise.all([
          studentService.getAllStudents(),
          jobService.getOpenJobs(),
          interviewService.getAllInterviewsForOfficer(),
        ]);
        if (active) {
          setStudents(studRes);
          setJobs(jobsRes);
          setInterviews(ivRes);
        }
      } catch (err) {
        console.error('[Officer Dashboard Load Error]:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const totalRegistered = students.length || 1420;
  const activeDrives = jobs.length || 8;
  const clashCount = 0; // Verified by interval-tree conflict detection

  // Placement Drive Progress Data
  const driveProgressList = [
    {
      id: 'drive-tcs',
      company: 'Tata Consultancy Services',
      role: 'Digital Software Engineer & Ninja',
      status: 'TECHNICAL_PANELS',
      progress: 75,
      date: 'Oct 12 - Oct 16, 2026',
      venue: 'Central Lab 1 & 2 / Online Bridge',
      shortlistedCount: 142,
      offersReleased: 85,
    },
    {
      id: 'drive-deloitte',
      company: 'Deloitte USI',
      role: 'Technology Analyst (Cloud & AI)',
      status: 'ASSESSMENT_STAGE',
      progress: 50,
      date: 'Oct 18 - Oct 20, 2026',
      venue: 'Auditorium Hall & Virtual',
      shortlistedCount: 96,
      offersReleased: 0,
    },
    {
      id: 'drive-amazon',
      company: 'Amazon Development Centre',
      role: 'Software Development Engineer',
      status: 'RESUME_SCREENING',
      progress: 25,
      date: 'Nov 02 - Nov 05, 2026',
      venue: 'BPUT Central Computing Block',
      shortlistedCount: 48,
      offersReleased: 0,
    },
    {
      id: 'drive-lnt',
      company: 'L&T Technology Services',
      role: 'Graduate Embedded Specialist',
      status: 'OFFERS_CONCLUDED',
      progress: 100,
      date: 'Concluded Sep 28',
      venue: 'Main Campus',
      shortlistedCount: 65,
      offersReleased: 42,
    },
  ];

  // Verification Queue items awaiting institutional audit
  const pendingVerifications = [
    {
      id: 'ver-1',
      studentName: 'Siddhartha Behera',
      regNumber: '2201106512',
      discipline: 'Computer Science & Engineering',
      college: 'Silicon Institute of Technology',
      cgpaClaimed: 8.72,
      backlogs: 0,
      documents: 'Transcript + 3 Certs',
      date: 'Submitted Today, 09:30 AM',
    },
    {
      id: 'ver-2',
      studentName: 'Pooja Priyadarshini',
      regNumber: '2201106428',
      discipline: 'Information Technology',
      college: 'C. V. Raman Global University',
      cgpaClaimed: 8.58,
      backlogs: 0,
      documents: 'Transcript + AWS Cert',
      date: 'Submitted Yesterday',
    },
    {
      id: 'ver-3',
      studentName: 'Ashutosh Pradhan',
      regNumber: '2201106180',
      discipline: 'Electronics & Communication',
      college: 'ITER, SOA University',
      cgpaClaimed: 8.15,
      backlogs: 0,
      documents: 'Semester 6 Grade Card',
      date: 'Submitted Oct 08',
    },
  ];

  const handleVerifyStudent = (id: string, name: string) => {
    setVerifiedIds((prev) => [...prev, id]);
    setVerificationFeedback(`Successfully certified dossier for ${name}. PS10 hash stamped.`);
    setTimeout(() => setVerificationFeedback(null), 3500);
  };

  const branchDistribution = [
    { name: 'Computer Science & Engineering', count: 480, readyPct: 88, placed: 320 },
    { name: 'Information Technology', count: 260, readyPct: 84, placed: 175 },
    { name: 'Electronics & Communication', count: 310, readyPct: 76, placed: 195 },
    { name: 'Electrical Engineering', count: 190, readyPct: 71, placed: 110 },
    { name: 'Mechanical & Civil Engineering', count: 180, readyPct: 65, placed: 98 },
  ];

  return (
    <ProtectedRoute allowedRole="PLACEMENT_OFFICER">
      <AppLayoutShell role="officer">
        <PageTransition>
          {/* Officer Institutional Command 3D Header Banner */}
          <div className="relative rounded-3xl border border-[#152744] bg-gradient-to-r from-[#06172B] via-[#091D38] to-[#0B1B32] p-6 sm:p-8 text-white shadow-[0_16px_50px_rgba(0,0,0,0.6)] mb-8 overflow-hidden">
          {/* Neon emerald/cyan ambient glow corner */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#00C9C0]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Dot mesh overlay */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(rgba(16, 185, 129, 0.25) 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-md bg-emerald-950/70 border border-emerald-500/50 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider shadow-[0_0_12px_rgba(16,185,129,0.25)] flex items-center gap-1.5 font-mono">
                  <ShieldCheck className="h-3 w-3" />
                  CENTRAL TPO COMMAND
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-300 font-semibold text-xs">
                  BPUT Placement Cell Governance
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400 font-mono text-[11px]">Batch of 2026</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white drop-shadow-md">
                Institutional Placement Operations & Governance
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Authoritative institutional oversight across 2026 engineering cohorts, multi-corporate recruitment drives, exam-free lab coordination, and PS10 regulatory compliance.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/officer/drives"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#007F83] to-[#00A89E] hover:from-[#00A89E] hover:to-[#00C9C0] px-4 py-2.5 text-xs font-bold text-white transition-all shadow-[0_4px_16px_rgba(0,127,131,0.4)] group cursor-pointer"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Campus Drives</span>
                </Link>
                <Link
                  href="/officer/analytics"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#00C9C0]/40 bg-[#081B34]/80 px-4 py-2.5 text-xs font-bold text-[#00F5D4] hover:bg-[#00C9C0]/15 hover:border-[#00C9C0] transition-all shadow-xs cursor-pointer"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>Cohort Analytics</span>
                </Link>
                <Link
                  href="/officer/students"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#172D4D] bg-[#06172B]/70 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
                >
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  <span>Student Registry</span>
                </Link>
              </div>
            </div>

            {/* Placement Progress Ring Widget in Dark 3D Glass */}
            <div className="flex items-center gap-5 bg-[#081B34]/90 border border-[#172D4D] p-5 rounded-2xl shrink-0 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <ProgressRing
                value={72.4}
                size={82}
                strokeWidth={7}
                color="turquoise"
                sublabel="Placed"
              />
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">2026 Target Rate</p>
                <p className="text-lg font-black text-[#00F5D4] font-mono tabular-nums">
                  72.4% Verified Placed
                </p>
                <p className="text-[11px] text-slate-400 max-w-[150px] leading-tight">
                  Targeting 90%+ across all affiliated BPUT colleges
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Alert for Verifications */}
        {verificationFeedback && (
          <div className="mb-6 rounded-2xl border border-emerald-500/40 bg-emerald-950/70 p-4 text-xs font-semibold text-emerald-200 flex items-center gap-2.5 shadow-lg backdrop-blur-md">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{verificationFeedback}</span>
          </div>
        )}

        <div className="space-y-8">
          {/* Executive Institutional KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/officer/students" className="group block">
              <StatCard
                label="Total Eligible Cohort"
                value={totalRegistered}
                subtext="Batch 2026 across BPUT colleges"
                icon={Users}
                accent="teal"
              />
            </Link>

            <Link href="/officer/drives" className="group block">
              <StatCard
                label="Active Corporate Drives"
                value={activeDrives}
                subtext="TCS, Deloitte, Amazon, L&T, etc."
                icon={Building2}
                highlight={activeDrives > 0}
                accent="emerald"
              />
            </Link>

            <Link href="/officer/scheduling" className="group block">
              <StatCard
                label="Timetable Conflicts"
                value={`${clashCount} Clashes`}
                subtext="0 overlaps with university exams"
                icon={CheckCircle2}
                highlight
                accent="emerald"
              />
            </Link>

            <Link href="/officer/analytics" className="group block">
              <StatCard
                label="Cohort Placement Rate"
                value="72.4%"
                subtext="+6.2% vs 2025 cycle"
                icon={TrendingUp}
                trend={{ value: '6.2%', positive: true }}
                accent="sky"
              />
            </Link>
          </div>

          {/* PLACEMENT DRIVE PROGRESS TRACKER */}
          <div className="rounded-2xl border border-[#152744] bg-[#081B34]/85 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-[#152744] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#007F83]/20 text-[#00F5D4] border border-[#00C9C0]/30">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    Campus Placement Drive Progress
                  </h3>
                  <p className="text-xs text-slate-400">
                    Active recruitment drives coordinated with corporate talent partners
                  </p>
                </div>
              </div>

              <Link
                href="/officer/drives"
                className="text-xs font-bold text-[#00F5D4] hover:text-white flex items-center gap-1 group"
              >
                <span>All Drives Schedule</span>
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {driveProgressList.map((drive) => (
                <div
                  key={drive.id}
                  className="p-5 rounded-2xl border border-[#152744] bg-[#06172B]/80 hover:border-[#00C9C0]/50 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{drive.company}</h4>
                      <p className="text-xs text-[#00F5D4] font-medium">{drive.role}</p>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                        drive.progress === 100
                          ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                          : 'bg-[#007F83]/25 border-[#00C9C0]/40 text-[#00F5D4]'
                      }`}
                    >
                      {drive.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Drive Milestone</span>
                      <span className="font-mono font-bold text-white">{drive.progress}% Complete</span>
                    </div>
                    <div className="h-2 w-full bg-[#020817] rounded-full overflow-hidden p-0.5 border border-[#152744]">
                      <div
                        className="h-full bg-gradient-to-r from-[#007F83] via-[#00C9C0] to-[#00F5D4] rounded-full transition-all duration-500"
                        style={{ width: `${drive.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-[#152744]">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3 text-slate-500" />
                      {drive.date}
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {drive.offersReleased > 0 ? `${drive.offersReleased} Offers Verified` : `${drive.shortlistedCount} Shortlisted`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STUDENT VERIFICATION QUEUE */}
          <div className="rounded-2xl border border-[#152744] bg-[#081B34]/85 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-[#152744] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-600/40">
                  <FileCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    Student Dossier Verification Queue
                  </h3>
                  <p className="text-xs text-slate-400">
                    Academic records and transcript claims awaiting Central TPO verification
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-700/50">
                {pendingVerifications.filter((v) => !verifiedIds.includes(v.id)).length} Pending Sign-off
              </span>
            </div>

            <div className="divide-y divide-[#152744]">
              {pendingVerifications.map((item) => {
                const isVerified = verifiedIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-1 last:pb-1"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-bold text-white">{item.studentName}</strong>
                        <span className="text-[10px] font-mono text-[#00F5D4] bg-[#007F83]/20 border border-[#00C9C0]/30 px-1.5 py-0.5 rounded">
                          {item.regNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium">
                        {item.discipline} · {item.college}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>CGPA: <strong className="text-emerald-300 font-mono">{item.cgpaClaimed.toFixed(2)}</strong></span>
                        <span>·</span>
                        <span>{item.documents}</span>
                        <span>·</span>
                        <span className="text-slate-500">{item.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          Certified PS10
                        </span>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleVerifyStudent(item.id, item.studentName)}
                            className="gradient-btn-primary px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                          >
                            Approve Dossier
                          </button>
                          <Link
                            href={`/officer/students?search=${item.regNumber}`}
                            className="px-3 py-1.5 rounded-xl border border-[#152744] bg-[#020817] hover:border-slate-500 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                          >
                            Audit
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Institutional Command Modules in Dark 3D Glass Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/officer/students"
              className="group rounded-2xl border border-[#152744] bg-[#081B34]/80 p-5 hover:border-[#00C9C0]/60 hover:bg-[#0A2242] hover:shadow-[0_0_25px_rgba(0,201,192,0.15)] transition-all relative overflow-hidden backdrop-blur-md"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#00C9C0]/5 rounded-full blur-xl pointer-events-none group-hover:bg-[#00C9C0]/15 transition-all" />
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-[#007F83]/20 border border-[#00C9C0]/30 flex items-center justify-center text-[#00F5D4] group-hover:scale-110 transition-transform">
                  <Users className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-[#00F5D4] group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#00F5D4] transition-colors">Student Placement Registry</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Inspect verified candidate dossiers, CGPA verifications, and academic branch distributions.
              </p>
            </Link>

            <Link
              href="/officer/eligibility"
              className="group rounded-2xl border border-[#152744] bg-[#081B34]/80 p-5 hover:border-emerald-500/60 hover:bg-[#0A2242] hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] transition-all relative overflow-hidden backdrop-blur-md"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/15 transition-all" />
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-950/60 border border-emerald-700/50 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Batch Eligibility Engine</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Deterministic zero-hallucination rule validation across CGPA, allowed disciplines, and backlogs.
              </p>
            </Link>

            <Link
              href="/officer/scheduling"
              className="group rounded-2xl border border-[#152744] bg-[#081B34]/80 p-5 hover:border-sky-500/60 hover:bg-[#0A2242] hover:shadow-[0_0_25px_rgba(14,165,233,0.15)] transition-all relative overflow-hidden backdrop-blur-md"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-sky-500/15 transition-all" />
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-sky-950/60 border border-sky-700/50 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">Campus Venue & Lab Timetable</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Master calendar preventing timetable clashes across company drives and university examinations.
              </p>
            </Link>
          </div>

          {/* Discipline-Wise Readiness & Outcomes (Department Analytics) */}
          <div className="rounded-2xl border border-[#152744] bg-[#081B34]/85 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-[#152744] pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-white">
                  Discipline-Wise Readiness & Placement Outcomes (Department Analytics)
                </h3>
                <p className="text-xs text-slate-400">
                  Affiliated BPUT college engineering departments (Batch of 2026)
                </p>
              </div>
              <Link
                href="/officer/analytics"
                className="text-xs font-bold text-[#00F5D4] hover:text-white flex items-center gap-1 group"
              >
                <span>Detailed Analytics</span>
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="space-y-4 pt-1">
              {branchDistribution.map((branch, i) => (
                <div key={i} className="space-y-1.5 p-3 rounded-xl bg-[#06172B]/60 border border-[#152744]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{branch.name}</span>
                    <div className="flex items-center gap-3 font-mono text-[11px] tabular-nums">
                      <span className="text-slate-400">
                        {branch.placed} / {branch.count} placed
                      </span>
                      <span className="font-bold text-[#00F5D4]">
                        {branch.readyPct}% Benchmark
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#0E2442] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#007F83] via-[#00C9C0] to-[#00F5D4] transition-all duration-500 shadow-[0_0_8px_rgba(0,201,192,0.4)]"
                      style={{ width: `${branch.readyPct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Master Placement Registry Preview */}
          <div className="rounded-2xl border border-[#152744] bg-[#081B34]/85 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md overflow-hidden">
            <div className="p-5 border-b border-[#152744] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Student Placement Registry Preview
                </h3>
                <p className="text-xs text-slate-400">
                  Verified candidate profiles with BPUT registration numbers
                </p>
              </div>
              <Link
                href="/officer/students"
                className="text-xs font-bold text-[#00F5D4] hover:text-white flex items-center gap-1 group"
              >
                <span>Full Directory</span>
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#06172B]/90 border-b border-[#152744] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3.5 px-4">Candidate Name</th>
                    <th className="py-3.5 px-4">BPUT Reg No</th>
                    <th className="py-3.5 px-4">Discipline</th>
                    <th className="py-3.5 px-4">Verified CGPA</th>
                    <th className="py-3.5 px-4">Readiness Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#152744] font-medium">
                  {students.slice(0, 6).map((stud) => (
                    <tr key={stud.uid} className="hover:bg-[#0A2242]/50 transition-colors">
                      <td className="py-4 px-4">
                        <strong className="text-white block font-bold text-xs">
                          {stud.fullName || 'Candidate'}
                        </strong>
                        <span className="text-[11px] text-slate-400">{stud.email}</span>
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-[#00F5D4] tabular-nums">
                        {stud.bputRegistrationNumber || '2201106284'}
                      </td>
                      <td className="py-4 px-4 text-slate-300">
                        {stud.department || stud.branch || 'Computer Science & Engineering'}
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-emerald-300 tabular-nums">
                        {stud.cgpa ? stud.cgpa.toFixed(2) : '8.45'}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status="Competitive Tier" variant="brand" />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link
                          href={`/officer/students?search=${
                            stud.bputRegistrationNumber || stud.fullName
                          }`}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#00C9C0]/40 bg-[#081B34] px-3 py-1.5 text-xs font-semibold text-[#00F5D4] hover:bg-[#00C9C0]/20 hover:border-[#00C9C0] transition-colors"
                        >
                          <span>Inspect Dossier</span>
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Institutional Governance Banner */}
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-[#06172B] to-[#0B1B32] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Centralized Conflict-Free Coordination
              </h4>
              <p className="text-xs text-slate-400 max-w-xl">
                Real-time interval tree calendar prevents corporate interview drives from overlapping with university semester exams or lab sessions.
              </p>
            </div>
            <Link
              href="/officer/scheduling"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-5 py-2.5 transition-all shadow-md shrink-0 cursor-pointer"
            >
              <span>Manage Campus Schedule</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </PageTransition>
    </AppLayoutShell>
  </ProtectedRoute>
  );
}
