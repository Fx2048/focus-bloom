import { useProfile } from '@/hooks/useProfile';
import { calculateLevel } from '@/hooks/useLeaderboard';
import { Progress } from '@/components/ui/progress';
import { Star, Flame, TrendingUp } from 'lucide-react';

const LEVEL_TITLES = [
  'Novato', 'Aprendiz', 'Estudiante', 'Enfocado', 'Dedicado',
  'Experto', 'Maestro', 'Leyenda', 'Titán', 'Inmortal', 'Trascendente',
];

export function LevelProgress() {
  const { profile } = useProfile();

  const xp = (profile as any)?.xp ?? profile?.totalPoints ?? 0;
  const streakDays = (profile as any)?.streakDays ?? 0;
  const levelInfo = calculateLevel(xp);
  const title = LEVEL_TITLES[levelInfo.level - 1] || 'Leyenda';

  return (
    <div className="card-calm p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <span className="text-3xl font-bold text-primary">{levelInfo.level}</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Nivel</p>
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {streakDays > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10">
              <Flame className="w-4 h-4 text-accent" />
              <span className="text-sm font-bold text-accent">{streakDays}d</span>
            </div>
          )}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10">
            <Star className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary">{xp} XP</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Progreso al nivel {levelInfo.level + 1}
          </span>
          <span className="text-xs font-semibold text-foreground">
            {levelInfo.currentXp}/{levelInfo.nextLevelXp} XP
          </span>
        </div>
        <Progress value={levelInfo.progress} className="h-3 rounded-full" />
      </div>
    </div>
  );
}
