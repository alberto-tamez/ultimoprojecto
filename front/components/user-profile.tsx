import React from 'react';
import { MeResponse } from '@/lib/api/types';

interface UserProfileProps {
  user: MeResponse;
  className?: string;
}

/**
 * A reusable user profile component that displays user information in a consistent format.
 * Uses a data-driven approach for rendering user details.
 */
export const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  className = 'mt-4 text-left text-sm text-gray-700' 
}) => {
  // Define the fields to display in order
  const userFields = [
    { key: 'ID', value: user.id },
    { key: 'WorkOS User ID', value: user.workos_user_id },
    { key: 'Email', value: user.email },
    { key: 'Name', value: user.full_name },
    { 
      key: 'Admin', 
      value: user.is_admin ? 'Yes' : 'No',
      className: user.is_admin ? 'text-green-600 font-medium' : ''
    },
  ];

  return (
    <div className={className}>
      {userFields.map(({ key, value, className = '' }) => (
        <p key={key} className={className}>
          <strong>{key}:</strong> {value}
        </p>
      ))}
    </div>
  );
};

// Usage:
// <UserProfile user={user} />
