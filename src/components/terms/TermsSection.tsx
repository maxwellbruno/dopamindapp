
import React from 'react';

const TermsSection: React.FC = () => {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold text-deep-blue border-b border-gray-200 pb-2">Terms of Service</h2>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-deep-blue">1. Acceptance of Terms</h3>
        <p className="text-text-dark leading-relaxed">
          By downloading, accessing, or using the Dopamind application ("App"), you agree to be bound by these Terms of Service ("Terms"). 
          If you do not agree to these Terms, please do not use our App.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-deep-blue">2. Description of Service</h3>
        <p className="text-text-dark leading-relaxed">
          Dopamind is a digital wellness application designed to help users develop healthier relationships with technology through 
          mindfulness practices, focus sessions, mood tracking, and digital detox tools. Our services include guided meditations, 
          ambient soundscapes, breathing exercises, and wellness tracking features.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-deep-blue">3. User Responsibilities</h3>
        <ul className="list-disc list-inside text-text-dark leading-relaxed space-y-2 ml-4">
          <li>You must be at least 13 years old to use this App</li>
          <li>You are responsible for maintaining the confidentiality of your account credentials</li>
          <li>You agree to use the App for lawful purposes only</li>
          <li>You will not attempt to reverse engineer, hack, or compromise the App's security</li>
          <li>You acknowledge that the App is for wellness purposes and not a substitute for professional medical advice</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-deep-blue">4. Health and Medical Disclaimer</h3>
        <p className="text-text-dark leading-relaxed">
          Dopamind is designed for general wellness and mindfulness purposes. The content and features provided are not intended to 
          diagnose, treat, cure, or prevent any medical condition. Always consult with qualified healthcare professionals regarding 
          any mental health concerns or before making significant changes to your wellness routine.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-deep-blue">5. Subscription and Payments</h3>
        <p className="text-text-dark leading-relaxed">
          Some features require a premium subscription. Subscriptions automatically renew unless cancelled. You may cancel your 
          subscription at any time through your account settings. Refunds are handled according to the app store's refund policy.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-deep-blue">6. Intellectual Property</h3>
        <p className="text-text-dark leading-relaxed">
          All content, features, and functionality of the App are owned by Dopamind and are protected by copyright, trademark, 
          and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express permission.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-deep-blue">7. Limitation of Liability</h3>
        <p className="text-text-dark leading-relaxed">
          Dopamind shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use 
          of the App. Our total liability shall not exceed the amount you paid for the App in the past 12 months.
        </p>
      </div>
    </section>
  );
};

export default TermsSection;
