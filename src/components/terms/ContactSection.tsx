
import React from 'react';

const ContactSection: React.FC = () => {
  return (
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
          <p className="text-text-dark"><strong>Email:</strong> dopamindpwa@gmail.com</p>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
