import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useIsAdmin } from '@/hooks/useIsAdmin';

/** Renders children only for admins; everyone else sees an "Admins only" notice. */
const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, isLoading } = useIsAdmin();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-gray dark:bg-background flex items-center justify-center text-sm text-text-light">
        Loading...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-light-gray dark:bg-background flex items-center justify-center p-4">
        <div className="dopamind-card p-8 text-center max-w-sm">
          <ShieldAlert className="w-8 h-8 text-cool-gray mx-auto mb-3" />
          <p className="text-text-dark font-medium mb-1">Admins only</p>
          <p className="text-text-light text-sm">You do not have access to this area.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;
