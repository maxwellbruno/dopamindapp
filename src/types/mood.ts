
export interface MoodEntry {
  id: string;
  mood: string;
  intensity: number;
  note: string;
  activities: string[];
  date: string;
}

export interface SubscriptionData {
  isPro: boolean;
  isElite: boolean;
  subscriptionEnd: string | null;
  tier: 'free' | 'pro' | 'elite';
}

export interface Mood {
  emoji: string;
  label: string;
  color: string;
}
