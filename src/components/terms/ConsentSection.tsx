
import React from 'react';

const ConsentSection: React.FC = () => {
  return (
    <div className="border-t border-gray-200 pt-6">
      <div className="bg-mint-green/10 border border-mint-green/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-deep-blue mb-3">Your Consent</h3>
        <p className="text-text-dark leading-relaxed">
          By using the Dopamind app, you acknowledge that you have read, understood, and agree to be bound by these 
          Terms of Service and Privacy Policy. You consent to the collection, use, and sharing of your information 
          as described in this policy.
        </p>
      </div>
    </div>
  );
};

export default ConsentSection;
