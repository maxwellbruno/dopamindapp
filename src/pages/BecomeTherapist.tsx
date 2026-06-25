import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, CheckCircle2, Upload, ShieldCheck, Camera } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { therapistSpecialties } from '@/data/therapists';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import RequireTier from '@/components/RequireTier';

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
  kycAcknowledged: boolean;
}

interface UploadState {
  profilePicture: File | null;
  licenseDocument: File | null;
  governmentId: File | null;
  additionalDocument: File | null;
  kycSelfie: File | null;
}

const initialState: FormState = {
  fullName: '', email: '', phone: '', title: '', credentials: '',
  licenseNumber: '', licenseState: '', yearsOfExperience: '',
  location: '', languages: '', priceRange: '', bio: '',
  specialties: [], sessionTypes: [], linkedinUrl: '',
  agreeTerms: false, kycAcknowledged: false,
};

const initialUploads: UploadState = {
  profilePicture: null, licenseDocument: null,
  governmentId: null, additionalDocument: null, kycSelfie: null,
};

const MAX_BYTES = 10 * 1024 * 1024; // 10MB

const BecomeTherapistInner: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(initialState);
  const [uploads, setUploads] = useState<UploadState>(initialUploads);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const setFile = (key: keyof UploadState, file: File | null) => {
    if (file && file.size > MAX_BYTES) {
      toast.error('Files must be 10MB or smaller.');
      return;
    }
    setUploads((p) => ({ ...p, [key]: file }));
  };

  const toggleArray = (key: 'specialties' | 'sessionTypes', value: string) => {
    setForm((p) => ({
      ...p,
      [key]: p[key].includes(value) ? p[key].filter((v) => v !== value) : [...p[key], value],
    }));
  };

  const uploadFile = async (file: File, label: string): Promise<string> => {
    const ext = file.name.split('.').pop() || 'bin';
    const path = `${user!.id}/${label}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from('therapist-documents')
      .upload(path, file, { upsert: false, contentType: file.type });
    if (error) throw new Error(`Failed to upload ${label}: ${error.message}`);
    return path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in to apply.'); return; }
    if (!form.agreeTerms) { toast.error('Please confirm the verification statement.'); return; }
    if (!form.kycAcknowledged) { toast.error('Please acknowledge the KYC requirement.'); return; }
    if (form.specialties.length === 0) { toast.error('Select at least one specialty.'); return; }
    if (form.sessionTypes.length === 0) { toast.error('Select at least one session type.'); return; }
    if (form.bio.trim().length < 50) { toast.error('Bio must be at least 50 characters.'); return; }
    if (!uploads.profilePicture) { toast.error('Upload a professional profile picture.'); return; }
    if (!uploads.licenseDocument) { toast.error('Upload your professional license document.'); return; }
    if (!uploads.governmentId) { toast.error('Upload a government-issued ID.'); return; }
    if (!uploads.kycSelfie) { toast.error('Upload a KYC selfie holding your ID.'); return; }

    setSubmitting(true);
    try {
      const [profilePath, licensePath, idPath, kycPath, addlPath] = await Promise.all([
        uploadFile(uploads.profilePicture, 'profile'),
        uploadFile(uploads.licenseDocument, 'license'),
        uploadFile(uploads.governmentId, 'gov-id'),
        uploadFile(uploads.kycSelfie, 'kyc-selfie'),
        uploads.additionalDocument ? uploadFile(uploads.additionalDocument, 'additional') : Promise.resolve(null),
      ]);

      const { error } = await supabase.from('therapist_applications').insert({
        user_id: user.id,
        full_name: form.fullName,
        email: form.email,
        phone: form.phone || null,
        title: form.title,
        credentials: form.credentials,
        license_number: form.licenseNumber,
        license_state: form.licenseState,
        years_of_experience: parseInt(form.yearsOfExperience || '0', 10),
        location: form.location,
        languages: form.languages,
        price_range: form.priceRange,
        bio: form.bio,
        specialties: form.specialties,
        session_types: form.sessionTypes,
        linkedin_url: form.linkedinUrl || null,
        profile_picture_path: profilePath,
        license_document_path: licensePath,
        government_id_path: idPath,
        additional_document_path: addlPath,
        kyc_selfie_path: kycPath,
        kyc_status: 'pending',
        status: 'kyc_pending',
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success('Application submitted! KYC review will begin shortly.');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
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
                Thanks, {form.fullName.split(' ')[0] || 'there'}. Our clinical team will run KYC and
                verify your credentials. You will hear back by email within 3–5 business days.
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
            {/* Personal */}
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

            {/* Professional */}
            <section className="dopamind-card p-5 space-y-4">
              <h2 className="text-sm font-bold text-text-dark uppercase tracking-wide">Professional details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Professional title" required>
                  <Input placeholder="e.g. Clinical Psychologist" value={form.title} onChange={(e) => update('title', e.target.value)} required maxLength={100} />
                </Field>
                <Field label="Years of experience" required>
                  <Input type="number" min={0} max={70} value={form.yearsOfExperience} onChange={(e) => update('yearsOfExperience', e.target.value)} required />
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
                <Input type="url" placeholder="https://..." value={form.linkedinUrl} onChange={(e) => update('linkedinUrl', e.target.value)} maxLength={255} />
              </Field>
            </section>

            {/* Profile picture */}
            <section className="dopamind-card p-5 space-y-4">
              <h2 className="text-sm font-bold text-text-dark uppercase tracking-wide">Professional profile picture</h2>
              <p className="text-xs text-text-light">
                Upload a clear, professional headshot (JPG or PNG, max 10MB). This will appear on your public profile.
              </p>
              <FileUpload
                id="profilePicture"
                accept="image/png,image/jpeg"
                file={uploads.profilePicture}
                onChange={(f) => setFile('profilePicture', f)}
                icon={<Camera className="w-4 h-4" />}
                label="Upload headshot"
                required
              />
            </section>

            {/* Legal documents */}
            <section className="dopamind-card p-5 space-y-4">
              <h2 className="text-sm font-bold text-text-dark uppercase tracking-wide">Legal documents</h2>
              <p className="text-xs text-text-light">
                Documents are stored privately and reviewed only by our verification team. Accepted: PDF, JPG, PNG (max 10MB each).
              </p>
              <FileUpload
                id="licenseDocument"
                accept="application/pdf,image/png,image/jpeg"
                file={uploads.licenseDocument}
                onChange={(f) => setFile('licenseDocument', f)}
                icon={<Upload className="w-4 h-4" />}
                label="Professional license document"
                required
              />
              <FileUpload
                id="governmentId"
                accept="application/pdf,image/png,image/jpeg"
                file={uploads.governmentId}
                onChange={(f) => setFile('governmentId', f)}
                icon={<Upload className="w-4 h-4" />}
                label="Government-issued ID (passport / driver's license)"
                required
              />
              <FileUpload
                id="additionalDocument"
                accept="application/pdf,image/png,image/jpeg"
                file={uploads.additionalDocument}
                onChange={(f) => setFile('additionalDocument', f)}
                icon={<Upload className="w-4 h-4" />}
                label="Additional certification (optional)"
              />
            </section>

            {/* KYC */}
            <section className="dopamind-card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-deep-blue" />
                <h2 className="text-sm font-bold text-text-dark uppercase tracking-wide">Identity verification (KYC)</h2>
              </div>
              <p className="text-xs text-text-light">
                To protect our community, every therapist must pass KYC before being listed.
                Upload a clear selfie of yourself holding your government-issued ID next to your face.
              </p>
              <FileUpload
                id="kycSelfie"
                accept="image/png,image/jpeg"
                file={uploads.kycSelfie}
                onChange={(f) => setFile('kycSelfie', f)}
                icon={<Camera className="w-4 h-4" />}
                label="KYC selfie with ID"
                required
              />
              <label className="flex items-start gap-3 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={form.kycAcknowledged}
                  onChange={(e) => update('kycAcknowledged', e.target.checked)}
                  className="mt-1 w-4 h-4 accent-mint-green"
                />
                <span className="text-xs text-text-light leading-relaxed">
                  I understand that my application will not be approved until I pass KYC, and I consent
                  to Dopamind verifying my identity and credentials using the documents I have provided.
                </span>
              </label>
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
                      <button type="button" key={s} onClick={() => toggleArray('specialties', s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${active ? 'bg-deep-blue text-white' : 'bg-white text-text-dark border border-gray-200 hover:border-mint-green'}`}>
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
                      <button type="button" key={s} onClick={() => toggleArray('sessionTypes', s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${active ? 'bg-mint-green text-white' : 'bg-white text-text-dark border border-gray-200 hover:border-mint-green'}`}>
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
                <Textarea value={form.bio} onChange={(e) => update('bio', e.target.value)} required maxLength={1000} rows={5} />
                <p className="text-xs text-text-light mt-1">{form.bio.length}/1000</p>
              </Field>
            </section>

            {/* Agreement */}
            <section className="dopamind-card p-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.agreeTerms} onChange={(e) => update('agreeTerms', e.target.checked)} className="mt-1 w-4 h-4 accent-mint-green" />
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
  label, required, hint, children,
}) => (
  <div>
    <label className="block text-sm font-medium text-text-dark mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-text-light mt-1">{hint}</p>}
  </div>
);

const FileUpload: React.FC<{
  id: string;
  label: string;
  accept: string;
  file: File | null;
  onChange: (f: File | null) => void;
  icon: React.ReactNode;
  required?: boolean;
}> = ({ id, label, accept, file, onChange, icon, required }) => (
  <div>
    <label
      htmlFor={id}
      className={`flex items-center justify-between gap-3 p-3 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
        file ? 'border-mint-green bg-mint-green/5' : 'border-gray-200 hover:border-mint-green bg-white'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-deep-blue/10 text-deep-blue flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-dark truncate">
            {label} {required && <span className="text-red-500">*</span>}
          </p>
          <p className="text-xs text-text-light truncate">
            {file ? file.name : 'Tap to choose a file'}
          </p>
        </div>
      </div>
      {file && (
        <CheckCircle2 className="w-5 h-5 text-mint-green flex-shrink-0" />
      )}
    </label>
    <input
      id={id}
      type="file"
      accept={accept}
      className="hidden"
      onChange={(e) => onChange(e.target.files?.[0] || null)}
    />
  </div>
);

const BecomeTherapist: React.FC = () => (
  <RequireTier
    tier="elite"
    feature="Become a Therapist"
    description="Listing yourself in our verified therapist directory is an Elite-tier feature. Upgrade to Elite to submit your application and get verified."
  >
    <BecomeTherapistInner />
  </RequireTier>
);

export default BecomeTherapist;
