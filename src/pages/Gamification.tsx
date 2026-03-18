import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { LevelProgress } from '@/components/LevelProgress';
import { Leaderboard } from '@/components/Leaderboard';
import { ChallengesList } from '@/components/ChallengesList';
import { PointsBadges } from '@/components/PointsBadges';
import { GamificationTutorial, useGamificationTutorial } from '@/components/GamificationTutorial';
import { useBadges } from '@/hooks/useBadges';
import { useProfile } from '@/hooks/useProfile';
import { usePomodoroSessions } from '@/hooks/usePomodoroSessions';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Gamification() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { badges } = useBadges();
  const { profile } = useProfile();
  const { completedWorkSessions } = usePomodoroSessions();
  const { tasks } = useTasks();
  const { showTutorial, markTutorialDone } = useGamificationTutorial();
  const [showTutorialModal, setShowTutorialModal] = useState(showTutorial);

  const completedToday = tasks.filter(t => t.status === 'completed').length;

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-6 pb-20 max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">🏆 Gamificación</h1>
        </div>

        <LevelProgress />

        <PointsBadges
          totalPoints={profile?.totalPoints ?? 0}
          badges={badges}
          completedTasksToday={completedToday}
          totalPomodorosToday={completedWorkSessions}
        />

        <ChallengesList />

        <Leaderboard />
      </main>
    </div>
  );
}
