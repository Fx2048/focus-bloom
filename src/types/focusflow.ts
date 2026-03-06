export type Difficulty = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type BurnoutLevel = 'lazy' | 'balanced' | 'burnout';

export interface Task {
  id: string;
  name: string;
  difficulty: Difficulty;
  estimatedHours: number;
  scheduledDay: Date;
  status: TaskStatus;
  pomodoroSessions: number;
  completedPomodoros: number;
  createdAt: Date;
  completedAt?: Date;
  googleCalendarEventId?: string;
}

export interface PomodoroSession {
  id: string;
  taskId: string;
  startTime: Date;
  endTime?: Date;
  type: 'work' | 'break';
  completed: boolean;
  skippedBreak?: boolean;
}

export interface DailyPlan {
  id: string;
  date: Date;
  tasks: PlannedTask[];
  maxHours: number;
  motivationLevel: number;
  generatedAt: Date;
}

export interface PlannedTask {
  taskId: string;
  scheduledTime: string;
  duration: number;
  order: number;
}

export interface UserStats {
  totalPomodoros: number;
  totalPoints: number;
  currentStreak: number;
  badges: Badge[];
  skippedBreaks: number;
  completedTasksToday: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  maxDailyHours: number;
  createdAt: Date;
}

// Pomodoro constants
export const POMODORO_WORK_MINUTES = 25;
export const POMODORO_BREAK_MINUTES = 5;
export const POMODORO_LONG_BREAK_MINUTES = 15;
export const POMODOROS_BEFORE_LONG_BREAK = 4;

// Points system
export const POINTS_PER_POMODORO = 10;
export const POINTS_PER_TASK = 25;
export const POINTS_BALANCED_BONUS = 15;

// Badges definitions
export const AVAILABLE_BADGES: Omit<Badge, 'earnedAt'>[] = [
  { id: 'first-focus', name: 'First Focus', description: 'Complete your first Pomodoro session', icon: '🎯' },
  { id: 'balanced-day', name: 'Balanced Day', description: 'Complete a day without skipping breaks', icon: '⚖️' },
  { id: 'early-bird', name: 'Early Bird', description: 'Start a session before 9 AM', icon: '🌅' },
  { id: 'task-master', name: 'Task Master', description: 'Complete 5 tasks in one day', icon: '✨' },
  { id: 'zen-mode', name: 'Zen Mode', description: 'Stay in balanced zone for 3 hours', icon: '🧘' },
  { id: 'consistency', name: 'Consistency', description: 'Complete 10 Pomodoro sessions', icon: '💪' },
];
