'use client';

import { useAuth } from '@workos-inc/authkit-nextjs/components';
import { Dashboard } from '@/components/dashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return <Dashboard />;
}