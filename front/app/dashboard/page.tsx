// Pure, functional dashboard page using the Dashboard component
"use client";

import { useState } from "react";
import { Navigation } from '@/components/navigation';

export default function DashboardPage() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'profile' | 'admin'>('dashboard');

  // Pure function to render the current page content
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <p>Welcome to the dashboard!</p>
          </div>
        );
      case 'profile':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold">Profile</h2>
            <p>This is your profile page.</p>
          </div>
        );
      case 'admin':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
            <p>Admin controls and data go here.</p>
          </div>
        );
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
