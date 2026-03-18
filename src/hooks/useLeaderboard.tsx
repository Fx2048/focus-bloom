import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarEmoji: string;
  xp: number;
  level: number;
  totalPoints: number;
  streakDays: number;
  rank: number;
  isCurrentUser: boolean;
}

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000, 18000];

export function calculateLevel(xp: number): { level: number; currentXp: number; nextLevelXp: number; progress: number } {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || currentThreshold + 5000;
  const progress = ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return { level, currentXp: xp - currentThreshold, nextLevelXp: nextThreshold - currentThreshold, progress };
}

export function useLeaderboard() {
  const { user } = useAuth();

  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_emoji, xp, level, total_points, streak_days')
        .order('xp', { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map((p, index) => ({
        userId: p.user_id,
        displayName: p.display_name || `Estudiante ${index + 1}`,
        avatarEmoji: p.avatar_emoji || '🧑‍💻',
        xp: p.xp || 0,
        level: calculateLevel(p.xp || 0).level,
        totalPoints: p.total_points || 0,
        streakDays: p.streak_days || 0,
        rank: index + 1,
        isCurrentUser: p.user_id === user?.id,
      } as LeaderboardEntry));
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  return { leaderboard, isLoading };
}
