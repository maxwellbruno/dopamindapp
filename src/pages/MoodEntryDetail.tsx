
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { MoodEntry, SubscriptionData, Mood } from '@/types/mood';
import { basicMoods, premiumMoods } from '@/data/moods';
import PremiumUpgradePrompt from '@/components/PremiumUpgradePrompt';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const MoodEntryDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [moodEntries] = useLocalStorage<MoodEntry[]>('dopamind_moods', []);
    const [subscription] = useLocalStorage<SubscriptionData>('dopamind_subscription', {
        isPro: false,
        isElite: false,
        subscriptionEnd: null,
        tier: 'free'
    });

    const isPremium = subscription.isPro || subscription.isElite;

    if (!isPremium) {
        return (
            <div className="min-h-screen bg-light-gray flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <PremiumUpgradePrompt
                        feature="Detailed Mood History"
                        description="Unlock detailed views of your mood entries to better understand your emotional patterns."
                        tier="pro"
                    />
                </div>
            </div>
        );
    }

    const entry = moodEntries.find(e => e.id === id);
    const allMoods = [...basicMoods, ...premiumMoods];
    const moodData = entry ? allMoods.find(m => m.label === entry.mood) : null;

    if (!entry || !moodData) {
        return (
            <div className="min-h-screen bg-light-gray flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-2xl font-bold text-deep-blue mb-4">Entry Not Found</h1>
                <p className="text-text-light mb-6">We couldn't find the mood entry you were looking for.</p>
                <Link to="/mood">
                    <Button>
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Mood Tracker
                    </Button>
                </Link>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-light-gray">
            <div className="px-4 pt-6 md:pt-8">
                <div className="max-w-md md:max-w-xl mx-auto">
                    <div className="mb-4">
                      <Link to="/mood" className="inline-flex items-center text-deep-blue hover:underline font-medium">
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Mood Tracker
                      </Link>
                    </div>
                    
                    <h1 className="text-2xl font-bold text-deep-blue text-center mb-6 animate-fade-in-up">Mood Entry Detail</h1>

                    <div className="dopamind-card p-6 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                                <span className="text-4xl">{moodData.emoji}</span>
                                <div>
                                    <h2 className="text-xl font-semibold text-deep-blue">{entry.mood}</h2>
                                    <p className="text-sm text-text-light">Intensity: {entry.intensity}/5</p>
                                </div>
                            </div>
                            <span className="text-sm text-text-light">
                                {new Date(entry.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                        </div>
                        
                        {entry.note && (
                            <div className="mb-4">
                                <h3 className="font-semibold text-deep-blue mb-2">Note:</h3>
                                <p className="text-deep-blue bg-light-gray p-3 rounded-lg whitespace-pre-wrap">{entry.note}</p>
                            </div>
                        )}

                        {entry.activities.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-deep-blue mb-2">Activities:</h3>
                                <div className="flex flex-wrap gap-2">
                                    {entry.activities.map((activity, idx) => (
                                        <span key={idx} className="text-sm bg-light-gray text-deep-blue px-3 py-1 rounded-full border">
                                            {activity}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                         {entry.activities.length === 0 && !entry.note && (
                            <p className="text-center text-text-light py-4">No additional details were recorded for this entry.</p>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MoodEntryDetail;
