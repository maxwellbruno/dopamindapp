
import React from 'react';
import TermsHeader from '@/components/terms/TermsHeader';
import TermsTitle from '@/components/terms/TermsTitle';
import TermsSection from '@/components/terms/TermsSection';
import PrivacySection from '@/components/terms/PrivacySection';
import ContactSection from '@/components/terms/ContactSection';
import ConsentSection from '@/components/terms/ConsentSection';

const TermsAndConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-light-gray dark:bg-deep-blue">
      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <TermsHeader />
          
          <div className="dopamind-card p-8 space-y-8">
            <TermsTitle />
            <TermsSection />
            <PrivacySection />
            <ContactSection />
            <ConsentSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
