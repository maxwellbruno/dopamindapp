import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { therapistSpecialties } from '@/data/therapists';

const sessionTypeOptions = ['Video', 'In-Person', 'Phone', 'Chat'] as const;

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  title: string;
  credentials: string;
  licenseNumber: string;
  licenseState: string;
  yearsOfExperience: string;
  location: string;
  languages: string;
  priceRange: string;
  bio: string;
  specialties: string[];
  sessionTypes: string[];
  linkedinUrl: string;
  agreeTerms: boolean;
}

const initialState: FormState = {
  fullName: '',
  email: '',
  phone: '',
  title: '',
  credentials: '',
  licenseNumber: '',
  licenseState: '',
  yearsOfExperience: '',
  location: '',
  languages: '',
  priceRange: '',
  bio: '',
  specialties: [],
  sessionTypes: [],
  linkedinUrl: '',
  agreeTerms: false,
};

const BecomeTherapist: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialState);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleArray = (key: 'specialties' | 'sessionTypes', value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.agreeTerms) {
      toast.error('Please confirm the verification statement to continue.');
      return;
    }
    if (form.specialties.length === 0) {
      toast.error('Select at least one specialty.');
      return;
    }
    if (form.sessionTypes.length === 0) {
      toast.error('Select at least one session type you offer.');
      return;
    }
    if (form.bio.trim().length < 50) {
      toast.error('Please write a bio of at least 50 characters.');
      return;
    }

    setSubmitting(true);
    // Frontend-only submission. Replace with backend call when available.
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSubmitted(true);
    toast.success('Application submitted! We will review it shortly.');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-light-gray">
        <div className="px-4 pt-6 pb-28 md:pt-0">
          <div className="max-w-md mx-auto">
            <div className="dopamind-card p-8 text-center mt-10 animate-fade-in-up">
              <div className="w-16 h-16 mx-auto rounded-full bg-mint-green/15 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-9 h-9 text-mint-green" />
              </div>
              <h2 className="text-xl font-bold text-text-dark mb-2">Application received</h2>
              <p className="text-sm text-text-light mb-6">
                Thanks, {form.fullName.split(' ')[0] || 'there'}. Our clinical team will verify your
                credentials and respond by email within 3–5 business days.
              </p>
              <button
                onClick={() => navigate('/therapists')}
                className="w-full bg-mint-green text-white font-semibold rounded-2xl py-3 hover:scale-[1.01] transition-transform"
              >
                Back to therapists
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="px-4 pt-6 pb-28 md:pt-0">
        <div className="max-w-md md:max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-6 animate-fade-in-up">
            <button
              onClick={() => navigate('/therapists')}
              className="mr-3 p-2 rounded-2xl bg-white border-2 border-gray-100 hover:border-mint-green transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-text-dark" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-text-dark flex items-center">
                Become a Therapist <BadgeCheck className="w-5 h-5 text-mint-green ml-2" />
              </h1>
              <p className="text-text-light text-sm">Apply to join our verified directory</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {/* Personal info */}
            <section className="dopamind-card p-5 space-y-4">
              <h2 className="text-sm font-bold text-text-dark uppercase tracking-wide">Personal information</h2>
              <Field label="Full name" required>
                <Input value={form.fullName} onChange={(e) => update('fullName', e.target.value)} required maxLength={100} />
              </Field>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Email" required>
                  <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required maxLength={255} />
                </Field>
                <Field label="Phone">
                  <Input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} maxLength={30} />
                </Field>
              </div>
              <Field label="Location (City, State/Country)" required>
                <Input value={form.location} onChange={(e) => update('location', e.target.value)} required maxLength={120} />
              </Field>
            </section>

            {/* Professional info */}
            <section className="dopamind-card p-5 space-y-4">
              <h2 className="text-sm font-bold text-text-dark uppercase tracking-wide">Professional details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Professional title" required>
                  <Input
                    placeholder="e.g. Clinical Psychologist"
                    value={form.title}
                    onChange={(e) => update('title', e.target.value)}
                    required
                    maxLength={100}
                  />
                </Field>
                <Field label="Years of experience" required>
                  <Input
                    type="number"
                    min={0}
                    max={70}
                    value={form.yearsOfExperience}
                    onChange={(e) => update('yearsOfExperience', e.target.value)}
                    required
                  />
                </Field>
              </div>
              <Field label="Credentials" required hint="e.g. Ph.D., LCSW, LMFT, EMDR Certified">
                <Input value={form.credentials} onChange={(e) => update('credentials', e.target.value)} required maxLength={150} />
              </Field>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="License number" required>
                  <Input value={form.licenseNumber} onChange={(e) => update('licenseNumber', e.target.value)} required maxLength={60} />
                </Field>
                <Field label="License state / region" required>
                  <Input value={form.licenseState} onChange={(e) => update('licenseState', e.target.value)} required maxLength={60} />
                </Field>
              </div>
              <Field label="Languages spoken" required hint="Comma separated, e.g. English, Spanish">
                <Input value={form.languages} onChange={(e) => update('languages', e.target.value)} required maxLength={120} />
              </Field>
              <Field label="LinkedIn or professional website">
                <Input
                  type="url"
                  placeholder="https://..."
                  value={form.linkedinUrl}
                  onChange={(e) => update('linkedinUrl', e.target.value)}
                  maxLength={255}
                />
              </Field>
            </section>

            {/* Practice */}
            <section className="dopamind-card p-5 space-y-4">
              <h2 className="text-sm font-bold text-text-dark uppercase tracking-wide">Practice</h2>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Specialties <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {therapistSpecialties.map((s) => {
                    const active = form.specialties.includes(s);
                    return (
                      <button
                        type="button"
                        key={s}
                        onClick={() => toggleArray('specialties', s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                          active
                            ? 'bg-deep-blue text-white'
                            : 'bg-white text-text-dark border border-gray-200 hover:border-mint-green'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Session types offered <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {sessionTypeOptions.map((s) => {
                    const active = form.sessionTypes.includes(s);
                    return (
                      <button
                        type="button"
                        key={s}
                        onClick={() => toggleArray('sessionTypes', s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                          active
                            ? 'bg-mint-green text-white'
                            : 'bg-white text-text-dark border border-gray-200 hover:border-mint-green'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Field label="Price range per session" required hint="e.g. $120 - $180">
                <Input value={form.priceRange} onChange={(e) => update('priceRange', e.target.value)} required maxLength={60} />
              </Field>

              <Field label="Professional bio" required hint="Minimum 50 characters. Shown on your public profile.">
                <Textarea
                  value={form.bio}
                  onChange={(e) => update('bio', e.target.value)}
                  required
                  maxLength={1000}
                  rows={5}
                />
                <p className="text-xs text-text-light mt-1">{form.bio.length}/1000</p>
              </Field>
            </section>

            {/* Agreement */}
            <section className="dopamind-card p-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.agreeTerms}
                  onChange={(e) => update('agreeTerms', e.target.checked)}
                  className="mt-1 w-4 h-4 accent-mint-green"
                />
                <span className="text-xs text-text-light leading-relaxed">
                  I confirm that the information provided is accurate, that I hold a valid license to
                  practice in the jurisdiction listed, and I consent to Dopamind verifying my
                  credentials before listing my profile.
                </span>
              </label>
            </section>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-mint-green text-white font-semibold rounded-2xl py-4 hover:scale-[1.01] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; required?: boolean; hint?: string; children: React.ReactNode }> = ({
  label,
  required,
  hint,
  children,
}) => (
  <div>
    <label className="block text-sm font-medium text-text-dark mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-text-light mt-1">{hint}</p>}
  </div>
);

export default BecomeTherapist;
