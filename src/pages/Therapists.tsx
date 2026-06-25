
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Calendar, MapPin, Languages, BadgeCheck, Search, Video, Phone, MessageSquare, Building2 } from 'lucide-react';
import { therapists, therapistSpecialties } from '@/data/therapists';
import { Input } from '@/components/ui/input';
import RequireTier from '@/components/RequireTier';

const sessionTypeIcons: Record<string, React.ReactNode> = {
  Video: <Video className="w-3 h-3" />,
  'In-Person': <Building2 className="w-3 h-3" />,
  Phone: <Phone className="w-3 h-3" />,
  Chat: <MessageSquare className="w-3 h-3" />,
};

const Therapists: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');

  const filteredTherapists = useMemo(() => {
    return therapists.filter((therapist) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        therapist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        therapist.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSpecialty = selectedSpecialty === 'All' || therapist.specialties.includes(selectedSpecialty);

      return matchesSearch && matchesSpecialty;
    });
  }, [searchQuery, selectedSpecialty]);

  return (
    <RequireTier
      tier="pro"
      feature="Find a Real Therapist"
      description="Browsing our directory of licensed, verified therapists is a Pro feature. Upgrade to connect with real human professionals."
    >
    <div className="min-h-screen bg-light-gray">
      <div className="px-4 pt-6 pb-28 md:pt-0">
        <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-6 animate-fade-in-up">
            <button
              onClick={() => navigate('/home')}
              className="mr-3 p-2 rounded-2xl bg-white border-2 border-gray-100 hover:border-mint-green transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-text-dark" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-text-dark">Talk to a Real Therapist</h1>
              <p className="text-text-light text-sm">Browse licensed, verified professionals</p>
            </div>
            <button
              onClick={() => navigate('/therapists/apply')}
              className="ml-2 px-3 py-2 rounded-2xl bg-mint-green text-white text-xs font-semibold hover:scale-[1.02] transition-transform whitespace-nowrap"
            >
              Become a therapist
            </button>
          </div>

          {/* Search & filters */}
          <div className="mb-6 space-y-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cool-gray" />
              <Input
                type="text"
                placeholder="Search by name, title, or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 rounded-2xl border-2 border-gray-100 bg-white text-text-dark placeholder:text-cool-gray focus:border-deep-blue"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSpecialty('All')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  selectedSpecialty === 'All'
                    ? 'bg-deep-blue text-white'
                    : 'bg-white text-text-dark border border-gray-200 hover:border-mint-green'
                }`}
              >
                All
              </button>
              {therapistSpecialties.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => setSelectedSpecialty(specialty)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    selectedSpecialty === specialty
                      ? 'bg-deep-blue text-white'
                      : 'bg-white text-text-dark border border-gray-200 hover:border-mint-green'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {filteredTherapists.length === 0 && (
              <div className="dopamind-card p-8 text-center">
                <p className="text-text-dark font-medium mb-1">No therapists found</p>
                <p className="text-text-light text-sm">Try a different search term or specialty filter.</p>
              </div>
            )}

            {filteredTherapists.map((therapist) => (
              <div
                key={therapist.id}
                className="dopamind-card p-5 transition-all hover:shadow-lg"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-light-gray to-white border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {therapist.imageUrl ? (
                      <img
                        src={therapist.imageUrl}
                        alt={therapist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">👤</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="text-base font-bold text-text-dark truncate">{therapist.name}</h3>
                      {therapist.verified && (
                        <BadgeCheck className="w-5 h-5 text-mint-green flex-shrink-0 ml-2" aria-label="Verified therapist" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-mint-green mb-1">{therapist.title}</p>
                    <p className="text-xs text-text-light mb-2">{therapist.credentials}</p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-text-light mb-3">
                      <span className="flex items-center">
                        <Star className="w-3.5 h-3.5 text-yellow-500 mr-1" />
                        <span className="font-semibold text-text-dark">{therapist.rating}</span>
                        <span className="ml-1">({therapist.reviewCount} reviews)</span>
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1" />
                        {therapist.location}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        {therapist.yearsOfExperience} yrs exp
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {therapist.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="text-xs font-medium text-deep-blue bg-deep-blue/10 rounded-full px-2.5 py-1"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>

                    <p className="text-sm text-text-light mb-4 line-clamp-2">{therapist.bio}</p>

                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {therapist.sessionTypes.map((type) => (
                        <span
                          key={type}
                          className="inline-flex items-center text-xs font-medium text-text-dark bg-light-gray rounded-full px-2.5 py-1"
                        >
                          <span className="mr-1">{sessionTypeIcons[type]}</span>
                          {type}
                        </span>
                      ))}
                      <span className="inline-flex items-center text-xs font-medium text-text-dark bg-light-gray rounded-full px-2.5 py-1">
                        <Languages className="w-3 h-3 mr-1" />
                        {therapist.languages.join(', ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-text-light">Next available</p>
                        <p className="text-sm font-semibold text-text-dark">{therapist.nextAvailable}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-text-light">Rate</p>
                        <p className="text-sm font-semibold text-text-dark">{therapist.priceRange}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/therapists/${therapist.id}`)}
                      className="w-full mt-4 bg-mint-green text-white font-semibold rounded-2xl py-3 hover:scale-[1.01] transition-transform"
                    >
                      View profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="mt-8 p-4 bg-white rounded-2xl border border-gray-200 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <p className="text-xs text-text-light leading-relaxed">
              <strong className="text-text-dark">Important:</strong> Dopamind is a wellness tool and does not provide therapy or medical treatment. Therapists listed here are independent professionals. Always consult a qualified healthcare provider for medical or mental health concerns.
            </p>
          </div>
        </div>
      </div>
    </div>
    </RequireTier>
  );
};

export default Therapists;
