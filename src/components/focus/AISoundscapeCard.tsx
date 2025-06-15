
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music } from 'lucide-react';

interface AISoundscapeCardProps {
  isElite: boolean;
}

const AISoundscapeCard: React.FC<AISoundscapeCardProps> = ({ isElite }) => {
  const navigate = useNavigate();

  if (!isElite) {
    return null;
  }

  const handleNavigate = () => {
    navigate('/ai-soundscape');
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 hover:border-purple-300 transition-all duration-200 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-deep-blue mb-1">AI Soundscape</h3>
              <p className="text-sm text-text-light">Generate personalized mindfulness audio with AI</p>
            </div>
          </div>
          <Button 
            onClick={handleNavigate}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium px-6 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            Explore
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AISoundscapeCard;
