import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useDailyLog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: dailyLog, isLoading } = useQuery({
    queryKey: ['dailyLog', user?.id, today],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('log_date', today)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Create today's log if doesn't exist
        const { data: newLog, error: insertError } = await supabase
          .from('daily_logs')
          .insert({
            user_id: user.id,
            log_date: today,
            motivation_level: 5,
            skipped_breaks: 0,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newLog;
      }

      return data;
    },
    enabled: !!user,
  });

  const updateMotivationMutation = useMutation({
    mutationFn: async (motivationLevel: number) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('daily_logs')
        .update({ motivation_level: motivationLevel })
        .eq('user_id', user.id)
        .eq('log_date', today);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyLog'] });
    },
  });

  const incrementSkippedBreaksMutation = useMutation({
    mutationFn: async () => {
      if (!user || !dailyLog) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('daily_logs')
        .update({ skipped_breaks: dailyLog.skipped_breaks + 1 })
        .eq('user_id', user.id)
        .eq('log_date', today);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyLog'] });
    },
  });

  return {
    motivationLevel: dailyLog?.motivation_level ?? 5,
    skippedBreaks: dailyLog?.skipped_breaks ?? 0,
    isLoading,
    setMotivationLevel: updateMotivationMutation.mutate,
    incrementSkippedBreaks: incrementSkippedBreaksMutation.mutate,
  };
}
