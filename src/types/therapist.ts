export interface Therapist {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  credentials: string;
  yearsOfExperience: number;
  languages: string[];
  location: string;
  sessionTypes: ('Video' | 'In-Person' | 'Phone' | 'Chat')[];
  priceRange: string;
  rating: number;
  reviewCount: number;
  bio: string;
  imageUrl?: string;
  nextAvailable: string;
  verified: boolean;
}
