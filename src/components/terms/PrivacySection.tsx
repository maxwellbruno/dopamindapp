
import React from 'react';

const PrivacySection: React.FC = () => {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold text-deep-blue border-b border-gray-200 pb-2">Privacy Policy</h2>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-deep-blue">1. Information We Collect</h3>
        <p className="text-text-dark leading-relaxed">We collect the following types of information:</p>
        <ul className="list-disc list-inside text-text-dark leading-relaxed space-y-2 ml-4">
          <li><strong>Account Information:</strong> Email address, name, and profile preferences</li>
          <li><strong>Usage Data:</strong> Focus session durations, mood entries, meditation progress, and app interaction data</li>
          <li><strong>Device Information:</strong> Device type, operating system, and app version for technical support</li>
          <li><strong>Wellness Data:</strong> Mood tracking, meditation preferences, and wellness goals you choose to record</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-deep-blue">2. How We Use Your Information</h3>
        <ul className="list-disc list-inside text-text-dark leading-relaxed space-y-2 ml-4">
          <li>To provide and improve our wellness services</li>
          <li>To personalize your mindfulness and focus experiences</li>
          <li>To track your progress and provide insights</li>
          <li>To send you relevant wellness tips and app updates (with your consent)</li>
          <li>To provide customer support and technical assistance</li>
          <li>To ensure app security and prevent misuse</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-deep-blue">3. Data Sharing and Disclosure</h3>
        <p className="text-text-dark leading-relaxed">
          We do not sell your personal information. We may share your data only in the following circumstances:
        </p>
        <ul className="list-disc list-inside text-text-dark leading-relaxed space-y-2 ml-4">
          <li>With your explicit consent</li>
          <li>To comply with legal obligations</li>
          <li>With trusted service providers who help us operate the App (under strict confidentiality agreements)</li>
          <li>In case of a business merger or acquisition (with prior notice to users)</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-deep-blue">4. Data Security</h3>
        <p className="text-text-dark leading-relaxed">
          We implement industry-standard security measures to protect your personal information, including encryption, 
          secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-deep-blue">5. Your Privacy Rights</h3>
        <p className="text-text-dark leading-relaxed">You have the right to:</p>
        <ul className="list-disc list-inside text-text-dark leading-relaxed space-y-2 ml-4">
          <li>Access and review your personal data</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of your account and associated data</li>
          <li>Opt-out of marketing communications</li>
          <li>Export your wellness data</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-deep-blue">6. Data Retention</h3>
        <p className="text-text-dark leading-relaxed">
          We retain your personal information for as long as your account is active or as needed to provide services. 
          Wellness tracking data is kept to provide you with long-term progress insights. You may request data deletion at any time.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-deep-blue">7. Children's Privacy</h3>
        <p className="text-text-dark leading-relaxed">
          Our App is not directed to children under 13. We do not knowingly collect personal information from children under 13. 
          If we discover we have collected such information, we will delete it immediately.
        </p>
      </div>
    </section>
  );
};

export default PrivacySection;
