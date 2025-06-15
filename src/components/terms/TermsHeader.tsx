
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Brain } from 'lucide-react';

const TermsHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </Button>
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-mint-green/20 rounded-2xl flex items-center justify-center">
          <Brain className="text-mint-green" size={24} />
        </div>
        <h1 className="text-2xl font-bold text-deep-blue dark:text-pure-white">Dopamind</h1>
      </div>
    </div>
  );
};

export default TermsHeader;
