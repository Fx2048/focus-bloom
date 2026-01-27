import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useProfile } from '@/hooks/useProfile';
import { useDailyLog } from '@/hooks/useDailyLog';
import { useBadges } from '@/hooks/useBadges';
import { usePomodoroSessions } from '@/hooks/usePomodoroSessions';
import { Header } from '@/components/Header';
import { BurnoutMeter } from '@/components/BurnoutMeter';
import { MotivationSlider } from '@/components/MotivationSlider';
import { KanbanBoard } from '@/components/KanbanBoard';
import { AddTaskForm } from '@/components/AddTaskForm';
import { PointsBadges } from '@/components/PointsBadges';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { AIDailyPlan } from '@/components/AIDailyPlan';
import { VoiceCommandButton } from '@/components/VoiceCommandButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CalendarPanel } from '@/components/CalendarPanel';
import { TaskEditDialog } from '@/components/TaskEditDialog';
import { Button } from '@/components/ui/button';
import { Plus, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BurnoutLevel, POINTS_PER_POMODORO, Task } from '@/types/focusflow';

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks, isLoading: tasksLoading, updateTaskStatus, updateTaskPomodoros, addTask, updateTask, deleteTask } = useTasks();
  const { profile, addPoints } = useProfile();
  const { motivationLevel, skippedBreaks, setMotivationLevel, incrementSkippedBreaks } = useDailyLog();
  const { badges, earnBadge } = useBadges();
  const { completedWorkSessions, createSession, completeSession } = usePomodoroSessions();
  
  const [showAddTask, setShowAddTask] = useState(false);
  const [activePomodoro, setActivePomodoro] = useState<{ taskId: string; taskName: string } | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Calculate burnout level
  const burnoutLevel = useMemo((): BurnoutLevel => {
    const hour = new Date().getHours();
    const completedToday = tasks.filter(t => t.status === 'completed').length;

    if (completedWorkSessions < 2 && hour < 14 && motivationLevel < 4) {
      return 'lazy';
    }
    
    if (
      completedWorkSessions > 8 || 
      skippedBreaks > 2 || 
      (hour > 20 && completedWorkSessions > 5) ||
      (completedToday > 4 && skippedBreaks > 1)
    ) {
      return 'burnout';
    }
    
    return 'balanced';
  }, [completedWorkSessions, skippedBreaks, motivationLevel, tasks]);

  const handleStartPomodoro = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setActivePomodoro({ taskId, taskName: task.name });
    }
  }, [tasks]);

  const handlePomodoroComplete = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      // Update task pomodoros
      updateTaskPomodoros(taskId, task.completedPomodoros + 1);
      // Add points
      addPoints(POINTS_PER_POMODORO);
      // Check for badges
      if (completedWorkSessions === 0) {
        earnBadge('first-focus');
      }
      if (completedWorkSessions >= 9) {
        earnBadge('consistency');
      }
      if (new Date().getHours() < 9) {
        earnBadge('early-bird');
      }
    }
  }, [tasks, updateTaskPomodoros, addPoints, completedWorkSessions, earnBadge]);

  const handleSkipBreak = useCallback(() => {
    incrementSkippedBreaks();
  }, [incrementSkippedBreaks]);

  const handleTaskComplete = useCallback((taskId: string) => {
    const completedToday = tasks.filter(t => t.status === 'completed').length + 1;
    if (completedToday >= 5) {
      earnBadge('task-master');
    }
    if (completedToday >= 3 && skippedBreaks === 0) {
      earnBadge('balanced-day');
    }
  }, [tasks, skippedBreaks, earnBadge]);

  if (tasksLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-6 pb-24 max-w-2xl mx-auto">
        {/* Greeting */}
        <div className="mb-6 animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {getGreeting()} 👋
          </h1>
          <p className="text-muted-foreground">
            {tasks.filter(t => t.status !== 'completed').length === 0
              ? "No tasks yet. Add one to get started!"
              : `You have ${tasks.filter(t => t.status !== 'completed').length} task${tasks.filter(t => t.status !== 'completed').length === 1 ? '' : 's'} to focus on.`}
          </p>
        </div>

        {/* Top cards grid */}
        <div className="grid gap-4 mb-6 sm:grid-cols-2">
          <MotivationSlider 
            motivationLevel={motivationLevel} 
            onMotivationChange={setMotivationLevel} 
          />
          <BurnoutMeter 
            burnoutLevel={burnoutLevel} 
            totalPomodoros={completedWorkSessions}
            skippedBreaks={skippedBreaks}
          />
        </div>

        {/* AI Daily Plan */}
        {tasks.length > 0 && (
          <div className="mb-6">
            <AIDailyPlan 
              tasks={tasks}
              motivationLevel={motivationLevel}
              maxDailyHours={profile?.maxDailyHours ?? 6}
              onStartTask={handleStartPomodoro}
            />
          </div>
        )}

        {/* Points & Badges */}
        <div className="mb-6">
          <PointsBadges 
            totalPoints={profile?.totalPoints ?? 0}
            badges={badges}
            completedTasksToday={tasks.filter(t => t.status === 'completed').length}
            totalPomodorosToday={completedWorkSessions}
          />
        </div>

        {/* Kanban Board */}
        <div className="mb-6">
          <KanbanBoard 
            tasks={tasks}
            onStartPomodoro={handleStartPomodoro}
            onUpdateStatus={(taskId, status) => {
              updateTaskStatus(taskId, status);
              if (status === 'completed') {
                handleTaskComplete(taskId);
              }
            }}
            onDeleteTask={deleteTask}
          />
        </div>

        {/* Add Task Modal */}
        {showAddTask && (
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-md card-elevated p-6 animate-slide-up">
              <AddTaskForm 
                onClose={() => setShowAddTask(false)} 
                onAddTask={(taskData) => {
                  addTask(taskData);
                  setShowAddTask(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Voice Command Button */}
        <VoiceCommandButton onTaskCreate={addTask} />

        {/* Calendar Panel */}
        <CalendarPanel 
          tasks={tasks} 
          onTaskClick={(task) => setEditingTask(task)} 
        />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Task Edit Dialog */}
        <TaskEditDialog
          task={editingTask}
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onSave={(taskId, updates) => updateTask(taskId, updates)}
          onDelete={(taskId) => deleteTask(taskId)}
        />

        {/* Floating Add Button */}
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            size="xl"
            variant={showAddTask ? "soft" : "calm"}
            onClick={() => setShowAddTask(!showAddTask)}
            className={cn(
              "rounded-full w-14 h-14 p-0 shadow-elevated",
              showAddTask && "rotate-45"
            )}
          >
            {showAddTask ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
          </Button>
        </div>

        {/* Pomodoro Timer Modal */}
        {activePomodoro && (
          <PomodoroTimer
            taskId={activePomodoro.taskId}
            taskName={activePomodoro.taskName}
            burnoutLevel={burnoutLevel}
            onComplete={() => handlePomodoroComplete(activePomodoro.taskId)}
            onSkipBreak={handleSkipBreak}
            onClose={() => setActivePomodoro(null)}
          />
        )}
      </main>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
