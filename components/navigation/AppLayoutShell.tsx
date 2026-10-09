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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { currentUser } = useAuth();

  const strictAllowedRole: StrictRole = normalizeRole(role);
  const authenticatedStrictRole: StrictRole = currentUser?.role || strictAllowedRole;
  const activeRouteRole: RouteRole = roleToRouteRole(authenticatedStrictRole);

  return (
    <ProtectedRoute allowedRole={strictAllowedRole}>
      <div className="min-h-screen bg-[#040D1A] text-slate-100 flex overflow-x-hidden selection:bg-[#00C9C0]/25 selection:text-white relative">
        {/* Subtle ambient neon glow elements across background */}
        <div
          className="fixed inset-0 pointer-events-none opacity-20 z-0"
          style={{
            backgroundImage: `radial-gradient(rgba(0, 201, 192, 0.12) 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />
        <div className="fixed top-0 right-1/4 w-96 h-96 bg-[#00C9C0]/5 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="fixed bottom-10 left-1/3 w-[30rem] h-[30rem] bg-[#007F83]/5 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Role-Themed Collapsible Sidebar */}
        <AppSidebar
          isOpen={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          activeRole={activeRouteRole}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        {/* Content Viewport */}
        <div className="flex flex-1 flex-col min-w-0 transition-all duration-300 relative z-10">
          <AppHeader
            onMenuClick={() => setMobileDrawerOpen(true)}
            activeRole={activeRouteRole}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          />

          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
