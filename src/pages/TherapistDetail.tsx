
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Calendar, Languages, BadgeCheck, Video, Phone, MessageSquare, Building2 } from 'lucide-react';
import { therapists } from '@/data/therapists';
import { toast } from 'sonner';

const sessionTypeIcons: Record<string, React.ReactNode> = {
  Video: <Video className="w-4 h-4" />,
  'In-Person': <Building2 className="w-4 h-4" />,
  Phone: <Phone className="w-4 h-4" />,
  Chat: <MessageSquare className="w-4 h-4" />,
};

const TherapistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const therapist = therapists.find((t) => t.id === id);

  if (!therapist) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center p-4">
        <div className="dopamind-card p-8 text-center max-w-sm w-full">
          <p className="text-text-dark font-medium mb-2">Therapist not found</p>
          <button
            onClick={() => navigate('/therapists')}
            className="bg-mint-green text-white font-semibold rounded-2xl px-6 py-2"
          >
            Browse therapists
          </button>
        </div>
      </div>
    );
  }

  const handleRequestSession = () => {
    toast.success('Session request sent', {
      description: `We have notified ${therapist.name}'s office. They will contact you shortly to schedule.`,
    });
  };

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="px-4 pt-6 pb-28 md:pt-0">
        <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto">
          <div className="flex items-center mb-6 animate-fade-in-up">
            <button
              onClick={() => navigate('/therapists')}
              className="mr-3 p-2 rounded-2xl bg-white border-2 border-gray-100 hover:border-mint-green transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-text-dark" />
            </button>
            <h1 className="text-2xl font-bold text-text-dark">Therapist Profile</h1>
          </div>

          <div className="dopamind-card p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-light-gray to-white border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {therapist.imageUrl ? (
                  <img
                    src={therapist.imageUrl}
                    alt={therapist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">👤</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-text-dark">{therapist.name}</h2>
                  {therapist.verified && (
                    <BadgeCheck className="w-5 h-5 text-mint-green" aria-label="Verified therapist" />
                  )}
                </div>
                <p className="text-base font-semibold text-mint-green mb-1">{therapist.title}</p>
                <p className="text-sm text-text-light mb-2">{therapist.credentials}</p>
                <div className="flex flex-wrap items-center gap-3 text-sm text-text-light">
                  <span className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="font-semibold text-text-dark">{therapist.rating}</span>
                    <span className="ml-1">({therapist.reviewCount} reviews)</span>
                  </span>
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {therapist.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-light-gray rounded-2xl p-4">
                <div className="flex items-center text-text-light text-sm mb-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  Experience
                </div>
                <p className="text-lg font-bold text-text-dark">{therapist.yearsOfExperience} years</p>
              </div>
              <div className="bg-light-gray rounded-2xl p-4">
                <div className="flex items-center text-text-light text-sm mb-1">
                  <Languages className="w-4 h-4 mr-2" />
                  Languages
                </div>
                <p className="text-lg font-bold text-text-dark">{therapist.languages.join(', ')}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-base font-bold text-text-dark mb-2">About</h3>
              <p className="text-text-light leading-relaxed">{therapist.bio}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-base font-bold text-text-dark mb-2">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {therapist.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="text-sm font-medium text-deep-blue bg-deep-blue/10 rounded-full px-3 py-1"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-base font-bold text-text-dark mb-2">Session types</h3>
              <div className="flex flex-wrap gap-2">
                {therapist.sessionTypes.map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center text-sm font-medium text-text-dark bg-light-gray rounded-full px-3 py-1.5"
                  >
                    <span className="mr-1.5">{sessionTypeIcons[type]}</span>
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-light-gray rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-light">Next available</p>
                  <p className="text-lg font-bold text-text-dark">{therapist.nextAvailable}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text-light">Rate</p>
                  <p className="text-lg font-bold text-text-dark">{therapist.priceRange}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleRequestSession}
              className="w-full bg-mint-green text-white font-semibold rounded-2xl py-4 hover:scale-[1.01] transition-transform"
            >
              Request a session
            </button>
          </div>

          <div className="mt-6 p-4 bg-white rounded-2xl border border-gray-200 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-xs text-text-light leading-relaxed">
              <strong className="text-text-dark">Important:</strong> Dopamind is a wellness tool and does not provide therapy or medical treatment. This therapist is an independent professional. Always consult a qualified healthcare provider for medical or mental health concerns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistDetail;
