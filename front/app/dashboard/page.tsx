// Pure, functional dashboard page using the Dashboard component
"use client";

import { useState } from "react";
import { Navigation } from '@/components/navigation';
import { Dashboard } from '@/components/dashboard';
import { ProfilePage } from '@/components/profile-page';
import AdminDashboard from '@/components/admin-dashboard';

export default function DashboardPage() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'profile' | 'admin'>('dashboard');

  // Pure function to render the current page content
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return (
          <ProfilePage user={null} onUpdateUser={() => {}} />
        );
      case 'admin':
        return <AdminDashboard />;
      default:
        return null;
    }
  };

  return (
    <>
      <Navigation
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onLogout={() => {}}
        user={null}
      />
      {renderPage()}
    </>
  );
}
