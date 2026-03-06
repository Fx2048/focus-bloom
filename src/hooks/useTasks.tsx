import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { Task, Difficulty, TaskStatus } from '@/types/focusflow';

async function syncCalendarEvent(action: 'create' | 'update' | 'delete', taskId: string, googleCalendarEventId?: string) {
  try {
    await supabase.functions.invoke('google-calendar-event', {
      body: { action, taskId, googleCalendarEventId },
    });
  } catch (e) {
    // Silent fail — calendar sync is best-effort
    console.warn('Calendar sync failed:', e);
  }
}

export function useTasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(t => ({
        id: t.id,
        name: t.name,
        difficulty: t.difficulty as Difficulty,
        estimatedHours: Number(t.estimated_hours),
        scheduledDay: new Date(t.scheduled_day),
        status: t.status as TaskStatus,
        pomodoroSessions: t.pomodoro_sessions,
        completedPomodoros: t.completed_pomodoros,
        createdAt: new Date(t.created_at),
        completedAt: t.completed_at ? new Date(t.completed_at) : undefined,
        googleCalendarEventId: t.google_calendar_event_id ?? undefined,
      })) as Task[];
    },
    enabled: !!user,
  });

  const addTaskMutation = useMutation({
    mutationFn: async (taskData: Omit<Task, 'id' | 'createdAt' | 'pomodoroSessions' | 'completedPomodoros' | 'status'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const pomodoroSessions = Math.ceil(taskData.estimatedHours * 60 / 25);
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          name: taskData.name,
          difficulty: taskData.difficulty,
          estimated_hours: taskData.estimatedHours,
          scheduled_day: taskData.scheduledDay.toISOString().split('T')[0],
          pomodoro_sessions: pomodoroSessions,
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    },
    onSuccess: (taskId) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task added!');
      // Auto-sync to Google Calendar
      syncCalendarEvent('create', taskId);
    },
    onError: (error) => {
      toast.error('Failed to add task: ' + error.message);
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: TaskStatus }) => {
      const updateData: Record<string, unknown> = { status };
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;
      return taskId;
    },
    onSuccess: (taskId) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      // Auto-sync status change to Google Calendar
      syncCalendarEvent('update', taskId);
    },
    onError: (error) => {
      toast.error('Failed to update task: ' + error.message);
    },
  });

  const updateTaskPomodorosMutation = useMutation({
    mutationFn: async ({ taskId, completedPomodoros }: { taskId: string; completedPomodoros: number }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ completed_pomodoros: completedPomodoros })
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<{ name: string; difficulty: Difficulty; estimatedHours: number; scheduledDay: Date }> }) => {
      const updateData: Record<string, unknown> = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.difficulty !== undefined) updateData.difficulty = updates.difficulty;
      if (updates.estimatedHours !== undefined) {
        updateData.estimated_hours = updates.estimatedHours;
        updateData.pomodoro_sessions = Math.ceil(updates.estimatedHours * 60 / 25);
      }
      if (updates.scheduledDay !== undefined) {
        updateData.scheduled_day = updates.scheduledDay.toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;
      return taskId;
    },
    onSuccess: (taskId) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tarea actualizada');
      // Auto-sync update to Google Calendar
      syncCalendarEvent('update', taskId);
    },
    onError: (error) => {
      toast.error('Error al actualizar tarea: ' + error.message);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      // Get the task's Google Calendar event ID before deleting
      const task = tasks.find(t => t.id === taskId);
      const googleCalendarEventId = task?.googleCalendarEventId;

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      return { taskId, googleCalendarEventId };
    },
    onSuccess: ({ taskId, googleCalendarEventId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tarea eliminada');
      // Auto-delete from Google Calendar
      if (googleCalendarEventId) {
        syncCalendarEvent('delete', taskId, googleCalendarEventId);
      }
    },
    onError: (error) => {
      toast.error('Error al eliminar tarea: ' + error.message);
    },
  });

  return {
    tasks,
    isLoading,
    addTask: addTaskMutation.mutate,
    updateTaskStatus: (taskId: string, status: TaskStatus) => 
      updateTaskStatusMutation.mutate({ taskId, status }),
    updateTaskPomodoros: (taskId: string, completedPomodoros: number) =>
      updateTaskPomodorosMutation.mutate({ taskId, completedPomodoros }),
    updateTask: (taskId: string, updates: Partial<{ name: string; difficulty: Difficulty; estimatedHours: number; scheduledDay: Date }>) =>
      updateTaskMutation.mutate({ taskId, updates }),
    deleteTask: deleteTaskMutation.mutate,
  };
}
