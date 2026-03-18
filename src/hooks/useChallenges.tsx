import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  challengeType: string;
  targetValue: number;
  xpReward: number;
  startsAt: Date;
  endsAt: Date;
  // Participant data
  joined: boolean;
  progress: number;
  completed: boolean;
}

export function useChallenges() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['challenges', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: challengesData, error: cErr } = await supabase
        .from('challenges')
        .select('*')
        .gte('ends_at', new Date().toISOString())
        .order('ends_at', { ascending: true });

      if (cErr) throw cErr;

      const { data: participations, error: pErr } = await supabase
        .from('challenge_participants')
        .select('*')
        .eq('user_id', user.id);

      if (pErr) throw pErr;

      const participationMap = new Map(
        (participations || []).map(p => [p.challenge_id, p])
      );

      return (challengesData || []).map(c => {
        const p = participationMap.get(c.id);
        return {
          id: c.id,
          title: c.title,
          description: c.description,
          icon: c.icon,
          challengeType: c.challenge_type,
          targetValue: c.target_value,
          xpReward: c.xp_reward,
          startsAt: new Date(c.starts_at),
          endsAt: new Date(c.ends_at),
          joined: !!p,
          progress: p?.progress ?? 0,
          completed: p?.completed ?? false,
        } as Challenge;
      });
    },
    enabled: !!user,
  });

  const joinChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('challenge_participants')
        .insert({ challenge_id: challengeId, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast.success('¡Te uniste al reto!');
    },
    onError: (e) => toast.error('Error: ' + e.message),
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ challengeId, progress }: { challengeId: string; progress: number }) => {
      if (!user) throw new Error('Not authenticated');

      const challenge = challenges.find(c => c.id === challengeId);
      const completed = challenge ? progress >= challenge.targetValue : false;

      const { error } = await supabase
        .from('challenge_participants')
        .update({
          progress,
          completed,
          ...(completed ? { completed_at: new Date().toISOString() } : {}),
        })
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id);

      if (error) throw error;

      if (completed && challenge) {
        // Award XP - update directly
        const { data: profileData } = await supabase
          .from('profiles')
          .select('xp')
          .eq('user_id', user.id)
          .single();

        if (profileData) {
          await supabase
            .from('profiles')
            .update({ xp: ((profileData as any).xp || 0) + challenge.xpReward })
            .eq('user_id', user.id);
        }
        toast.success(`🎉 ¡Reto completado! +${challenge.xpReward} XP`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return {
    challenges,
    isLoading,
    joinChallenge: joinChallengeMutation.mutate,
    updateProgress: updateProgressMutation.mutate,
  };
}
