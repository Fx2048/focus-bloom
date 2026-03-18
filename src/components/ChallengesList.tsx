import { useChallenges, Challenge } from '@/hooks/useChallenges';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Swords, Clock, CheckCircle2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

function ChallengeCard({ challenge, onJoin }: { challenge: Challenge; onJoin: () => void }) {
  const progressPercent = Math.min((challenge.progress / challenge.targetValue) * 100, 100);
  const timeLeft = formatDistanceToNow(challenge.endsAt, { locale: es, addSuffix: false });

  return (
    <div className={cn(
      "p-4 rounded-xl border transition-all",
      challenge.completed
        ? "bg-primary/5 border-primary/30"
        : "bg-card border-border/50 hover:border-primary/30"
    )}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-2xl shrink-0">
          {challenge.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-foreground truncate">{challenge.title}</h4>
            {challenge.completed && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{challenge.description}</p>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1 text-xs text-accent font-semibold">
              <Zap className="w-3 h-3" />
              +{challenge.xpReward} XP
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {timeLeft}
            </div>
          </div>

          {challenge.joined && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">
                  {challenge.progress}/{challenge.targetValue}
                </span>
                <span className="text-xs font-semibold text-foreground">{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          )}

          {!challenge.joined && !challenge.completed && (
            <Button
              size="sm"
              variant="calm"
              className="mt-3 h-8 text-xs rounded-lg"
              onClick={onJoin}
            >
              Unirme al reto
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChallengesList() {
  const { challenges, isLoading, joinChallenge } = useChallenges();

  if (isLoading) {
    return (
      <div className="card-calm p-6 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <Swords className="w-5 h-5 text-accent" />
          <h3 className="font-bold text-lg">Retos</h3>
        </div>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card-calm p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-5">
        <Swords className="w-5 h-5 text-accent" />
        <h3 className="font-bold text-lg text-foreground">Retos Activos</h3>
      </div>

      <div className="space-y-3">
        {challenges.map(c => (
          <ChallengeCard
            key={c.id}
            challenge={c}
            onJoin={() => joinChallenge(c.id)}
          />
        ))}

        {challenges.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Swords className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No hay retos activos</p>
          </div>
        )}
      </div>
    </div>
  );
}
