
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
        <h3 className="text-lg font-semibold text-deep-blue">4. Important Medical Disclaimer</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-text-dark leading-relaxed font-semibold mb-3">
            DOPAMIND IS NOT MEDICATION, MEDICAL TREATMENT, OR THERAPY
          </p>
          <div className="space-y-3 text-text-dark leading-relaxed">
            <p>
              Dopamind is designed solely as a digital wellness tool to help users with digital detoxing and mindfulness practice. 
              The App is NOT intended to diagnose, treat, cure, prevent, or replace any medical condition, mental health disorder, 
              or professional medical treatment.
            </p>
            <p>
              <strong>Dopamind is NOT:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>A replacement for professional therapy or counseling</li>
              <li>A substitute for hospital treatment or medical care</li>
              <li>Medication or medical treatment of any kind</li>
              <li>A cure for depression, anxiety, or any mental health condition</li>
              <li>Professional medical advice or consultation</li>
            </ul>
            <p>
              <strong>If you have health issues, mental health conditions, or any medical concerns, you MUST seek professional help 
              from qualified healthcare providers, therapists, or medical professionals.</strong> Always consult with your doctor 
              or mental health professional before making significant changes to your wellness routine or if you are experiencing 
              any health-related symptoms.
            </p>
            <p>
              Dopamind is simply a tool designed to support digital wellness and mindfulness practices. It should be used as a 
              complement to, not a replacement for, professional medical care when needed.
            </p>
          </div>
        </div>
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
