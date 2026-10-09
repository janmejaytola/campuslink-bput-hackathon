'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { SettingsView } from '@/components/settings/SettingsView';

export default function StudentSettingsPage() {
  return (
    <ProtectedRoute allowedRole="STUDENT">
      <AppLayoutShell role="student">
        <SettingsView role="student" />
      </AppLayoutShell>
    </ProtectedRoute>
  );
}
