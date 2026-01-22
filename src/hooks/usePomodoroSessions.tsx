import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function usePomodoroSessions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: todaySessions = [], isLoading } = useQuery({
    queryKey: ['pomodoroSessions', user?.id, today],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('started_at', `${today}T00:00:00`)
        .lte('started_at', `${today}T23:59:59`);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const createSessionMutation = useMutation({
    mutationFn: async ({ taskId, sessionType }: { taskId: string; sessionType: 'work' | 'break' }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .insert({
          user_id: user.id,
          task_id: taskId,
          session_type: sessionType,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pomodoroSessions'] });
    },
  });

  const completeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('pomodoro_sessions')
        .update({ completed: true, ended_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pomodoroSessions'] });
    },
  });

  const completedWorkSessions = todaySessions.filter(
    s => s.session_type === 'work' && s.completed
  ).length;

  return {
    todaySessions,
    completedWorkSessions,
    isLoading,
    createSession: createSessionMutation.mutateAsync,
    completeSession: completeSessionMutation.mutate,
  };
}
