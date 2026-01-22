import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { AVAILABLE_BADGES, Badge } from '@/types/focusflow';

export function useBadges() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: earnedBadges = [], isLoading } = useQuery({
    queryKey: ['badges', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('badges_earned')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      return (data || []).map(b => {
        const badgeInfo = AVAILABLE_BADGES.find(ab => ab.id === b.badge_id);
        return {
          id: b.badge_id,
          name: badgeInfo?.name ?? b.badge_id,
          description: badgeInfo?.description ?? '',
          icon: badgeInfo?.icon ?? '🏆',
          earnedAt: new Date(b.earned_at),
        } as Badge;
      });
    },
    enabled: !!user,
  });

  const earnBadgeMutation = useMutation({
    mutationFn: async (badgeId: string) => {
      if (!user) throw new Error('Not authenticated');

      // Check if already earned
      const alreadyEarned = earnedBadges.some(b => b.id === badgeId);
      if (alreadyEarned) return;

      const { error } = await supabase
        .from('badges_earned')
        .insert({
          user_id: user.id,
          badge_id: badgeId,
        });

      // Ignore unique constraint violation (already earned)
      if (error && !error.message.includes('duplicate')) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
    },
  });

  return {
    badges: earnedBadges,
    isLoading,
    earnBadge: earnBadgeMutation.mutate,
  };
}
