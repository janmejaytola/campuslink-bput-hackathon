'use client';

import React, { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { useAuth } from '@/context/AuthContext';
import { StrictRole, normalizeRole, roleToRouteRole, RouteRole } from '@/types/auth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

interface AppLayoutShellProps {
  children: React.ReactNode;
  role: StrictRole | RouteRole | string;
}

export function AppLayoutShell({ children, role }: AppLayoutShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, currentRole } = useAuth();

  const strictAllowedRole: StrictRole = normalizeRole(role);
  const authenticatedStrictRole: StrictRole = currentUser?.role || strictAllowedRole;
  const activeRouteRole: RouteRole = roleToRouteRole(authenticatedStrictRole);

  return (
    <ProtectedRoute allowedRole={strictAllowedRole}>
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex">
        {/* Shared Role-Aware Sidebar */}
        <AppSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeRole={activeRouteRole}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col min-w-0">
          <AppHeader
            onMenuClick={() => setSidebarOpen(true)}
            activeRole={activeRouteRole}
          />

          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
