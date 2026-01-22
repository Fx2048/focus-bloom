import { Badge } from '@/types/focusflow';
import { cn } from '@/lib/utils';
import { Star, Award, Sparkles } from 'lucide-react';

interface PointsBadgesProps {
  totalPoints: number;
  badges: Badge[];
  completedTasksToday: number;
  totalPomodorosToday: number;
}

export function PointsBadges({ totalPoints, badges, completedTasksToday, totalPomodorosToday }: PointsBadgesProps) {
  const todayPoints = completedTasksToday * 25 + totalPomodorosToday * 10;

  return (
    <div className="card-calm p-4 animate-fade-in">
      {/* Points display */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <Star className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Points</p>
            <p className="text-2xl font-bold text-foreground">{totalPoints}</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Today</p>
          <p className="text-lg font-semibold text-primary">
            +{todayPoints}
          </p>
        </div>
      </div>

      {/* Badges */}
      <div className="border-t border-border pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-primary" />
          <h4 className="font-semibold text-sm">Badges</h4>
        </div>

        {badges.length === 0 ? (
          <div className="text-center py-4">
            <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Complete tasks to earn badges!
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="group relative px-3 py-2 rounded-xl bg-secondary hover:bg-primary/10 transition-colors cursor-default"
              >
                <span className="text-xl">{badge.icon}</span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-foreground text-background text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                  <p className="font-semibold">{badge.name}</p>
                  <p className="text-background/70">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
