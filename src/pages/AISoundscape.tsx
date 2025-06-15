
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface SubscriptionData {
  isPro: boolean;
  isElite: boolean;
  subscriptionEnd: string | null;
  tier: 'free' | 'pro' | 'elite';
}

const AISoundscape: React.FC = () => {
  const navigate = useNavigate();
  const [subscription] = useLocalStorage<SubscriptionData>('dopamind_subscription', {
    isPro: false,
    isElite: false,
    subscriptionEnd: null,
    tier: 'free'
  });

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);

  if (!subscription.isElite) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="dopamind-card p-6 md:p-8 text-center max-w-sm md:max-w-md w-full">
          <div className="text-4xl mb-6">👑</div>
          <h1 className="text-lg md:text-xl font-bold text-deep-blue mb-2">Elite Exclusive</h1>
          <p className="text-text-light mb-4 text-sm md:text-base">
            Only Dopamind Elite subscribers can access AI Soundscape.
          </p>
          <Button variant="outline" onClick={() => navigate(-1)} className="w-full sm:w-auto">
            Back
          </Button>
        </div>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    // Placeholder for AI audio generation
    setTimeout(() => {
      setGeneratedAudio(`Generated audio for: ${prompt}`);
      setIsGenerating(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-light-gray py-4 md:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="text-sm md:text-base"
          >
            ← Back
          </Button>
          <h1 className="text-xl md:text-2xl font-bold text-deep-blue">AI Soundscape</h1>
          <div className="w-16"></div>
        </div>

        <div className="grid gap-6 md:gap-8">
          {/* Generation Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-deep-blue">
                <span className="text-2xl">🎵</span>
                Generate Your Soundscape
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-deep-blue mb-2">
                  Describe your perfect mindfulness audio
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., Gentle rain sounds with soft piano melodies for deep relaxation..."
                  className="w-full h-20 md:h-24 px-3 py-2 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm md:text-base"
                  disabled={isGenerating}
                />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium py-2 md:py-3 rounded-xl"
              >
                {isGenerating ? 'Generating...' : 'Generate Soundscape'}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Audio Card */}
          {generatedAudio && (
            <Card className="animate-fade-in-up">
              <CardHeader>
                <CardTitle className="text-deep-blue">Your Generated Soundscape</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-xl">
                  <p className="text-sm text-deep-blue mb-3">Generated audio:</p>
                  <div className="bg-white p-3 rounded-lg border border-purple-200">
                    <p className="text-sm text-text-light">{generatedAudio}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="flex-1 bg-mint-green hover:bg-mint-green/90">
                    Play
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Download
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Save to Library
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feature Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-deep-blue">About AI Soundscape</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <p className="text-text-light text-sm md:text-base">
                Create personalized mindfulness audio experiences using advanced AI. Simply describe the atmosphere, 
                instruments, or feelings you want, and our AI will generate unique soundscapes tailored to your needs.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 md:gap-4 mt-4">
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <span className="text-lg">🎧</span>
                  <span className="text-sm text-deep-blue">High-quality audio generation</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <span className="text-lg">⚡</span>
                  <span className="text-sm text-deep-blue">Fast processing</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <span className="text-lg">🎯</span>
                  <span className="text-sm text-deep-blue">Personalized results</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <span className="text-lg">💾</span>
                  <span className="text-sm text-deep-blue">Save & organize</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AISoundscape;
