'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  Calendar,
  Briefcase,
  AlertCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Award,
  Filter,
  CheckCheck,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { PageHeader } from '@/components/common/PageHeader';
import { PS10Notice } from '@/components/common/PS10Notice';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/lib/services/notificationService';
import { PersistentNotification } from '@/types/notification';

export default function StudentNotificationsPage() {
  const { currentUser, notifications: contextNotifs, markNotificationRead, markAllNotificationsRead } = useAuth();
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'INTERVIEWS' | 'OFFERS'>('ALL');
  const [persistentNotifs, setPersistentNotifs] = useState<PersistentNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const uid = currentUser?.uid;
    if (!uid) return;

    (async () => {
      setIsLoading(true);
      try {
        const live = await notificationService.getNotificationsForUser(uid);
        if (active) {
          setPersistentNotifs(live);
        }
      } catch (err) {
        console.warn('[Notifications load note]:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [currentUser?.uid]);

  // Combine live notifications with context notifications if needed
  const combinedNotifs = [
    ...persistentNotifs.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      timestamp: new Date(n.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      read: n.read,
      type: n.type.includes('INTERVIEW') ? 'schedule' : n.type.includes('OFFER') ? 'offer' : 'system',
      link: n.link || (n.type.includes('INTERVIEW') ? '/student/schedule' : '/student/jobs'),
    })),
    ...contextNotifs.filter(
      (cn) => !persistentNotifs.some((pn) => pn.id === cn.id)
    ),
  ];

  const filteredNotifs = combinedNotifs.filter((n) => {
    if (filter === 'UNREAD') return !n.read;
    if (filter === 'INTERVIEWS') return n.type === 'schedule' || n.title.toLowerCase().includes('interview');
    if (filter === 'OFFERS') return n.type === 'offer' || n.title.toLowerCase().includes('offer') || n.title.toLowerCase().includes('shortlist');
    return true;
  });

  const handleMarkRead = async (id: string) => {
    markNotificationRead(id);
    try {
      await notificationService.markAsRead(id);
    } catch (e) {
      // Background sync
    }
    setPersistentNotifs((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    setPersistentNotifs((prev) => prev.map((item) => ({ ...item, read: true })));
    setNotificationBanner('All active notifications marked as read.');
    setTimeout(() => setNotificationBanner(null), 3500);
  };

  const unreadCount = combinedNotifs.filter((n) => !n.read).length;

  return (
    <ProtectedRoute allowedRole="STUDENT">
      <AppLayoutShell role="student">
        <PageHeader
          title="Notification Center & Dispatch Feed"
          description="Authoritative placement alerts, interview calls, recruiter shortlists, and university notices"
          badge="Dispatch Telemetry"
        >
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-2 text-xs font-bold text-teal-800 hover:bg-teal-100 transition-colors shadow-2xs cursor-pointer"
            >
              <CheckCheck className="h-4 w-4 text-teal-600" />
              <span>Mark All as Read ({unreadCount})</span>
            </button>
          )}
        </PageHeader>

        <div className="space-y-6 pb-16">
          <PS10Notice
            moduleName="Institutional Notification & Alert Dispatcher"
            nextStepDetail="Deterministic push events ensure zero missed corporate tests, interview slots, and offer deadlines."
          />

          {notificationBanner && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-900 flex items-center gap-2 shadow-2xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{notificationBanner}</span>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl">
              {(
                [
                  { key: 'ALL', label: `All (${combinedNotifs.length})` },
                  { key: 'UNREAD', label: `Unread (${unreadCount})` },
                  { key: 'INTERVIEWS', label: 'Interviews' },
                  { key: 'OFFERS', label: 'Drives & Offers' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    filter === tab.key
                      ? 'bg-white text-teal-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              BPUT Campus Placement Coordination
            </span>
          </div>

          {/* Notifications List */}
          {filteredNotifs.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Bell className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No notifications found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {filter === 'UNREAD'
                  ? 'All placement notifications and interview invites have been reviewed.'
                  : 'You do not have any alerts matching this category at this moment.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifs.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-5 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    !item.read
                      ? 'bg-teal-50/40 border-teal-200/90'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 mt-0.5 ${
                        item.type === 'schedule'
                          ? 'bg-teal-100 text-teal-700'
                          : item.type === 'offer'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.type === 'schedule' ? (
                        <Calendar className="h-5 w-5" />
                      ) : item.type === 'offer' ? (
                        <Award className="h-5 w-5" />
                      ) : (
                        <Bell className="h-5 w-5" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {item.title}
                        </h4>
                        {!item.read && (
                          <span className="h-2 w-2 rounded-full bg-teal-600 inline-block" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                        {item.message}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium block pt-0.5">
                        {item.timestamp}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {!item.read && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(item.id)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Mark Read
                      </button>
                    )}
                    {item.link && (
                      <Link
                        href={item.link}
                        onClick={() => handleMarkRead(item.id)}
                        className="inline-flex items-center gap-1 rounded-xl bg-teal-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-2xs"
                      >
                        <span>Open Details</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppLayoutShell>
    </ProtectedRoute>
  );
}
