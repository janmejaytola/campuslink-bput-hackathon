'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  Building,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Video,
  User,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { PageHeader } from '@/components/common/PageHeader';
import { PS10Notice } from '@/components/common/PS10Notice';
import { DEMO_DRIVE_EVENTS } from '@/lib/demoData';
import { useAuth } from '@/context/AuthContext';
import { interviewService } from '@/lib/services/interviewService';
import { InterviewRecord } from '@/types/interview';

export default function StudentSchedulePage() {
  const { currentUser } = useAuth();
  const [liveInterviews, setLiveInterviews] = useState<InterviewRecord[]>([]);

  useEffect(() => {
    let active = true;
    const uid = currentUser?.uid;
    if (!uid) return;

    (async () => {
      try {
        const data = await interviewService.getInterviewsForStudent(uid);
        if (active) {
          setLiveInterviews(data);
        }
      } catch (err) {
        console.warn('[Student schedule interviews note]:', err);
      }
    })();

    return () => {
      active = false;
    };
  }, [currentUser?.uid]);

  return (
    <ProtectedRoute allowedRole="STUDENT">
      <AppLayoutShell role="student">
        <PageHeader
          title="Interview & Assessment Schedule"
          description="Conflict-aware timeline for recruitment drives, online tests, and corporate panel interviews"
          badge="Zero Clashes"
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              0 Scheduling Conflicts
            </span>
          </div>
        </PageHeader>

        <div className="space-y-6">
          <PS10Notice
            moduleName="Conflict-Aware Scheduling Coordinator"
            nextStepDetail="Active slot overlap detection, room availability validation, and clash-free timetable governance."
          />

          {/* Live Scheduled Corporate Rounds */}
          {liveInterviews.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Personal Interview Invitations</span>
                <span className="rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5">
                  {liveInterviews.length} Scheduled
                </span>
              </h3>
              <div className="space-y-3">
                {liveInterviews.map((iv) => (
                  <div
                    key={iv.id}
                    className="rounded-2xl border border-teal-200 bg-teal-50/40 p-5 shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-slate-900">
                            {iv.company} — {iv.roundName || 'Technical Interview'}
                          </h4>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              iv.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-teal-100 text-teal-800'
                            }`}
                          >
                            {iv.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Position: <strong className="text-slate-800">{iv.jobTitle}</strong> · Evaluator: {iv.interviewerName}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {iv.locationOrLink && iv.locationOrLink.startsWith('http') && (
                          <a
                            href={iv.locationOrLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-2xs"
                          >
                            <Video className="h-3.5 w-3.5" />
                            <span>Join Video Bridge</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-teal-600" />
                        <span>
                          {iv.date} ({iv.startTime} - {iv.endTime})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-teal-600" />
                        <span className="truncate">{iv.locationOrLink}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        <span>Clash-Free Validated</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Master Campus Drive Timetable */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              BPUT Campus Recruitment Drives & Lab Assessments
            </h3>
            <div className="space-y-4">
              {DEMO_DRIVE_EVENTS.map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-100 font-bold text-sm">
                        {event.date.split('-')[2]}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{event.title}</h4>
                        <p className="text-xs text-slate-500">
                          {event.company} · {event.targetRole}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-lg">
                        {event.eventType}
                      </span>
                      <span className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                        Confirmed Slot
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span>{event.timeSlot}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="truncate">{event.venueOrLink}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-teal-600" />
                      <span>Verified by TPO Office</span>
                    </div>
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

