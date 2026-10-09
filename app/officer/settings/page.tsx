'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayoutShell } from '@/components/navigation/AppLayoutShell';
import { SettingsView } from '@/components/settings/SettingsView';

export default function OfficerSettingsPage() {
  return (
    <ProtectedRoute allowedRole="PLACEMENT_OFFICER">
      <AppLayoutShell role="officer">
        <SettingsView role="officer" />
      </AppLayoutShell>
    </ProtectedRoute>
  );
}
