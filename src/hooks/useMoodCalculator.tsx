import { useMemo } from 'react';
import type { Task } from '@/types/focusflow';

interface MoodCalculatorInput {
  tasks: Task[];
  completedWorkSessions: number;
}

export function useMoodCalculator({ tasks, completedWorkSessions }: MoodCalculatorInput) {
  const suggestedMood = useMemo(() => {
    const pendingTasks = tasks.filter(t => t.status !== 'completed');
    const completedToday = tasks.filter(t => t.status === 'completed').length;
    
    // Start at 6 (neutral-positive)
    let score = 6;
    
    // Penalty for too many pending tasks
    if (pendingTasks.length > 8) score -= 2;
    else if (pendingTasks.length > 5) score -= 1;
    else if (pendingTasks.length <= 2) score += 1;
    
    // Penalty for hard pending tasks
    const hardPending = pendingTasks.filter(t => t.difficulty === 'high').length;
    if (hardPending >= 3) score -= 2;
    else if (hardPending >= 2) score -= 1;
    
    // Boost for completed tasks (streak)
    if (completedToday >= 5) score += 2;
    else if (completedToday >= 3) score += 1;
    
    // Boost for pomodoro sessions
    if (completedWorkSessions >= 4) score += 1;
    
    // Clamp between 1 and 10
    return Math.max(1, Math.min(10, score));
  }, [tasks, completedWorkSessions]);

  return { suggestedMood };
}
