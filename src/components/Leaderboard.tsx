import { useLeaderboard, calculateLevel } from '@/hooks/useLeaderboard';
import { Progress } from '@/components/ui/progress';
import { Trophy, Flame, Crown, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

const RANK_STYLES: Record<number, { icon: React.ReactNode; bg: string }> = {
  1: { icon: <Crown className="w-5 h-5 text-amber-500" />, bg: 'bg-amber-500/10 border-amber-500/30' },
  2: { icon: <Medal className="w-5 h-5 text-slate-400" />, bg: 'bg-slate-400/10 border-slate-400/30' },
  3: { icon: <Award className="w-5 h-5 text-amber-700" />, bg: 'bg-amber-700/10 border-amber-700/30' },
};

export function Leaderboard() {
  const { leaderboard, isLoading } = useLeaderboard();

  if (isLoading) {
    return (
      <div className="card-calm p-6 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-accent" />
          <h3 className="font-bold text-lg">Ranking</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card-calm p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-5">
        <Trophy className="w-5 h-5 text-accent" />
        <h3 className="font-bold text-lg text-foreground">Ranking Global</h3>
      </div>

      <div className="space-y-2">
        {leaderboard.slice(0, 10).map((entry) => {
          const levelInfo = calculateLevel(entry.xp);
          const rankStyle = RANK_STYLES[entry.rank];

          return (
            <div
              key={entry.userId}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-colors",
                entry.isCurrentUser
                  ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20"
                  : rankStyle?.bg || "bg-secondary/50 border-border/50"
              )}
            >
              {/* Rank */}
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                {rankStyle?.icon || (
                  <span className="text-sm font-bold text-muted-foreground">#{entry.rank}</span>
                )}
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl shrink-0">
                {entry.avatarEmoji}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm truncate text-foreground">
                    {entry.displayName}
                  </span>
                  {entry.isCurrentUser && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-bold">TÚ</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">Nv. {levelInfo.level}</span>
                  <Progress value={levelInfo.progress} className="h-1.5 flex-1 max-w-[80px]" />
                  {entry.streakDays > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-accent">
                      <Flame className="w-3 h-3" />{entry.streakDays}
                    </span>
                  )}
                </div>
              </div>

              {/* XP */}
              <div className="text-right shrink-0">
                <span className="text-sm font-bold text-foreground">{entry.xp}</span>
                <span className="text-xs text-muted-foreground ml-1">XP</span>
              </div>
            </div>
          );
        })}

        {leaderboard.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aún no hay participantes</p>
          </div>
        )}
      </div>
    </div>
  );
}
