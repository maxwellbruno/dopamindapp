import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import RewardsCard from '../components/profile/RewardsCard';
import { useRewards } from '@/hooks/useRewards';
import { toast } from 'sonner';

const Rewards: React.FC = () => {
  const navigate = useNavigate();
  const { taskStreaks, pendingRewards, totalDopamineEarned, claimReward } = useRewards();

  const handleClaimReward = async (rewardId: string) => {
    try {
      await claimReward(rewardId);
      toast.success('Reward claimed successfully!');
    } catch (error) {
      toast.error('Failed to claim reward');
      console.error('Claim reward error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-light-gray pb-20">
      <div className="px-4 pt-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <h1 className="text-2xl font-bold text-text-dark">Rewards</h1>
          </div>

          <RewardsCard
            taskStreaks={taskStreaks}
            pendingRewards={pendingRewards}
            totalDopamineEarned={totalDopamineEarned}
            onClaimReward={handleClaimReward}
          />
        </div>
      </div>
    </div>
  );
};

export default Rewards;
