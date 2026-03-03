import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { startOfWeek, endOfWeek, subWeeks, format, eachDayOfInterval, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export interface DayStats {
  date: string;
  label: string;
  pomodoros: number;
  tasksCompleted: number;
  motivationLevel: number;
  skippedBreaks: number;
}

export function useAnalytics(range: 'week' | 'month' = 'week') {
  const { user } = useAuth();

  const now = new Date();
  const start = range === 'week' 
    ? startOfWeek(now, { weekStartsOn: 1 }) 
    : startOfMonth(now);
  const end = range === 'week' 
    ? endOfWeek(now, { weekStartsOn: 1 }) 
    : endOfMonth(now);

  const prevStart = range === 'week'
    ? startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
    : startOfMonth(subMonths(now, 1));
  const prevEnd = range === 'week'
    ? endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
    : endOfMonth(subMonths(now, 1));

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', user?.id, range],
    queryFn: async () => {
      if (!user) return null;

      const startStr = format(prevStart, 'yyyy-MM-dd');
      const endStr = format(end, 'yyyy-MM-dd');

      const [sessionsRes, tasksRes, logsRes] = await Promise.all([
        supabase
          .from('pomodoro_sessions')
          .select('*')
          .eq('user_id', user.id)
          .gte('started_at', `${startStr}T00:00:00`)
          .lte('started_at', `${endStr}T23:59:59`),
        supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .not('completed_at', 'is', null)
          .gte('completed_at', `${startStr}T00:00:00`)
          .lte('completed_at', `${endStr}T23:59:59`),
        supabase
          .from('daily_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('log_date', startStr)
          .lte('log_date', endStr),
      ]);

      if (sessionsRes.error) throw sessionsRes.error;
      if (tasksRes.error) throw tasksRes.error;
      if (logsRes.error) throw logsRes.error;

      const sessions = sessionsRes.data || [];
      const tasks = tasksRes.data || [];
      const logs = logsRes.data || [];

      const buildDayStats = (interval: Date[]): DayStats[] => {
        return interval.map(day => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const dayLabel = format(day, range === 'week' ? 'EEE' : 'dd');

          const dayPomodoros = sessions.filter(
            s => s.started_at.startsWith(dayStr) && s.session_type === 'work' && s.completed
          ).length;

          const dayTasks = tasks.filter(
            t => t.completed_at?.startsWith(dayStr)
          ).length;

          const dayLog = logs.find(l => l.log_date === dayStr);

          return {
            date: dayStr,
            label: dayLabel,
            pomodoros: dayPomodoros,
            tasksCompleted: dayTasks,
            motivationLevel: dayLog?.motivation_level ?? 0,
            skippedBreaks: dayLog?.skipped_breaks ?? 0,
          };
        });
      };

      const currentDays = eachDayOfInterval({ start, end });
      const prevDays = eachDayOfInterval({ start: prevStart, end: prevEnd });

      const currentStats = buildDayStats(currentDays);
      const prevStats = buildDayStats(prevDays);

      const sumPomodoros = (stats: DayStats[]) => stats.reduce((a, b) => a + b.pomodoros, 0);
      const sumTasks = (stats: DayStats[]) => stats.reduce((a, b) => a + b.tasksCompleted, 0);
      const avgMood = (stats: DayStats[]) => {
        const withData = stats.filter(s => s.motivationLevel > 0);
        return withData.length ? withData.reduce((a, b) => a + b.motivationLevel, 0) / withData.length : 0;
      };

      return {
        current: currentStats,
        previous: prevStats,
        totals: {
          pomodoros: sumPomodoros(currentStats),
          prevPomodoros: sumPomodoros(prevStats),
          tasks: sumTasks(currentStats),
          prevTasks: sumTasks(prevStats),
          avgMood: avgMood(currentStats),
          prevAvgMood: avgMood(prevStats),
          skippedBreaks: currentStats.reduce((a, b) => a + b.skippedBreaks, 0),
        },
      };
    },
    enabled: !!user,
  });

  return { data, isLoading };
}
