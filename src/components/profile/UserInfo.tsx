
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getTierColor, getTierLabel } from '../../lib/subscriptionUtils';

interface UserInfoProps {
  subscriptionTier: 'free' | 'pro' | 'elite';
}

const UserInfo: React.FC<UserInfoProps> = ({ subscriptionTier }) => {
  const { user } = useAuth();

  return (
    <div className="dopamind-card p-6 mb-6 animate-fade-in-up">
      <div className="text-center mb-4">
        <div className="w-20 h-20 bg-gradient-to-br from-mint-green to-mint-green rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
          <span className="text-2xl text-white font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
        <h2 className="text-xl font-semibold text-text-dark">{user?.name}</h2>
        <p className="text-text-light">{user?.email}</p>
        
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${getTierColor(subscriptionTier)} mt-3`}>
          {subscriptionTier !== 'free' && <span className="mr-1">👑</span>}
          {getTierLabel(subscriptionTier)}
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
