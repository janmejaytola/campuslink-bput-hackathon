'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { SettingsView } from '@/components/settings/SettingsView';

export default function RecruiterSettingsPage() {
  return (
    <ProtectedRoute allowedRole="RECRUITER">
      <AppLayoutShell role="recruiter">
        <SettingsView role="recruiter" />
      </AppLayoutShell>
    </ProtectedRoute>
  );
}
