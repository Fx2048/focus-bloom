import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  Task, 
  PomodoroSession, 
  UserStats, 
  BurnoutLevel, 
  Badge,
  TaskStatus,
  AVAILABLE_BADGES,
  POINTS_PER_POMODORO,
  POINTS_PER_TASK,
  POINTS_BALANCED_BONUS
} from '@/types/focusflow';

interface FocusFlowContextType {
  // User state
  isAuthenticated: boolean;
  userEmail: string | null;
  maxDailyHours: number;
  setMaxDailyHours: (hours: number) => void;
  
  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'pomodoroSessions' | 'completedPomodoros' | 'status'>) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  deleteTask: (taskId: string) => void;
  
  // Motivation
  motivationLevel: number;
  setMotivationLevel: (level: number) => void;
  
  // Pomodoro
  currentSession: PomodoroSession | null;
  startPomodoro: (taskId: string) => void;
  completePomodoro: () => void;
  startBreak: () => void;
  skipBreak: () => void;
  
  // Stats & Gamification
  stats: UserStats;
  burnoutLevel: BurnoutLevel;
  
  // Auth
  login: (email: string) => void;
  logout: () => void;
}

const defaultStats: UserStats = {
  totalPomodoros: 0,
  totalPoints: 0,
  currentStreak: 0,
  badges: [],
  skippedBreaks: 0,
  completedTasksToday: 0,
};

const FocusFlowContext = createContext<FocusFlowContextType | undefined>(undefined);

export function FocusFlowProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [maxDailyHours, setMaxDailyHours] = useState(6);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [motivationLevel, setMotivationLevel] = useState(5);
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(null);
  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [burnoutLevel, setBurnoutLevel] = useState<BurnoutLevel>('balanced');

  // Calculate burnout level based on various factors
  const calculateBurnoutLevel = useCallback(() => {
    const hour = new Date().getHours();
    const completedToday = stats.completedTasksToday;
    const skippedBreaks = stats.skippedBreaks;
    const pomodorosToday = tasks.reduce((acc, t) => 
      t.status !== 'pending' ? acc + t.completedPomodoros : acc, 0
    );

    // Lazy: few pomodoros, early in day, low motivation
    if (pomodorosToday < 2 && hour < 14 && motivationLevel < 4) {
      return 'lazy';
    }
    
    // Burnout risk: many pomodoros, skipped breaks, late in day, high workload
    if (
      pomodorosToday > 8 || 
      skippedBreaks > 2 || 
      (hour > 20 && pomodorosToday > 5) ||
      (completedToday > 4 && skippedBreaks > 1)
    ) {
      return 'burnout';
    }
    
    return 'balanced';
  }, [stats, tasks, motivationLevel]);

  useEffect(() => {
    setBurnoutLevel(calculateBurnoutLevel());
  }, [calculateBurnoutLevel]);

  // Check for badge unlocks
  const checkBadges = useCallback((currentStats: UserStats): Badge[] => {
    const newBadges: Badge[] = [...currentStats.badges];
    const earnedIds = new Set(newBadges.map(b => b.id));

    AVAILABLE_BADGES.forEach(badge => {
      if (earnedIds.has(badge.id)) return;

      let earned = false;
      switch (badge.id) {
        case 'first-focus':
          earned = currentStats.totalPomodoros >= 1;
          break;
        case 'balanced-day':
          earned = currentStats.completedTasksToday >= 3 && currentStats.skippedBreaks === 0;
          break;
        case 'early-bird':
          earned = new Date().getHours() < 9 && currentStats.totalPomodoros >= 1;
          break;
        case 'task-master':
          earned = currentStats.completedTasksToday >= 5;
          break;
        case 'consistency':
          earned = currentStats.totalPomodoros >= 10;
          break;
        default:
          break;
      }

      if (earned) {
        newBadges.push({ ...badge, earnedAt: new Date() });
      }
    });

    return newBadges;
  }, []);

  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'pomodoroSessions' | 'completedPomodoros' | 'status'>) => {
    const pomodoroSessions = Math.ceil(taskData.estimatedHours * 60 / 25);
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      status: 'pending',
      pomodoroSessions,
      completedPomodoros: 0,
    };
    setTasks(prev => [...prev, newTask]);
  }, []);

  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;
      if (task.status === 'completed') return task; // Cannot move completed tasks
      
      const updatedTask = { ...task, status };
      if (status === 'completed') {
        updatedTask.completedAt = new Date();
        setStats(prev => {
          const updated = {
            ...prev,
            totalPoints: prev.totalPoints + POINTS_PER_TASK,
            completedTasksToday: prev.completedTasksToday + 1,
          };
          return { ...updated, badges: checkBadges(updated) };
        });
      }
      return updatedTask;
    }));
  }, [checkBadges]);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  const startPomodoro = useCallback((taskId: string) => {
    const session: PomodoroSession = {
      id: crypto.randomUUID(),
      taskId,
      startTime: new Date(),
      type: 'work',
      completed: false,
    };
    setCurrentSession(session);
  }, []);

  const completePomodoro = useCallback(() => {
    if (!currentSession) return;
    
    setCurrentSession(prev => prev ? { ...prev, completed: true, endTime: new Date() } : null);
    
    // Update task progress
    setTasks(prev => prev.map(task => {
      if (task.id !== currentSession.taskId) return task;
      return { ...task, completedPomodoros: task.completedPomodoros + 1 };
    }));
    
    // Update stats
    setStats(prev => {
      const updated = {
        ...prev,
        totalPomodoros: prev.totalPomodoros + 1,
        totalPoints: prev.totalPoints + POINTS_PER_POMODORO,
      };
      return { ...updated, badges: checkBadges(updated) };
    });
    
    setCurrentSession(null);
  }, [currentSession, checkBadges]);

  const startBreak = useCallback(() => {
    if (!currentSession) return;
    
    const breakSession: PomodoroSession = {
      id: crypto.randomUUID(),
      taskId: currentSession.taskId,
      startTime: new Date(),
      type: 'break',
      completed: false,
    };
    setCurrentSession(breakSession);
  }, [currentSession]);

  const skipBreak = useCallback(() => {
    setStats(prev => ({ ...prev, skippedBreaks: prev.skippedBreaks + 1 }));
    setCurrentSession(null);
  }, []);

  const login = useCallback((email: string) => {
    setUserEmail(email);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    setUserEmail(null);
    setIsAuthenticated(false);
    setTasks([]);
    setStats(defaultStats);
  }, []);

  return (
    <FocusFlowContext.Provider
      value={{
        isAuthenticated,
        userEmail,
        maxDailyHours,
        setMaxDailyHours,
        tasks,
        addTask,
        updateTaskStatus,
        deleteTask,
        motivationLevel,
        setMotivationLevel,
        currentSession,
        startPomodoro,
        completePomodoro,
        startBreak,
        skipBreak,
        stats,
        burnoutLevel,
        login,
        logout,
      }}
    >
      {children}
    </FocusFlowContext.Provider>
  );
}

export function useFocusFlow() {
  const context = useContext(FocusFlowContext);
  if (context === undefined) {
    throw new Error('useFocusFlow must be used within a FocusFlowProvider');
  }
  return context;
}
