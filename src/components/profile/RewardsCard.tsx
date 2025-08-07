import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Flame, MessageSquare, Focus, Wind, Heart, Gift } from 'lucide-react';

interface TaskStreak {
  taskType: string;
  currentStreak: number;
  totalCompletions: number;
  lastCompletedDate?: string;
}

interface PendingReward {
  id: string;
  rewardType: string;
  amount: number;
  weekStartDate: string;
  weekEndDate: string;
  claimed: boolean;
}

interface RewardsCardProps {
  taskStreaks: TaskStreak[];
  pendingRewards: PendingReward[];
  totalDopamineEarned: number;
  onClaimReward: (rewardId: string) => void;
}

const RewardsCard: React.FC<RewardsCardProps> = ({
  taskStreaks,
  pendingRewards,
  totalDopamineEarned,
  onClaimReward
}) => {
  const getTaskIcon = (taskType: string) => {
    switch (taskType) {
      case 'ai_chat':
        return <MessageSquare className="h-4 w-4" />;
      case 'focus_session':
        return <Focus className="h-4 w-4" />;
      case 'breathing_exercise':
        return <Wind className="h-4 w-4" />;
      case 'mood_entry':
        return <Heart className="h-4 w-4" />;
      default:
        return <Trophy className="h-4 w-4" />;
    }
  };

  const getTaskLabel = (taskType: string) => {
    switch (taskType) {
      case 'ai_chat':
        return 'AI Chat Sessions';
      case 'focus_session':
        return 'Focus Sessions';
      case 'breathing_exercise':
        return 'Breathing Exercises';
      case 'mood_entry':
        return 'Mood Entries';
      default:
        return taskType;
    }
  };

  const getRewardAmount = (taskType: string) => {
    switch (taskType) {
      case 'ai_chat':
        return 100;
      case 'focus_session':
        return 150;
      case 'breathing_exercise':
        return 75;
      case 'mood_entry':
        return 50;
      default:
        return 25;
    }
  };

  return (
    <Card className="dopamind-card animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-text-dark flex items-center gap-2">
          <Trophy className="h-5 w-5 text-accent-gold" />
          DOPAMINE Rewards
        </CardTitle>
        <CardDescription className="text-text-secondary">
          Complete daily tasks for 7 days to earn weekly DOPAMINE tokens
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Total Earned */}
        <div className="bg-gradient-to-r from-mint-green/10 to-calming-blue/10 rounded-lg p-4 border border-mint-green/20">
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Total DOPAMINE Earned</span>
            <span className="text-xl font-bold text-mint-green">{totalDopamineEarned} DOP</span>
          </div>
        </div>

        {/* Pending Rewards */}
        {pendingRewards.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-text-dark flex items-center gap-2">
              <Gift className="h-4 w-4 text-accent-gold" />
              Pending Rewards
            </h4>
            {pendingRewards.map((reward, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-soft-gray rounded-lg">
                <div>
                  <p className="font-medium text-text-dark">{getTaskLabel(reward.rewardType.replace('weekly_streak_', ''))}</p>
                  <p className="text-sm text-text-secondary">Week completed</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-accent-gold/10 text-accent-gold">
                    +{reward.amount} DOP
                  </Badge>
                  <Button 
                    size="sm"
                    onClick={() => onClaimReward(reward.id)}
                    className="bg-mint-green text-white hover:bg-mint-green/90"
                  >
                    Claim
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Current Streaks */}
        <div className="space-y-3">
          <h4 className="font-medium text-text-dark flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            Current Streaks
          </h4>
          
          {taskStreaks.map((streak, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTaskIcon(streak.taskType)}
                  <span className="text-sm font-medium">{getTaskLabel(streak.taskType)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={streak.currentStreak >= 7 ? "default" : "secondary"}
                    className={streak.currentStreak >= 7 ? "bg-mint-green text-white" : ""}
                  >
                    {streak.currentStreak}/7 days
                  </Badge>
                  {streak.currentStreak >= 7 && (
                    <span className="text-xs text-accent-gold">+{getRewardAmount(streak.taskType)} DOP</span>
                  )}
                </div>
              </div>
              
              <Progress 
                value={(streak.currentStreak / 7) * 100} 
                className="h-2"
              />
            </div>
          ))}
        </div>

        {/* Requirements */}
        <div className="bg-soft-gray rounded-lg p-4">
          <h5 className="font-medium text-text-dark mb-2">Weekly Requirements</h5>
          <div className="space-y-1 text-sm text-text-secondary">
            <p>• AI Chat: 5+ minutes daily for 7 days → 100 DOP</p>
            <p>• Focus Session: 10+ minutes daily for 7 days → 150 DOP</p>
            <p>• Breathing: 10+ cycles daily for 7 days → 75 DOP</p>
            <p>• Mood Entry: 1 entry daily for 7 days → 50 DOP</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RewardsCard;