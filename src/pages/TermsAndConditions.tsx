
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Brain } from 'lucide-react';

const TermsAndConditions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-light-gray dark:bg-deep-blue">
      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-mint-green/20 rounded-2xl flex items-center justify-center">
                <Brain className="text-mint-green" size={24} />
              </div>
              <h1 className="text-2xl font-bold text-deep-blue dark:text-pure-white">Dopamind</h1>
            </div>
          </div>

          {/* Terms Content */}
          <div className="dopamind-card p-8 space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-deep-blue mb-2">Terms of Service & Privacy Policy</h1>
              <p className="text-text-light">Last updated: December 15, 2024</p>
            </div>

            {/* Terms of Service */}
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

            {/* Privacy Policy */}
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

            {/* Contact and Updates */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-deep-blue border-b border-gray-200 pb-2">Contact & Updates</h2>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-deep-blue">Changes to These Terms</h3>
                <p className="text-text-dark leading-relaxed">
                  We may update these Terms and Privacy Policy from time to time. We will notify you of any significant changes 
                  through the App or via email. Your continued use of the App after such changes constitutes acceptance of the updated Terms.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-deep-blue">Contact Us</h3>
                <p className="text-text-dark leading-relaxed">
                  If you have any questions about these Terms or our Privacy Policy, please contact us at:
                </p>
                <div className="bg-light-gray p-4 rounded-lg">
                  <p className="text-text-dark"><strong>Email:</strong> support@dopamind.app</p>
                  <p className="text-text-dark"><strong>Privacy Officer:</strong> privacy@dopamind.app</p>
                </div>
              </div>
            </section>

            {/* Consent Agreement */}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
