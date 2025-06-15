
export interface MoodEntry {
  id: string;
  user_id: string;
  mood: string;
  intensity: number;
  note: string | null;
  activities: string[] | null;
  date: string;
  created_at: string;
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
