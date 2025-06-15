
import { Mood } from '@/types/mood';

export const basicMoods: Mood[] = [
  { emoji: '😡', label: 'Angry', color: 'bg-red-100' },
  { emoji: '😞', label: 'Sad', color: 'bg-blue-100' },
  { emoji: '😐', label: 'Neutral', color: 'bg-gray-100' },
  { emoji: '😊', label: 'Happy', color: 'bg-mint-green/20' },
  { emoji: '😄', label: 'Great', color: 'bg-green-100' },
];

export const premiumMoods: Mood[] = [
  { emoji: '😰', label: 'Anxious', color: 'bg-warm-orange/20' },
  { emoji: '😌', label: 'Calm', color: 'bg-blue-100' },
  { emoji: '🤩', label: 'Excited', color: 'bg-purple-100' },
  { emoji: '😴', label: 'Tired', color: 'bg-gray-100' },
  { emoji: '🥰', label: 'Loved', color: 'bg-pink-100' },
  { emoji: '😤', label: 'Frustrated', color: 'bg-deep-blue/10' },
  { emoji: '🤔', label: 'Thoughtful', color: 'bg-indigo-100' },
  { emoji: '😇', label: 'Peaceful', color: 'bg-green-100' },
  { emoji: '😵‍💫', label: 'Confused', color: 'bg-purple-100' },
  { emoji: '🤗', label: 'Grateful', color: 'bg-yellow-100' },
  { emoji: '😎', label: 'Confident', color: 'bg-blue-100' },
  { emoji: '🙃', label: 'Silly', color: 'bg-green-100' },
  { emoji: '😥', label: 'Stressed', color: 'bg-red-100' },
  { emoji: '🥳', label: 'Proud', color: 'bg-yellow-100' },
];

export const basicActivities = [
  'Exercise', 'Work', 'Reading'
];

export const premiumActivities = [
  'Social', 'Sleep', 'Meditation', 'Hobbies', 'Travel', 'Cooking', 'Music', 'Gaming', 'Art', 'Nature'
];
