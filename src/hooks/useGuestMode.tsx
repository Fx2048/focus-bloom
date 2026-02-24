import { useState, useCallback } from 'react';
import type { Task, Difficulty, TaskStatus } from '@/types/focusflow';
import { toast } from 'sonner';

const GUEST_TASKS_KEY = 'tizza-guest-tasks';

function loadGuestTasks(): Task[] {
  try {
    const raw = localStorage.getItem(GUEST_TASKS_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map((t: any) => ({
      ...t,
      scheduledDay: new Date(t.scheduledDay),
      createdAt: new Date(t.createdAt),
      completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
    }));
  } catch {
    return [];
  }
}

function saveGuestTasks(tasks: Task[]) {
  localStorage.setItem(GUEST_TASKS_KEY, JSON.stringify(tasks));
}

export function useGuestTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadGuestTasks);

  const addTask = useCallback((taskData: { name: string; difficulty: Difficulty; estimatedHours: number; scheduledDay: Date }) => {
    const pomodoroSessions = Math.ceil(taskData.estimatedHours * 60 / 25);
    const newTask: Task = {
      id: `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: taskData.name,
      difficulty: taskData.difficulty,
      estimatedHours: taskData.estimatedHours,
      scheduledDay: taskData.scheduledDay,
      status: 'pending',
      pomodoroSessions,
      completedPomodoros: 0,
      createdAt: new Date(),
    };
    setTasks(prev => {
      const updated = [newTask, ...prev];
      saveGuestTasks(updated);
      return updated;
    });
    toast.success('¡Tarea agregada!');
  }, []);

  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    setTasks(prev => {
      const updated = prev.map(t =>
        t.id === taskId
          ? { ...t, status, completedAt: status === 'completed' ? new Date() : undefined }
          : t
      );
      saveGuestTasks(updated);
      return updated;
    });
  }, []);

  const updateTaskPomodoros = useCallback((taskId: string, completedPomodoros: number) => {
    setTasks(prev => {
      const updated = prev.map(t =>
        t.id === taskId ? { ...t, completedPomodoros } : t
      );
      saveGuestTasks(updated);
      return updated;
    });
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<{ name: string; difficulty: Difficulty; estimatedHours: number; scheduledDay: Date }>) => {
    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id !== taskId) return t;
        const u = { ...t, ...updates };
        if (updates.estimatedHours) {
          u.pomodoroSessions = Math.ceil(updates.estimatedHours * 60 / 25);
        }
        return u;
      });
      saveGuestTasks(updated);
      return updated;
    });
    toast.success('Tarea actualizada');
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => {
      const updated = prev.filter(t => t.id !== taskId);
      saveGuestTasks(updated);
      return updated;
    });
    toast.success('Tarea eliminada');
  }, []);

  return {
    tasks,
    isLoading: false,
    addTask,
    updateTaskStatus,
    updateTaskPomodoros,
    updateTask,
    deleteTask,
  };
}
