
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, UserCheck, ShieldCheck } from 'lucide-react';

const TalkToTherapist: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="dopamind-card p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-deep-blue to-mint-green rounded-2xl flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-text-dark mb-1">Talk to a Real Therapist</h3>
          <p className="text-text-light text-sm mb-3">
            Connect with licensed, verified human therapists who can provide personalized professional support.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center text-xs font-medium text-text-dark bg-light-gray rounded-full px-2.5 py-1">
              <UserCheck className="w-3 h-3 mr-1 text-mint-green" />
              Licensed professionals
            </span>
            <span className="inline-flex items-center text-xs font-medium text-text-dark bg-light-gray rounded-full px-2.5 py-1">
              <ShieldCheck className="w-3 h-3 mr-1 text-mint-green" />
              Identity verified
            </span>
          </div>
          <button
            onClick={() => navigate('/therapists')}
            className="bg-deep-blue text-white font-semibold rounded-2xl px-5 py-2.5 hover:scale-[1.02] transition-transform"
          >
            Find a therapist
          </button>
        </div>
      </div>
    </div>
  );
};

export default TalkToTherapist;
