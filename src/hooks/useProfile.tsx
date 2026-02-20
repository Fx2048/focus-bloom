import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Profile {
  id: string;
  userId: string;
  maxDailyHours: number;
  totalPoints: number;
}

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        maxDailyHours: data.max_daily_hours,
        totalPoints: data.total_points,
      } as Profile;
    },
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<{ maxDailyHours: number; totalPoints: number }>) => {
      if (!user) throw new Error('Not authenticated');

      const dbUpdates: Record<string, unknown> = {};
      if (updates.maxDailyHours !== undefined) dbUpdates.max_daily_hours = updates.maxDailyHours;
      if (updates.totalPoints !== undefined) dbUpdates.total_points = updates.totalPoints;

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      toast.error('Failed to update profile: ' + error.message);
    },
  });

  const addPointsMutation = useMutation({
    mutationFn: async (points: number) => {
      if (!user || !profile) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ total_points: profile.totalPoints + points })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return {
    profile,
    isLoading,
    updateProfile: updateProfileMutation.mutate,
    addPoints: addPointsMutation.mutate,
  };
}
